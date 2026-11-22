from flask import Flask, jsonify
from flask_jwt_extended import JWTManager

from config import Config
from extensions import db, cors

from auth.routes import auth_bp
from service_requests.routes import service_requests_bp
from workflow.routes import workflow_bp
from vehicles.routes import vehicles_bp
from location.routes import location_bp
from mechanics.routes import mechanics_bp
from spare_parts.routes import spare_parts_bp
from payments.routes import payments_bp
from support.routes import support_bp
from notifications.routes import notifications_bp

# Models
from models.user import User
from models.service_request import ServiceRequest
from models.vehicle import Vehicle
from models.location import Location
from models.mechanic_profile import MechanicProfile
from models.spare_part import SparePart
from models.part_order import PartOrder
from models.payment import Payment
from models.complaint import Complaint
from models.review import Review
from models.service_price import ServicePrice
from models.notification import Notification

# Register automatic notification events
import notifications.events

from security import limiter


def create_app():

    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    JWTManager(app)

    cors.init_app(
        app,
        resources={
            r"/*": {
                "origins": [
                    "http://localhost:5173",
                    "http://127.0.0.1:5173"
                ],
                "allow_headers": [
                    "Content-Type",
                    "Authorization"
                ],
                "methods": [
                    "GET",
                    "POST",
                    "PUT",
                    "PATCH",
                    "DELETE",
                    "OPTIONS"
                ]
            }
        }
    )

    limiter.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(service_requests_bp)
    app.register_blueprint(workflow_bp)
    app.register_blueprint(vehicles_bp)
    app.register_blueprint(location_bp)
    app.register_blueprint(mechanics_bp)
    app.register_blueprint(spare_parts_bp)
    app.register_blueprint(payments_bp)
    app.register_blueprint(support_bp)
    app.register_blueprint(notifications_bp)

    @app.route("/")
    def home():
        return jsonify({
            "message": "RoadFix API is running!"
        })

    @app.route("/api/health")
    def health():
        return jsonify({
            "status": "healthy"
        })

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "message": "Endpoint not found"
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()

        return jsonify({
            "message": "Internal server error"
        }), 500

    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
    )