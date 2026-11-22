from datetime import datetime
from extensions import db


class MechanicProfile(db.Model):
    __tablename__ = "mechanic_profiles"

    id = db.Column(db.Integer, primary_key=True)

    mechanic_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        unique=True
    )

    is_available = db.Column(
        db.Boolean,
        default=True,
        nullable=False
    )

    service_radius = db.Column(
        db.Float,
        default=20.0,
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )