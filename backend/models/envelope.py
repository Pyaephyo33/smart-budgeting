from extensions import db

class Envelope(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(80), nullable=False)
    budgeted_amount = db.Column(db.Float, nullable=False)
    cycle_type = db.Column(db.String(20), nullable=False, default="monthly") #Default to 'monthly'

    def __repr__(self):
        return f"<Envelope {self.name}>"