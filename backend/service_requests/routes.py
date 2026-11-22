import os
import uuid

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from extensions import db
from models.user import User
from models.service_request import ServiceRequest


service_requests_bp = Blueprint(
    "service_requests",
    __name__,
    url_prefix="/api/service-requests"
)


ALLOWED_IMAGE_EXTENSIONS = {
    "png", "jpg", "jpeg", "webp"
}


def allowed_image(filename):
    return (
        bool(filename)
        and "." in filename
        and filename.rsplit(".", 1)[1].lower()
        in ALLOWED_IMAGE_EXTENSIONS
    )


def get_upload_folder():
    backend_folder = os.path.dirname(
        os.path.dirname(os.path.abspath(__file__))
    )

    upload_folder = os.path.join(
        backend_folder,
        "uploads",
        "service_requests"
    )

    os.makedirs(upload_folder, exist_ok=True)

    return upload_folder


def serialize_request(service_request):
    return {
        "id": service_request.id,
        "customer_id": service_request.customer_id,
        "vehicle_type": service_request.vehicle_type,
        "vehicle_number": service_request.vehicle_number,
        "service_type": service_request.service_type,
        "problem_type": service_request.problem_type,
        "description": service_request.description,
        "latitude": service_request.latitude,
        "longitude": service_request.longitude,
        "problem_image": service_request.problem_image,
        "status": service_request.status,
        "mechanic_id": service_request.mechanic_id,
        "created_at": (
            service_request.created_at.isoformat()
            if service_request.created_at else None
        ),
        "updated_at": (
            service_request.updated_at.isoformat()
            if service_request.updated_at else None
        )
    }


# =====================================================
# CREATE SERVICE REQUEST
# =====================================================

@service_requests_bp.route("/", methods=["POST"])
@jwt_required()
def create_service_request():

    try:
        user_id = int(get_jwt_identity())

        user = User.query.get(user_id)

        if not user:
            return jsonify({"message": "User not found"}), 404

        vehicle_type = request.form.get(
            "vehicle_type", ""
        ).strip()

        vehicle_number = request.form.get(
            "vehicle_number", ""
        ).strip().upper()

        problem_type = request.form.get(
            "problem_type", ""
        ).strip()

        description = request.form.get(
            "description", ""
        ).strip()

        latitude = request.form.get("latitude", "").strip()
        longitude = request.form.get("longitude", "").strip()

        if not vehicle_type:
            return jsonify({
                "message": "Vehicle type is required"
            }), 400

        if not vehicle_number:
            return jsonify({
                "message": "Vehicle number is required"
            }), 400

        if not problem_type:
            return jsonify({
                "message": "Problem type is required"
            }), 400

        if not description:
            return jsonify({
                "message": "Problem description is required"
            }), 400

        if not latitude or not longitude:
            return jsonify({
                "message": "Location is required"
            }), 400

        try:
            latitude_value = float(latitude)
            longitude_value = float(longitude)
        except ValueError:
            return jsonify({
                "message": "Invalid location coordinates"
            }), 400

        image = request.files.get("problem_image")
        image_filename = None

        if image and image.filename:

            if not allowed_image(image.filename):
                return jsonify({
                    "message": "Only PNG, JPG, JPEG and WEBP images are allowed"
                }), 400

            filename = secure_filename(image.filename)

            image_filename = (
                uuid.uuid4().hex + "_" + filename
            )

            image_path = os.path.join(
                get_upload_folder(),
                image_filename
            )

            image.save(image_path)

        service_request = ServiceRequest(
            customer_id=user_id,
            vehicle_type=vehicle_type,
            vehicle_number=vehicle_number,
            service_type=problem_type,
            problem_type=problem_type,
            description=description,
            latitude=latitude_value,
            longitude=longitude_value,
            problem_image=image_filename,
            status="pending"
        )

        db.session.add(service_request)
        db.session.commit()

        return jsonify({
            "message": "Service request created successfully",
            "service_request": serialize_request(service_request)
        }), 201

    except Exception as error:

        db.session.rollback()

        print("SERVICE REQUEST ERROR:", repr(error))

        return jsonify({
            "message": "Failed to create service request",
            "error": str(error)
        }), 500


# =====================================================
# GET CUSTOMER SERVICE REQUESTS
# =====================================================

@service_requests_bp.route("/", methods=["GET"])
@jwt_required()
def get_service_requests():

    try:
        user_id = int(get_jwt_identity())

        user = User.query.get(user_id)

        if not user:
            return jsonify({
                "message": "User not found"
            }), 404

        requests_list = ServiceRequest.query.filter_by(
            customer_id=user_id
        ).order_by(
            ServiceRequest.created_at.desc()
        ).all()

        return jsonify({
            "message": "Service requests retrieved successfully",
            "service_requests": [
                serialize_request(item)
                for item in requests_list
            ]
        }), 200

    except Exception as error:

        print("GET SERVICE REQUESTS ERROR:", repr(error))

        return jsonify({
            "message": "Failed to retrieve service requests",
            "error": str(error)
        }), 500


# =====================================================
# GET SINGLE SERVICE REQUEST
# =====================================================

@service_requests_bp.route(
    "/<int:request_id>",
    methods=["GET"]
)
@jwt_required()
def get_single_service_request(request_id):

    try:
        user_id = int(get_jwt_identity())

        service_request = ServiceRequest.query.filter_by(
            id=request_id,
            customer_id=user_id
        ).first()

        if not service_request:
            return jsonify({
                "message": "Service request not found"
            }), 404

        return jsonify({
            "message": "Service request retrieved successfully",
            "service_request": serialize_request(service_request)
        }), 200

    except Exception as error:

        print("GET SINGLE REQUEST ERROR:", repr(error))

        return jsonify({
            "message": "Failed to retrieve service request",
            "error": str(error)
        }), 500