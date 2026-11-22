from datetime import datetime
from extensions import db


class Vehicle(db.Model):
    __tablename__ = "vehicles"

    id = db.Column(db.Integer, primary_key=True)

    customer_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    vehicle_type = db.Column(db.String(50), nullable=False)
    brand = db.Column(db.String(100), nullable=False)
    model = db.Column(db.String(100), nullable=False)
    registration_number = db.Column(
        db.String(30),
        nullable=False
    )
    fuel_type = db.Column(db.String(30), nullable=False)

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    def to_dict(self):
        return {
            "id": self.id,
            "vehicle_type": self.vehicle_type,
            "brand": self.brand,
            "model": self.model,
            "registration_number": self.registration_number,
            "fuel_type": self.fuel_type,
            "created_at": self.created_at.isoformat()
        }