from datetime import datetime, timedelta
import os
import secrets

from flask import Blueprint, request, jsonify, redirect, session

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from security import limiter
from extensions import db
from models.user import User

from services.email_service import (
    send_verification_email,
    send_password_reset_email
)

from auth.google_oauth import (
    get_google_authorization_url,
    exchange_google_code
)


auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth"
)

MAX_LOGIN_ATTEMPTS = 5
ACCOUNT_LOCK_MINUTES = 24 * 60
EMAIL_VERIFICATION_HOURS = 24
PASSWORD_RESET_HOURS = 1

FRONTEND_URL = "http://localhost:5173"

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


# ============================================================
# CUSTOMER AND MECHANIC REGISTRATION
# ============================================================

@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    if not data:
        return jsonify({"message": "Request body is required"}), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    phone = data.get("phone", "").strip()
    password = data.get("password", "")
    role = data.get("role", "").strip().lower()

    if not name:
        return jsonify({"message": "Name is required"}), 400

    if not email:
        return jsonify({"message": "Email is required"}), 400

    if len(password) < 8:
        return jsonify({
            "message": "Password must contain at least 8 characters"
        }), 400

    if role not in ["customer", "mechanic"]:
        return jsonify({"message": "Invalid registration role"}), 400

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({
            "message": "An account with this email already exists",
            "conflict": "email"
        }), 409

    if phone:
        existing_phone = User.query.filter_by(phone=phone).first()

        if existing_phone:
            return jsonify({
                "message": "This phone number is already registered",
                "conflict": "phone"
            }), 409

    verification_token = secrets.token_urlsafe(32)

    verification_expires_at = (
        datetime.utcnow()
        + timedelta(hours=EMAIL_VERIFICATION_HOURS)
    )

    user = User(
        name=name,
        email=email,
        phone=phone if phone else None,
        password_hash=generate_password_hash(password),
        role=role,
        email_verified=False,
        email_verification_token=verification_token,
        email_verification_expires_at=verification_expires_at
    )

    try:
        db.session.add(user)
        db.session.commit()

    except Exception as error:
        db.session.rollback()
        print("Registration error:", error)

        return jsonify({
            "message": "Unable to create account"
        }), 500

    verification_url = (
        FRONTEND_URL
        + "/verify-email?token="
        + verification_token
    )

    try:
        send_verification_email(
            recipient_email=user.email,
            recipient_name=user.name,
            verification_url=verification_url
        )

    except Exception as error:
        print("Verification email error:", error)

        return jsonify({
            "message": "Account created, but verification email could not be sent",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "role": user.role,
                "email_verified": user.email_verified
            }
        }), 201

    return jsonify({
        "message": "Account created successfully. Please verify your email.",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "email_verified": user.email_verified
        }
    }), 201


# ============================================================
# ONE-TIME ADMIN ACCOUNT SETUP
# ============================================================

@auth_bp.route("/admin/setup", methods=["POST"])
@limiter.limit("3 per hour")
def admin_setup():

    data = request.get_json() or {}

    setup_key = str(data.get("setup_key", ""))
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    configured_key = os.getenv("ADMIN_SETUP_KEY")

    if not configured_key:
        return jsonify({
            "message": "Admin setup is not configured"
        }), 500

    if not secrets.compare_digest(setup_key, configured_key):
        return jsonify({
            "message": "Invalid setup key"
        }), 403

    if User.query.filter_by(role="admin").first():
        return jsonify({
            "message": "Admin account has already been created"
        }), 409

    if not name or not email or len(password) < 8:
        return jsonify({
            "message": "Enter name, email and password of at least 8 characters"
        }), 400

    if User.query.filter_by(email=email).first():
        return jsonify({
            "message": "An account with this email already exists"
        }), 409

    admin = User(
        name=name,
        email=email,
        phone=None,
        password_hash=generate_password_hash(password),
        role="admin",
        is_active=True,
        email_verified=True
    )

    try:
        db.session.add(admin)
        db.session.commit()

        return jsonify({
            "message": "Admin account created successfully"
        }), 201

    except Exception as error:
        db.session.rollback()
        print("Admin setup error:", error)

        return jsonify({
            "message": "Unable to create admin account"
        }), 500


# ============================================================
# LOGIN
# ============================================================

