# routes/category_routes.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.category import Category
from extensions import db

category_bp = Blueprint('category_bp', __name__)

# Create category
@category_bp.route('/', methods=['POST'])
@jwt_required()
def create_category():
    data = request.get_json()
    name = data.get('name')
    category_type = data.get('type')

    if not name or not category_type:
        return jsonify({"message": "Name and type are required"}), 400

    new_category = Category(name=name, type=category_type)
    db.session.add(new_category)
    db.session.commit()

    return jsonify({"message": "Category created successfully"}), 201

# Get all categories
@category_bp.route('/', methods=['GET'])
@jwt_required()
def get_categories():
    categories = Category.query.all()
    result = [{"id": c.id, "name": c.name, "type": c.type} for c in categories]
    return jsonify(result), 200

# Update category
@category_bp.route('/<int:category_id>', methods=['PUT'])
@jwt_required()
def update_category(category_id):
    data = request.get_json()
    name = data.get('name')
    category_type = data.get('type')

    category = Category.query.get(category_id)
    if not category:
        return jsonify({"message": "Category not found"}), 404

    if name:
        category.name = name
    if category_type:
        category.type = category_type

    db.session.commit()
    return jsonify({'message': "Category updated successfully"}), 200

# Delete category
@category_bp.route('/<int:category_id>', methods=['DELETE'])
@jwt_required()
def delete_category(category_id):
    category = Category.query.get(category_id)
    if not category:
        return jsonify({"message": "Category not found"}), 404

    db.session.delete(category)
    db.session.commit()
    return jsonify({"message": "Category deleted successfully"}), 200
