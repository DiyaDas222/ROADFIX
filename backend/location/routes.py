from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models.user import User
from models.location import Location
from models.service_request import ServiceRequest

location_bp = Blueprint(
    "location",
    __name__,
    url_prefix="/api/location"
)


def current_user():
    try:
        return User.query.get(int(get_jwt_identity()))
    except (ValueError, TypeError):
        return None


@location_bp.route("/update", methods=["POST"])
@jwt_required()
def update_location():

    user = current_user()

    if not user:
        return jsonify({"message": "User not found"}), 404

    if user.role not in ["customer", "mechanic"]:
        return jsonify({"message": "Access denied"}), 403

    data = request.get_json(silent=True) or {}

    try:
        latitude = float(data.get("latitude"))
        longitude = float(data.get("longitude"))
    except (ValueError, TypeError):
        return jsonify({"message": "Invalid coordinates"}), 400

    if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
        return jsonify({"message": "Coordinates out of range"}), 400

    location = Location.query.filter_by(
        user_id=user.id
    ).first()

    if not location:
        location = Location(
            user_id=user.id,
            latitude=latitude,
            longitude=longitude,
            is_sharing=True
        )
        db.session.add(location)
    else:
        location.latitude = latitude
        location.longitude = longitude

    try:
        db.session.commit()

        return jsonify({
            "message": "Location updated",
            "location": location.to_dict()
        }), 200

    except Exception as error:
        db.session.rollback()
        print("LOCATION UPDATE ERROR:", repr(error))
        return jsonify({"message": "Location update failed"}), 500


@location_bp.route("/sharing", methods=["PUT"])
@jwt_required()
def toggle_sharing():

    user = current_user()

    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json(silent=True) or {}
    sharing = data.get("is_sharing")

    if not isinstance(sharing, bool):
        return jsonify({
            "message": "is_sharing must be true or false"
        }), 400

    location = Location.query.filter_by(
        user_id=user.id
    ).first()

    if not location:
        return jsonify({
            "message": "Update your location first"
        }), 404

    location.is_sharing = sharing
    db.session.commit()

    return jsonify({
        "message": "Location sharing updated",
        "is_sharing": sharing
    }), 200


@location_bp.route("/request/<int:request_id>", methods=["GET"])
@jwt_required()
def get_request_locations(request_id):

    user = current_user()

    if not user:
        return jsonify({"message": "User not found"}), 404

    service = ServiceRequest.query.get(request_id)

    if not service:
        return jsonify({"message": "Request not found"}), 404

    if user.id not in [service.customer_id, service.mechanic_id]:
        return jsonify({"message": "Access denied"}), 403

    result = {}

    customer_location = Location.query.filter_by(
        user_id=service.customer_id,
        is_sharing=True
    ).first()

    mechanic_location = None

    if service.mechanic_id:
        mechanic_location = Location.query.filter_by(
            user_id=service.mechanic_id,
            is_sharing=True
        ).first()

    result["customer"] = (
        customer_location.to_dict()
        if customer_location else None
    )

    result["mechanic"] = (
        mechanic_location.to_dict()
        if mechanic_location else None
    )

    return jsonify({
        "request_id": request_id,
        "locations": result
    }), 200