from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models.user import User
from models.notification import Notification

notifications_bp = Blueprint(
    "notifications",
    __name__,
    url_prefix="/api/notifications"
)


def current_user():
    try:
        return User.query.get(int(get_jwt_identity()))
    except (TypeError, ValueError):
        return None


@notifications_bp.get("/")
@jwt_required()
def get_notifications():

    user = current_user()

    if not user:
        return jsonify({"message": "User not found"}), 404

    notifications = Notification.query.filter_by(
        user_id=user.id
    ).order_by(
        Notification.created_at.desc()
    ).limit(50).all()

    unread_count = Notification.query.filter_by(
        user_id=user.id,
        is_read=False
    ).count()

    return jsonify({
        "notifications": [
            n.to_dict() for n in notifications
        ],
        "unread_count": unread_count
    })


@notifications_bp.patch("/<int:notification_id>/read")
@jwt_required()
def mark_read(notification_id):

    user = current_user()

    if not user:
        return jsonify({"message": "User not found"}), 404

    notification = Notification.query.filter_by(
        id=notification_id,
        user_id=user.id
    ).first()

    if not notification:
        return jsonify({"message": "Notification not found"}), 404

    notification.is_read = True
    db.session.commit()

    return jsonify({
        "message": "Notification marked as read"
    })


@notifications_bp.patch("/read-all")
@jwt_required()
def mark_all_read():

    user = current_user()

    if not user:
        return jsonify({"message": "User not found"}), 404

    Notification.query.filter_by(
        user_id=user.id,
        is_read=False
    ).update({"is_read": True})

    db.session.commit()

    return jsonify({
        "message": "All notifications marked as read"
    })


@notifications_bp.delete("/<int:notification_id>")
@jwt_required()
def delete_notification(notification_id):

    user = current_user()

    if not user:
        return jsonify({"message": "User not found"}), 404

    notification = Notification.query.filter_by(
        id=notification_id,
        user_id=user.id
    ).first()

    if not notification:
        return jsonify({"message": "Notification not found"}), 404

    db.session.delete(notification)
    db.session.commit()

    return jsonify({
        "message": "Notification deleted"
    })