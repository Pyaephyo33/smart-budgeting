from extensions import db
from datetime import datetime

class Transaction(db.Model):
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    account_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=False)
    envelope_id = db.Column(db.Integer, db.ForeignKey('envelope.id'), nullable=True)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('savings_goal.id'), nullable=True)
    is_refunded = db.Column(db.Boolean, default=False)

    amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(20), default="cash") # optional: 'cash', 'card'
    type = db.Column(db.String(20), nullable=False) # 'income', 'expense', 'transfer'
    date = db.Column(db.Date, default=datetime.now)
    notes = db.Column(db.String(255))