@auth_bp.route("/login", methods=["POST"])
@limiter.limit("10 per 15 minutes")
def login():

    data = request.get_json()

    if not data:
        return jsonify({"message": "Request body is required"}), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "").strip().lower()

    if not email or not password or not role:
        return jsonify({
            "message": "Email, password and role are required"
        }), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({
            "message": "Invalid email or password"
        }), 401

    now = datetime.utcnow()

    if user.locked_until:

        if now < user.locked_until:
            return jsonify({
                "message": "Account locked. Please try again later."
            }), 423

        user.failed_login_attempts = 0
        user.locked_until = None
        db.session.commit()

    if not user.password_hash:
        return jsonify({
            "message": "This account uses Google login. Please continue with Google."
        }), 401

    password_correct = check_password_hash(
        user.password_hash,
        password
    )

    if not password_correct:

        user.failed_login_attempts += 1

        if user.failed_login_attempts >= MAX_LOGIN_ATTEMPTS:

            user.locked_until = (
                now + timedelta(minutes=ACCOUNT_LOCK_MINUTES)
            )

            db.session.commit()

            return jsonify({
                "message": "Account locked for 24 hours after 5 failed attempts"
            }), 423

        attempts_left = (
            MAX_LOGIN_ATTEMPTS - user.failed_login_attempts
        )

        db.session.commit()

        return jsonify({
            "message": "Invalid email or password",
            "attempts_remaining": attempts_left
        }), 401

    if user.role != role:
        return jsonify({
            "message": "This account is registered as " + user.role
        }), 403

    if not user.is_active:
        return jsonify({
            "message": "This account has been deactivated"
        }), 403

    if not user.email_verified:
        return jsonify({
            "message": "Please verify your email before logging in",
            "email_verified": False
        }), 403

    user.failed_login_attempts = 0
    user.locked_until = None

    db.session.commit()

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role}
    )

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "email_verified": user.email_verified
        }
    }), 200


# ============================================================
# EMAIL VERIFICATION
# ============================================================

@auth_bp.route("/verify-email", methods=["GET"])
def verify_email():

    token = request.args.get("token", "").strip()

    if not token:
        return jsonify({
            "message": "Verification token is required"
        }), 400

    user = User.query.filter_by(
        email_verification_token=token
    ).first()

    if not user:
        return jsonify({
            "message": "Invalid or expired verification token"
        }), 400

    if user.email_verified:
        return jsonify({
            "message": "Email is already verified"
        }), 200

    if not user.email_verification_expires_at:
        return jsonify({
            "message": "Invalid verification token"
        }), 400

    if datetime.utcnow() > user.email_verification_expires_at:
        return jsonify({
            "message": "Verification token has expired"
        }), 400

    user.email_verified = True
    user.email_verification_token = None
    user.email_verification_expires_at = None

    db.session.commit()

    return jsonify({
        "message": "Email verified successfully",
        "email_verified": True
    }), 200


# ============================================================
# FORGOT PASSWORD
# ============================================================

@auth_bp.route("/forgot-password", methods=["POST"])
@limiter.limit("5 per 15 minutes")
def forgot_password():

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request body is required"
        }), 400

    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({
            "message": "Email is required"
        }), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({
            "message": "If an account exists, a password reset link has been sent"
        }), 200

    if not user.password_hash:
        return jsonify({
            "message": "This account uses Google login"
        }), 200

    reset_token = secrets.token_urlsafe(32)

    reset_expires_at = (
        datetime.utcnow()
        + timedelta(hours=PASSWORD_RESET_HOURS)
    )

    user.password_reset_token = reset_token
    user.password_reset_expires_at = reset_expires_at

    db.session.commit()

    reset_url = (
        FRONTEND_URL
        + "/reset-password?token="
        + reset_token
    )

    try:
        send_password_reset_email(
            recipient_email=user.email,
            recipient_name=user.name,
            reset_url=reset_url
        )

    except Exception as error:
        print("Password reset email error:", error)

        user.password_reset_token = None
        user.password_reset_expires_at = None

        db.session.commit()

    return jsonify({
        "message": "If an account exists, a password reset link has been sent"
    }), 200


