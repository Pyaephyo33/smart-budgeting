# models/category.py

from extensions import db

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # e.g., 'income', 'expense'

    def __repr__(self):
        return f"<Category {self.name}>"
