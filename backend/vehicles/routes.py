from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models.user import User
from models.vehicle import Vehicle

vehicles_bp = Blueprint(
    "vehicles",
    __name__,
    url_prefix="/api/vehicles"
)


def get_customer():
    user_id = get_jwt_identity()
    return User.query.get(int(user_id))


@vehicles_bp.route("/", methods=["GET"])
@jwt_required()
def get_vehicles():
    user = get_customer()

    if not user:
        return jsonify({"message": "User not found"}), 404

    if user.role != "customer":
        return jsonify({"message": "Access denied"}), 403

    vehicles = Vehicle.query.filter_by(
        customer_id=user.id
    ).order_by(Vehicle.id.desc()).all()

    return jsonify({
        "vehicles": [vehicle.to_dict() for vehicle in vehicles]
    }), 200


@vehicles_bp.route("/", methods=["POST"])
@jwt_required()
def add_vehicle():
    user = get_customer()

    if not user:
        return jsonify({"message": "User not found"}), 404

    if user.role != "customer":
        return jsonify({"message": "Access denied"}), 403

    data = request.get_json(silent=True) or {}

    vehicle_type = str(data.get("vehicle_type", "")).strip()
    brand = str(data.get("brand", "")).strip()
    model = str(data.get("model", "")).strip()
    registration_number = str(
        data.get("registration_number", "")
    ).strip().upper()
    fuel_type = str(data.get("fuel_type", "")).strip()

    if not all([
        vehicle_type,
        brand,
        model,
        registration_number,
        fuel_type
    ]):
        return jsonify({
            "message": "Please fill in all vehicle details."
        }), 400

    duplicate = Vehicle.query.filter_by(
        customer_id=user.id,
        registration_number=registration_number
    ).first()

    if duplicate:
        return jsonify({
            "message": "This vehicle is already registered."
        }), 409

    vehicle = Vehicle(
        customer_id=user.id,
        vehicle_type=vehicle_type,
        brand=brand,
        model=model,
        registration_number=registration_number,
        fuel_type=fuel_type
    )

    try:
        db.session.add(vehicle)
        db.session.commit()

        return jsonify({
            "message": "Vehicle added successfully.",
            "vehicle": vehicle.to_dict()
        }), 201

    except Exception:
        db.session.rollback()
        return jsonify({
            "message": "Unable to add vehicle."
        }), 500


@vehicles_bp.route("/<int:vehicle_id>", methods=["PUT"])
@jwt_required()
def update_vehicle(vehicle_id):
    user = get_customer()

    if not user:
        return jsonify({"message": "User not found"}), 404

    if user.role != "customer":
        return jsonify({"message": "Access denied"}), 403

    vehicle = Vehicle.query.filter_by(
        id=vehicle_id,
        customer_id=user.id
    ).first()

    if not vehicle:
        return jsonify({"message": "Vehicle not found"}), 404

    data = request.get_json(silent=True) or {}

    fields = [
        "vehicle_type",
        "brand",
        "model",
        "registration_number",
        "fuel_type"
    ]

    for field in fields:
        if field in data:
            value = str(data[field]).strip()

            if not value:
                return jsonify({
                    "message": "All vehicle fields are required."
                }), 400

            if field == "registration_number":
                value = value.upper()

            setattr(vehicle, field, value)

    duplicate = Vehicle.query.filter(
        Vehicle.customer_id == user.id,
        Vehicle.registration_number == vehicle.registration_number,
        Vehicle.id != vehicle.id
    ).first()

    if duplicate:
        return jsonify({
            "message": "Another vehicle already uses this registration number."
        }), 409

    try:
        db.session.commit()

        return jsonify({
            "message": "Vehicle updated successfully.",
            "vehicle": vehicle.to_dict()
        }), 200

    except Exception:
        db.session.rollback()
        return jsonify({
            "message": "Unable to update vehicle."
        }), 500


@vehicles_bp.route("/<int:vehicle_id>", methods=["DELETE"])
@jwt_required()
def delete_vehicle(vehicle_id):
    user = get_customer()

    if not user:
        return jsonify({"message": "User not found"}), 404

    if user.role != "customer":
        return jsonify({"message": "Access denied"}), 403

    vehicle = Vehicle.query.filter_by(
        id=vehicle_id,
        customer_id=user.id
    ).first()

    if not vehicle:
        return jsonify({"message": "Vehicle not found"}), 404

    try:
        db.session.delete(vehicle)
        db.session.commit()

        return jsonify({
            "message": "Vehicle deleted successfully."
        }), 200

    except Exception:
        db.session.rollback()
        return jsonify({
            "message": "Unable to delete vehicle."
        }), 500