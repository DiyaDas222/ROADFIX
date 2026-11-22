import os
import hmac
import hashlib
import razorpay

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models.user import User
from models.payment import Payment
from models.part_order import PartOrder
from models.service_request import ServiceRequest
from models.service_price import ServicePrice

payments_bp = Blueprint("payments", __name__, url_prefix="/api/payments")

KEY_ID = os.getenv("RAZORPAY_KEY_ID")
KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

client = None

if KEY_ID and KEY_SECRET:
    client = razorpay.Client(auth=(KEY_ID, KEY_SECRET))


def current_user():
    try:
        return User.query.get(int(get_jwt_identity()))
    except (TypeError, ValueError):
        return None


@payments_bp.post("/create-order")
@jwt_required()
def create_order():
    user = current_user()

    if not user or user.role != "customer":
        return jsonify({"message": "Customer access required"}), 403

    if client is None:
        return jsonify({"message": "Razorpay is not configured"}), 503

    data = request.get_json() or {}

    service_id = data.get("service_request_id")
    part_order_id = data.get("part_order_id")

    if bool(service_id) == bool(part_order_id):
        return jsonify({
            "message": "Provide exactly one service request or part order ID"
        }), 400

    if service_id:
        service = ServiceRequest.query.filter_by(
            id=service_id,
            customer_id=user.id
        ).first()

        if not service:
            return jsonify({"message": "Service request not found"}), 404

        price = ServicePrice.query.filter(
            db.func.lower(ServicePrice.service_name) ==
            str(service.service_type).lower()
        ).first()

        if not price:
            price = ServicePrice.query.filter(
                db.func.lower(ServicePrice.service_name) ==
                str(service.problem_type).lower()
            ).first()

        if not price:
            return jsonify({
                "message": "Admin has not configured a price for this service"
            }), 400

        amount = price.base_price

    else:
        order = PartOrder.query.filter_by(
            id=part_order_id,
            customer_id=user.id
        ).first()

        if not order:
            return jsonify({"message": "Part order not found"}), 404

        if order.status != "pending":
            return jsonify({"message": "This part order cannot be paid"}), 400

        amount = order.total_price

    if amount <= 0:
        return jsonify({"message": "Invalid payment amount"}), 400

    try:
        razorpay_order = client.order.create({
            "amount": int(round(amount * 100)),
            "currency": "INR",
            "receipt": f"roadfix_{user.id}_{service_id or part_order_id}"
        })

        payment = Payment(
            customer_id=user.id,
            service_request_id=service_id,
            part_order_id=part_order_id,
            razorpay_order_id=razorpay_order["id"],
            amount=amount,
            status="created"
        )

        db.session.add(payment)
        db.session.commit()

        return jsonify({
            "message": "Payment order created",
            "key_id": KEY_ID,
            "order_id": razorpay_order["id"],
            "amount": razorpay_order["amount"],
            "currency": "INR",
            "payment_id": payment.id
        }), 201

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Unable to create payment order"}), 500


@payments_bp.post("/verify")
@jwt_required()
def verify_payment():
    user = current_user()

    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json() or {}

    order_id = data.get("razorpay_order_id")
    payment_id = data.get("razorpay_payment_id")
    signature = data.get("razorpay_signature")

    if not all([order_id, payment_id, signature]):
        return jsonify({"message": "Missing payment details"}), 400

    payment = Payment.query.filter_by(
        razorpay_order_id=order_id,
        customer_id=user.id
    ).first()

    if not payment:
        return jsonify({"message": "Payment record not found"}), 404

    if payment.status == "paid":
        return jsonify({"message": "Payment already verified"}), 200

    if client is None:
        return jsonify({"message": "Razorpay is not configured"}), 503

    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature
        })

        payment.razorpay_payment_id = payment_id
        payment.status = "paid"

        if payment.part_order_id:
            part_order = PartOrder.query.get(payment.part_order_id)
            if part_order:
                part_order.status = "confirmed"

        db.session.commit()

        return jsonify({
            "message": "Payment verified successfully",
            "status": "paid",
            "amount": payment.amount
        }), 200

    except razorpay.errors.SignatureVerificationError:
        payment.status = "failed"
        db.session.commit()

        return jsonify({"message": "Payment verification failed"}), 400

    except Exception:
        db.session.rollback()
        return jsonify({"message": "Payment verification error"}), 500


@payments_bp.get("/history")
@jwt_required()
def payment_history():
    user = current_user()

    if not user:
        return jsonify({"message": "User not found"}), 404

    query = Payment.query

    if user.role != "admin":
        query = query.filter_by(customer_id=user.id)

    payments = query.order_by(Payment.created_at.desc()).all()

    return jsonify({
        "payments": [{
            "id": p.id,
            "amount": p.amount,
            "currency": p.currency,
            "status": p.status,
            "service_request_id": p.service_request_id,
            "part_order_id": p.part_order_id,
            "created_at": p.created_at.isoformat()
        } for p in payments]
    })