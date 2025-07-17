from extensions import db
from datetime import datetime

class MLPrediction(db.Model):
    __tablename__ = 'ml_predictions'

    prediction_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    transaction_id = db.Column(db.Integer, db.ForeignKey('transactions.id'), nullable=True)
    predicted_class = db.Column(db.String(50), nullable=True)
    predicted_amount = db.Column(db.Float, nullable=True) # Newly added for regression results
    model_version = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.now)

    def to_dict(self):
        return {
            "prediction_id": self.prediction_id,
            "user_id": self.user_id,
            "transaction_id": self.transaction_id,
            "predicted_class": self.predicted_class,
            "predicted_amount": self.predicted_amount,
            "model_version": self.model_version,
            "timestamp": self.timestamp.isoformat()
        }