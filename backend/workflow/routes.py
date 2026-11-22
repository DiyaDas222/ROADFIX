from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models.user import User
from models.service_request import ServiceRequest

workflow_bp = Blueprint(
    "workflow",
    __name__,
    url_prefix="/api/workflow"
)


def current_user():
    try:
        return User.query.get(int(get_jwt_identity()))
    except (TypeError, ValueError):
        return None


def require_role(user, *roles):
    if not user:
        return jsonify({"message": "User not found"}), 404

    if user.role not in roles:
        return jsonify({"message": "Not authorized"}), 403

    return None


def serialize(item):
    customer = User.query.get(item.customer_id)
    mechanic = User.query.get(item.mechanic_id) if item.mechanic_id else None

    return {
        "id": item.id,
        "customer_id": item.customer_id,
        "customer_name": customer.name if customer else "Customer",
        "customer_phone": customer.phone if customer else None,
        "mechanic_id": item.mechanic_id,
        "mechanic_name": mechanic.name if mechanic else None,
        "mechanic_phone": mechanic.phone if mechanic else None,
        "vehicle_type": item.vehicle_type,
        "vehicle_number": item.vehicle_number,
        "problem_type": item.problem_type,
        "description": item.description,
        "latitude": item.latitude,
        "longitude": item.longitude,
        "problem_image": item.problem_image,
        "status": item.status,
        "created_at": item.created_at.isoformat() if item.created_at else None,
        "updated_at": item.updated_at.isoformat() if item.updated_at else None
    }


# =====================================
# CUSTOMER / MECHANIC REQUEST LIST
# =====================================

@workflow_bp.get("/requests")
@jwt_required()
def list_requests():

    user = current_user()

    denied = require_role(user, "customer", "mechanic", "admin")
    if denied:
        return denied

    query = ServiceRequest.query

    if user.role == "customer":
        query = query.filter_by(customer_id=user.id)

    elif user.role == "mechanic":

        if not user.is_approved:
            return jsonify({
                "message": "Your mechanic account is awaiting admin approval."
            }), 403

        query = query.filter(
            (ServiceRequest.mechanic_id == user.id) |
            (
                (ServiceRequest.status == "pending") &
                (ServiceRequest.mechanic_id.is_(None))
            )
        )

    items = query.order_by(
        ServiceRequest.created_at.desc()
    ).all()

    return jsonify({
        "requests": [serialize(x) for x in items]
    }), 200


# =====================================
# MECHANIC ACCEPT REQUEST
# =====================================

@workflow_bp.post("/requests/<int:request_id>/accept")
@jwt_required()
def accept_request(request_id):

    user = current_user()

    denied = require_role(user, "mechanic")
    if denied:
        return denied

    if not user.is_approved:
        return jsonify({
            "message": "Your mechanic account is awaiting admin approval."
        }), 403

    item = ServiceRequest.query.get_or_404(request_id)

    if item.status != "pending" or item.mechanic_id is not None:
        return jsonify({
            "message": "This request is no longer available"
        }), 409

    item.mechanic_id = user.id
    item.status = "accepted"

    db.session.commit()

    return jsonify({
        "message": "Request accepted",
        "request": serialize(item)
    }), 200


# =====================================
# MECHANIC REJECT / SKIP
# =====================================

@workflow_bp.post("/requests/<int:request_id>/reject")
@jwt_required()
def reject_request(request_id):

    user = current_user()

    denied = require_role(user, "mechanic")
    if denied:
        return denied

    if not user.is_approved:
        return jsonify({
            "message": "Your account is awaiting approval."
        }), 403

    item = ServiceRequest.query.get_or_404(request_id)

    if item.status != "pending" or item.mechanic_id is not None:
        return jsonify({
            "message": "This request is no longer available"
        }), 409

    return jsonify({
        "message": "Request skipped"
    }), 200


# =====================================
# UPDATE SERVICE STATUS
# =====================================

