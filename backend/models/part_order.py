from datetime import datetime
from extensions import db

class PartOrder(db.Model):
    __tablename__ = "part_orders"

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    part_id = db.Column(db.Integer, db.ForeignKey("spare_parts.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(30), default="pending", nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    part = db.relationship("SparePart")

    def to_dict(self):
        return {
            "id": self.id,
            "part_id": self.part_id,
            "part_name": self.part.name if self.part else None,
            "quantity": self.quantity,
            "total_price": self.total_price,
            "status": self.status,
            "created_at": self.created_at.isoformat()
        }