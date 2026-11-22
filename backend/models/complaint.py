from datetime import datetime
from extensions import db

class Complaint(db.Model):
    __tablename__ = "complaints"

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    service_request_id = db.Column(db.Integer, db.ForeignKey("service_requests.id"), nullable=True)
    subject = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(30), default="open", nullable=False)
    admin_reply = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "service_request_id": self.service_request_id,
            "subject": self.subject,
            "description": self.description,
            "status": self.status,
            "admin_reply": self.admin_reply,
            "created_at": self.created_at.isoformat()
        }