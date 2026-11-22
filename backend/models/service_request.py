from datetime import datetime
from extensions import db


class ServiceRequest(db.Model):
    __tablename__ = "service_requests"

    id = db.Column(db.Integer, primary_key=True)

    customer_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    vehicle_type = db.Column(db.String(50), nullable=False)

    vehicle_number = db.Column(db.String(50), nullable=False)

    service_type = db.Column(
        db.String(100),
        nullable=False,
        default="General"
    )

    problem_type = db.Column(
        db.String(100),
        nullable=False
    )

    description = db.Column(db.Text, nullable=False)

    latitude = db.Column(db.Float, nullable=False)

    longitude = db.Column(db.Float, nullable=False)

    problem_image = db.Column(db.String(255), nullable=True)

    status = db.Column(
        db.String(30),
        nullable=False,
        default="pending"
    )

    mechanic_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    def __repr__(self):
        return f"<ServiceRequest {self.id}>"