@workflow_bp.patch("/requests/<int:request_id>/status")
@jwt_required()
def update_status(request_id):

    user = current_user()

    denied = require_role(user, "mechanic", "admin")
    if denied:
        return denied

    item = ServiceRequest.query.get_or_404(request_id)

    if user.role == "mechanic":

        if not user.is_approved:
            return jsonify({
                "message": "Your account is awaiting approval."
            }), 403

        if item.mechanic_id != user.id:
            return jsonify({
                "message": "This request is not assigned to you"
            }), 403

    new_status = (request.json or {}).get("status", "").strip().lower()

    allowed = {
        "on_the_way",
        "arrived",
        "in_progress",
        "completed",
        "cancelled"
    }

    if new_status not in allowed:
        return jsonify({"message": "Invalid status"}), 400

    item.status = new_status
    db.session.commit()

    return jsonify({
        "message": "Status updated",
        "request": serialize(item)
    }), 200


# =====================================
# ADMIN: PENDING MECHANICS
# =====================================

@workflow_bp.get("/admin/mechanics/pending")
@jwt_required()
def pending_mechanics():

    user = current_user()

    denied = require_role(user, "admin")
    if denied:
        return denied

    mechanics = User.query.filter_by(
        role="mechanic",
        is_approved=False
    ).order_by(User.created_at.desc()).all()

    return jsonify({
        "mechanics": [
            {
                "id": m.id,
                "name": m.name,
                "email": m.email,
                "phone": m.phone,
                "created_at": m.created_at.isoformat() if m.created_at else None
            }
            for m in mechanics
        ]
    }), 200


# =====================================
# ADMIN: APPROVE MECHANIC
# =====================================

@workflow_bp.patch("/admin/mechanics/<int:mechanic_id>/approve")
@jwt_required()
def approve_mechanic(mechanic_id):

    admin = current_user()

    denied = require_role(admin, "admin")
    if denied:
        return denied

    mechanic = User.query.filter_by(
        id=mechanic_id,
        role="mechanic"
    ).first_or_404()

    mechanic.is_approved = True

    db.session.commit()

    return jsonify({
        "message": "Mechanic approved successfully"
    }), 200


# =====================================
# ADMIN: REJECT MECHANIC
# =====================================

@workflow_bp.patch("/admin/mechanics/<int:mechanic_id>/reject")
@jwt_required()
def reject_mechanic(mechanic_id):

    admin = current_user()

    denied = require_role(admin, "admin")
    if denied:
        return denied

    mechanic = User.query.filter_by(
        id=mechanic_id,
        role="mechanic"
    ).first_or_404()

    mechanic.is_approved = False
    mechanic.is_active = False

    db.session.commit()

    return jsonify({
        "message": "Mechanic rejected successfully"
    }), 200


# =====================================
# ADMIN OVERVIEW
# =====================================

@workflow_bp.get("/admin/overview")
@jwt_required()
def admin_overview():

    user = current_user()

    denied = require_role(user, "admin")
    if denied:
        return denied

    return jsonify({
        "customers": User.query.filter_by(role="customer").count(),
        "mechanics": User.query.filter_by(role="mechanic").count(),
        "approved_mechanics": User.query.filter_by(
            role="mechanic",
            is_approved=True
        ).count(),
        "pending_mechanics": User.query.filter_by(
            role="mechanic",
            is_approved=False
        ).count(),
        "requests": ServiceRequest.query.count(),
        "pending": ServiceRequest.query.filter_by(status="pending").count(),
        "completed": ServiceRequest.query.filter_by(status="completed").count(),
        "recent_requests": [
            serialize(x)
            for x in ServiceRequest.query.order_by(
                ServiceRequest.created_at.desc()
            ).limit(10).all()
        ],
        "users": [
            {
                "id": x.id,
                "name": x.name,
                "email": x.email,
                "phone": x.phone,
                "role": x.role,
                "is_active": x.is_active,
                "is_approved": x.is_approved
            }
            for x in User.query.order_by(
                User.created_at.desc()
            ).limit(100).all()
        ]
    }), 200