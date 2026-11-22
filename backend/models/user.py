from datetime import datetime
from extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)

    email = db.Column(
        db.String(150),
        unique=True,
        nullable=False,
        index=True
    )

    phone = db.Column(
        db.String(20),
        unique=True,
        nullable=True
    )

    password_hash = db.Column(db.String(255), nullable=True)

    google_id = db.Column(
        db.String(255),
        unique=True,
        nullable=True,
        index=True
    )

    role = db.Column(db.String(20), nullable=False)

    is_active = db.Column(
        db.Boolean,
        default=True,
        nullable=False
    )

    # MECHANIC APPROVAL
    is_approved = db.Column(
        db.Boolean,
        default=False,
        nullable=False
    )

    # EMAIL VERIFICATION
    email_verified = db.Column(
        db.Boolean,
        default=False,
        nullable=False
    )

    email_verification_token = db.Column(
        db.String(255),
        unique=True,
        nullable=True
    )

    email_verification_expires_at = db.Column(
        db.DateTime,
        nullable=True
    )

    # PHONE VERIFICATION
    phone_verified = db.Column(
        db.Boolean,
        default=False,
        nullable=False
    )

    # PASSWORD RESET
    password_reset_token = db.Column(
        db.String(255),
        unique=True,
        nullable=True
    )

    password_reset_expires_at = db.Column(
        db.DateTime,
        nullable=True
    )

    # LOGIN SECURITY
    failed_login_attempts = db.Column(
        db.Integer,
        default=0,
        nullable=False
    )

    locked_until = db.Column(
        db.DateTime,
        nullable=True
    )

    # TIMESTAMPS
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
        return f"<User {self.email}>"