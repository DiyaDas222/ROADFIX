from datetime import datetime
from extensions import db

class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    service_request_id = db.Column(db.Integer, db.ForeignKey("service_requests.id"), nullable=True)
    part_order_id = db.Column(db.Integer, db.ForeignKey("part_orders.id"), nullable=True)

    razorpay_order_id = db.Column(db.String(150), unique=True, nullable=False)
    razorpay_payment_id = db.Column(db.String(150), unique=True, nullable=True)

    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), default="INR")
    status = db.Column(db.String(30), default="created", nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)