# ============================================================
# RESET PASSWORD
# ============================================================

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request body is required"
        }), 400

    token = data.get("token", "").strip()
    new_password = data.get("password", "")

    if not token:
        return jsonify({
            "message": "Reset token is required"
        }), 400

    if len(new_password) < 8:
        return jsonify({
            "message": "Password must contain at least 8 characters"
        }), 400

    user = User.query.filter_by(
        password_reset_token=token
    ).first()

    if not user:
        return jsonify({
            "message": "Invalid or expired reset token"
        }), 400

    if not user.password_reset_expires_at:
        return jsonify({
            "message": "Invalid reset token"
        }), 400

    if datetime.utcnow() > user.password_reset_expires_at:

        user.password_reset_token = None
        user.password_reset_expires_at = None

        db.session.commit()

        return jsonify({
            "message": "Password reset token has expired"
        }), 400

    user.password_hash = generate_password_hash(new_password)

    user.password_reset_token = None
    user.password_reset_expires_at = None

    user.failed_login_attempts = 0
    user.locked_until = None

    db.session.commit()

    return jsonify({
        "message": "Password reset successfully"
    }), 200


# ============================================================
# GOOGLE LOGIN START
# ============================================================

@auth_bp.route("/google/login", methods=["GET"])
def google_login():

    role = request.args.get("role", "").strip().lower()

    if role not in ["customer", "mechanic", "admin"]:
        return jsonify({
            "message": "Invalid Google login role"
        }), 400

    try:
        authorization_url = get_google_authorization_url(role)

        return redirect(authorization_url)

    except Exception as error:
        print("Google login error:", error)

        return jsonify({
            "message": "Unable to start Google login"
        }), 500


# ============================================================
# GOOGLE LOGIN CALLBACK
# ============================================================

@auth_bp.route("/google/callback", methods=["GET"])
def google_callback():

    role = session.get("google_role")

    if role not in ["customer", "mechanic", "admin"]:
        return redirect(
            FRONTEND_URL + "/login/customer?error=invalid_role"
        )

    try:
        credentials = exchange_google_code()

        google_user = id_token.verify_oauth2_token(
            credentials.id_token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )

    except Exception as error:
        print("Google callback error:", error)

        session.pop("google_role", None)

        return redirect(
            FRONTEND_URL + "/login/" + role
            + "?error=google_login_failed"
        )

    google_id = google_user.get("sub")
    email = google_user.get("email", "").strip().lower()
    name = google_user.get("name", "RoadFix User")
    email_verified = google_user.get("email_verified", False)

    if not google_id or not email:

        session.pop("google_role", None)

        return redirect(
            FRONTEND_URL + "/login/" + role
            + "?error=google_account_invalid"
        )

    user = User.query.filter_by(
        google_id=google_id
    ).first()

    if not user and email_verified:

        user = User.query.filter_by(email=email).first()

        if user:
            user.google_id = google_id
            user.email_verified = True
            user.email_verification_token = None
            user.email_verification_expires_at = None

            db.session.commit()

    if not user:

        if role == "admin":

            session.pop("google_role", None)

            return redirect(
                FRONTEND_URL
                + "/login/admin?error=admin_account_not_found"
            )

        user = User(
            name=name,
            email=email,
            phone=None,
            password_hash=None,
            google_id=google_id,
            role=role,
            is_active=True,
            email_verified=bool(email_verified),
            email_verification_token=None,
            email_verification_expires_at=None
        )

        db.session.add(user)
        db.session.commit()

    if user.role != role:

        session.pop("google_role", None)

        return redirect(
            FRONTEND_URL + "/login/" + role
            + "?error=role_mismatch"
        )

    if not user.is_active:

        session.pop("google_role", None)

        return redirect(
            FRONTEND_URL + "/login/" + role
            + "?error=inactive"
        )

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role}
    )

    session.pop("google_role", None)

    return redirect(
        FRONTEND_URL + "/login/" + user.role
        + "?google_token=" + access_token
    )


# ============================================================
# CURRENT LOGGED-IN USER
# ============================================================

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def current_user():

    user_id = get_jwt_identity()

    user = User.query.get(int(user_id))

    if not user:
        return jsonify({
            "message": "User not found"
        }), 404

    return jsonify({
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "is_active": user.is_active,
            "email_verified": user.email_verified,
            "phone_verified": user.phone_verified
        }
    }), 200