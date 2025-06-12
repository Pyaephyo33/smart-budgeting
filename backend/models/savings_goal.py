from extensions import db
from datetime import date

class SavingsGoal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    target_amount = db.Column(db.Float, nullable=False)
    current_saved = db.Column(db.Float, nullable=False, default=0.0)
    target_date = db.Column(db.Date, nullable=False)
    achieved = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f"<SavingsGoal {self.title}>"