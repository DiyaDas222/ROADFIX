from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

from extensions import db
from models.user import User
from models.location import Location
from models.mechanic_profile import MechanicProfile
from models.service_request import ServiceRequest

mechanics_bp = Blueprint(
    "mechanics",
    __name__,
    url_prefix="/api/mechanics"
)


def get_current_user():
    try:
        return User.query.get(int(get_jwt_identity()))
    except (ValueError, TypeError):
        return None


def calculate_distance(lat1, lon1, lat2, lon2):
    from math import radians, sin, cos, asin, sqrt

    lat1, lon1, lat2, lon2 = map(
        radians, [lat1, lon1, lat2, lon2]
    )

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        sin(dlat / 2) ** 2
        + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    )

    return 6371 * 2 * asin(sqrt(a))


@mechanics_bp.route("/availability", methods=["PUT"])
@jwt_required()
def update_availability():

    user = get_current_user()

    if not user or user.role != "mechanic":
        return jsonify({"message": "Mechanic access required"}), 403

    data = request.get_json(silent=True) or {}
    available = data.get("is_available")

    if not isinstance(available, bool):
        return jsonify({"message": "Invalid availability value"}), 400

    profile = MechanicProfile.query.filter_by(
        mechanic_id=user.id
    ).first()

    if not profile:
        profile = MechanicProfile(mechanic_id=user.id)
        db.session.add(profile)

    profile.is_available = available
    db.session.commit()

    return jsonify({
        "message": "Availability updated",
        "is_available": profile.is_available
    }), 200


@mechanics_bp.route("/nearby/<int:request_id>", methods=["GET"])
@jwt_required()
def nearby_mechanics(request_id):

    user = get_current_user()

    if not user or user.role not in ["customer", "admin"]:
        return jsonify({"message": "Access denied"}), 403

    service = ServiceRequest.query.get(request_id)

    if not service:
        return jsonify({"message": "Request not found"}), 404

    if user.role == "customer" and service.customer_id != user.id:
        return jsonify({"message": "Access denied"}), 403

    customer_lat = service.latitude
    customer_lon = service.longitude

    mechanics = (
        db.session.query(User, Location, MechanicProfile)
        .join(Location, Location.user_id == User.id)
        .join(MechanicProfile, MechanicProfile.mechanic_id == User.id)
        .filter(
            User.role == "mechanic",
            User.is_active.is_(True),
            MechanicProfile.is_available.is_(True),
            Location.is_sharing.is_(True)
        )
        .all()
    )

    results = []

    for mechanic, location, profile in mechanics:

        distance = calculate_distance(
            customer_lat,
            customer_lon,
            location.latitude,
            location.longitude
        )

        if distance <= profile.service_radius:

            results.append({
                "mechanic_id": mechanic.id,
                "name": mechanic.name,
                "distance_km": round(distance, 2),
                "latitude": location.latitude,
                "longitude": location.longitude,
                "is_available": profile.is_available
            })

    results.sort(key=lambda item: item["distance_km"])

    return jsonify({
        "request_id": request_id,
        "nearby_mechanics": results
    }), 200


@mechanics_bp.route("/profile/availability", methods=["GET"])
@jwt_required()
def get_availability():

    user = get_current_user()

    if not user or user.role != "mechanic":
        return jsonify({"message": "Mechanic access required"}), 403

    profile = MechanicProfile.query.filter_by(
        mechanic_id=user.id
    ).first()

    return jsonify({
        "is_available": profile.is_available if profile else True,
        "service_radius": profile.service_radius if profile else 20
    }), 200