from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.user import User
from models.spare_part import SparePart
from models.part_order import PartOrder

spare_parts_bp = Blueprint(
    "spare_parts",
    __name__,
    url_prefix="/api/spare-parts"
)


def get_user():
    try:
        return User.query.get(int(get_jwt_identity()))
    except (TypeError, ValueError):
        return None


@spare_parts_bp.get("/")
@jwt_required()
def list_parts():
    parts = SparePart.query.order_by(SparePart.name).all()
    return jsonify({"parts": [p.to_dict() for p in parts]})


@spare_parts_bp.post("/")
@jwt_required()
def add_part():
    user = get_user()

    if not user or user.role != "admin":
        return jsonify({"message": "Admin access required"}), 403

    data = request.get_json() or {}

    try:
        price = float(data.get("price"))
        stock = int(data.get("stock", 0))
    except (TypeError, ValueError):
        return jsonify({"message": "Invalid price or stock"}), 400

    name = (data.get("name") or "").strip()

    if not name or price < 0 or stock < 0:
        return jsonify({"message": "Enter valid part details"}), 400

    part = SparePart(
        name=name,
        description=data.get("description", ""),
        price=price,
        stock=stock
    )

    db.session.add(part)
    db.session.commit()

    return jsonify({
        "message": "Part added successfully",
        "part": part.to_dict()
    }), 201


@spare_parts_bp.post("/order")
@jwt_required()
def order_part():
    user = get_user()

    if not user or user.role != "customer":
        return jsonify({"message": "Customer access required"}), 403

    data = request.get_json() or {}

    try:
        part_id = int(data.get("part_id"))
        quantity = int(data.get("quantity", 1))
    except (TypeError, ValueError):
        return jsonify({"message": "Invalid part or quantity"}), 400

    if quantity < 1:
        return jsonify({"message": "Quantity must be at least 1"}), 400

    part = SparePart.query.get_or_404(part_id)

    if part.stock < quantity:
        return jsonify({"message": "Insufficient stock"}), 400

    order = PartOrder(
        customer_id=user.id,
        part_id=part.id,
        quantity=quantity,
        total_price=part.price * quantity
    )

    part.stock -= quantity

    db.session.add(order)
    db.session.commit()

    return jsonify({
        "message": "Part order placed successfully",
        "order": order.to_dict()
    }), 201


@spare_parts_bp.get("/my-orders")
@jwt_required()
def my_orders():
    user = get_user()

    if not user or user.role != "customer":
        return jsonify({"message": "Customer access required"}), 403

    orders = PartOrder.query.filter_by(
        customer_id=user.id
    ).order_by(PartOrder.created_at.desc()).all()

    return jsonify({"orders": [o.to_dict() for o in orders]})


@spare_parts_bp.get("/orders")
@jwt_required()
def all_orders():
    user = get_user()

    if not user or user.role != "admin":
        return jsonify({"message": "Admin access required"}), 403

    orders = PartOrder.query.order_by(
        PartOrder.created_at.desc()
    ).all()

    return jsonify({
        "orders": [
            {
                **o.to_dict(),
                "customer_id": o.customer_id
            }
            for o in orders
        ]
    })


@spare_parts_bp.patch("/orders/<int:order_id>/status")
@jwt_required()
def update_order_status(order_id):
    user = get_user()

    if not user or user.role != "admin":
        return jsonify({"message": "Admin access required"}), 403

    order = PartOrder.query.get_or_404(order_id)
    status = (request.json or {}).get("status", "").lower()

    allowed = ["confirmed", "dispatched", "delivered", "cancelled"]

    if status not in allowed:
        return jsonify({"message": "Invalid order status"}), 400

    if order.status == "cancelled" or order.status == "delivered":
        return jsonify({"message": "Order can no longer be changed"}), 400

    if status == "cancelled":
        part = SparePart.query.get(order.part_id)
        if part:
            part.stock += order.quantity

    order.status = status
    db.session.commit()

    return jsonify({"message": "Order status updated"})