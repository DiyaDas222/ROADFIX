from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models.user import User
from models.service_request import ServiceRequest
from models.complaint import Complaint
from models.review import Review
from models.service_price import ServicePrice

support_bp = Blueprint("support", __name__, url_prefix="/api/support")


def get_user():
    try:
        return User.query.get(int(get_jwt_identity()))
    except (TypeError, ValueError):
        return None


# SERVICE PRICING

@support_bp.get("/prices")
def get_prices():
    prices = ServicePrice.query.order_by(ServicePrice.service_name).all()

    return jsonify({
        "prices": [p.to_dict() for p in prices]
    })


@support_bp.post("/prices")
@jwt_required()
def add_price():
    user = get_user()

    if not user or user.role != "admin":
        return jsonify({"message": "Admin access required"}), 403

    data = request.get_json() or {}

    name = str(data.get("service_name", "")).strip()

    try:
        amount = float(data.get("base_price"))
    except (TypeError, ValueError):
        return jsonify({"message": "Invalid price"}), 400

    if not name or amount < 0:
        return jsonify({"message": "Invalid service details"}), 400

    price = ServicePrice.query.filter_by(service_name=name).first()

    if price:
        price.base_price = amount
        price.description = data.get("description")
    else:
        price = ServicePrice(
            service_name=name,
            base_price=amount,
            description=data.get("description")
        )
        db.session.add(price)

    db.session.commit()

    return jsonify({
        "message": "Service price saved",
        "price": price.to_dict()
    }), 200


# CUSTOMER COMPLAINTS

@support_bp.post("/complaints")
@jwt_required()
def create_complaint():
    user = get_user()

    if not user or user.role != "customer":
        return jsonify({"message": "Customer access required"}), 403

    data = request.get_json() or {}

    subject = str(data.get("subject", "")).strip()
    description = str(data.get("description", "")).strip()
    request_id = data.get("service_request_id")

    if not subject or not description:
        return jsonify({"message": "Subject and description are required"}), 400

    if request_id:
        service = ServiceRequest.query.filter_by(
            id=request_id,
            customer_id=user.id
        ).first()

        if not service:
            return jsonify({"message": "Invalid service request"}), 404

    complaint = Complaint(
        customer_id=user.id,
        service_request_id=request_id,
        subject=subject,
        description=description
    )

    db.session.add(complaint)
    db.session.commit()

    return jsonify({
        "message": "Complaint submitted successfully",
        "complaint": complaint.to_dict()
    }), 201


@support_bp.get("/complaints")
@jwt_required()
def get_complaints():
    user = get_user()

    if not user:
        return jsonify({"message": "User not found"}), 404

    query = Complaint.query

    if user.role == "customer":
        query = query.filter_by(customer_id=user.id)
    elif user.role != "admin":
        return jsonify({"message": "Not authorized"}), 403

    complaints = query.order_by(Complaint.created_at.desc()).all()

    return jsonify({
        "complaints": [c.to_dict() for c in complaints]
    })


@support_bp.patch("/complaints/<int:complaint_id>/reply")
@jwt_required()
def reply_complaint(complaint_id):
    user = get_user()

    if not user or user.role != "admin":
        return jsonify({"message": "Admin access required"}), 403

    complaint = Complaint.query.get_or_404(complaint_id)
    data = request.get_json() or {}

    reply = str(data.get("admin_reply", "")).strip()
    status = data.get("status", "resolved")

    if not reply:
        return jsonify({"message": "Reply is required"}), 400

    if status not in ["open", "in_progress", "resolved"]:
        return jsonify({"message": "Invalid status"}), 400

    complaint.admin_reply = reply
    complaint.status = status

    db.session.commit()

    return jsonify({
        "message": "Complaint updated successfully",
        "complaint": complaint.to_dict()
    })


# CUSTOMER REVIEWS

@support_bp.post("/reviews")
@jwt_required()
def create_review():
    user = get_user()

    if not user or user.role != "customer":
        return jsonify({"message": "Customer access required"}), 403

    data = request.get_json() or {}

    try:
        request_id = int(data.get("service_request_id"))
        rating = int(data.get("rating"))
    except (TypeError, ValueError):
        return jsonify({"message": "Invalid request or rating"}), 400

    if rating < 1 or rating > 5:
        return jsonify({"message": "Rating must be between 1 and 5"}), 400

    service = ServiceRequest.query.filter_by(
        id=request_id,
        customer_id=user.id,
        status="completed"
    ).first()

    if not service or not service.mechanic_id:
        return jsonify({
            "message": "Only completed services with an assigned mechanic can be reviewed"
        }), 400

    existing = Review.query.filter_by(
        service_request_id=request_id
    ).first()

    if existing:
        return jsonify({"message": "This service has already been reviewed"}), 409

    review = Review(
        customer_id=user.id,
        mechanic_id=service.mechanic_id,
        service_request_id=request_id,
        rating=rating,
        comment=str(data.get("comment", "")).strip()
    )

    db.session.add(review)
    db.session.commit()

    return jsonify({
        "message": "Review submitted successfully",
        "review": review.to_dict()
    }), 201


@support_bp.get("/reviews")
@jwt_required()
def get_reviews():
    user = get_user()

    if not user:
        return jsonify({"message": "User not found"}), 404

    query = Review.query

    if user.role == "customer":
        query = query.filter_by(customer_id=user.id)
    elif user.role == "mechanic":
        query = query.filter_by(mechanic_id=user.id)
    elif user.role != "admin":
        return jsonify({"message": "Not authorized"}), 403

    reviews = query.order_by(Review.created_at.desc()).all()

    return jsonify({
        "reviews": [r.to_dict() for r in reviews]
    })


@support_bp.get("/mechanics/<int:mechanic_id>/rating")
def mechanic_rating(mechanic_id):
    mechanic = User.query.filter_by(
        id=mechanic_id,
        role="mechanic"
    ).first()

    if not mechanic:
        return jsonify({"message": "Mechanic not found"}), 404

    reviews = Review.query.filter_by(mechanic_id=mechanic_id).all()

    total = len(reviews)
    average = (
        sum(r.rating for r in reviews) / total
        if total else 0
    )

    return jsonify({
        "mechanic_id": mechanic_id,
        "average_rating": round(average, 2),
        "total_reviews": total
    })