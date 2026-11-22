from extensions import db

class ServicePrice(db.Model):
    __tablename__ = "service_prices"

    id = db.Column(db.Integer, primary_key=True)
    service_name = db.Column(db.String(100), unique=True, nullable=False)
    base_price = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(255))

    def to_dict(self):
        return {
            "id": self.id,
            "service_name": self.service_name,
            "base_price": self.base_price,
            "description": self.description
        }