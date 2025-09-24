from flask import Blueprint, request, jsonify
from models.user import User
from extensions import db, bcrypt, jwt, blacklist
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, timedelta

user_bp = Blueprint('user_bp', __name__)

# Register a new user
@user_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({'message': 'All fields are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists'}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(name=name, email=email, password_hash=hashed_password, created_at=datetime.now())

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

# Login user
@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password_hash, password):
        # access_token = create_access_token(identity={'id': user.id, 'role': user.role})
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={"role": user.role},
            expires_delta=timedelta(hours=24)
        )
        return jsonify({'access_token': access_token}), 200

    return jsonify({'message': 'Invalid credentials'}), 401

# Protected route example
@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id = get_jwt_identity()  # will now be a string
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({"msg": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email
    }), 200

# Logout route with token revocation
@user_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    blacklist.add(jti)
    return jsonify({"message": "Successfully logged out"}), 200

# update route
@user_bp.route('/update', methods=['PATCH'])
@jwt_required()
def update_user():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    data = request.get_json()

    new_name = data.get('name')
    new_email = data.get('email')
    new_password = data.get('password')
    new_role = data.get('role')

    if new_name:
        user.name = new_name
    if new_email:
        # Optional: Check if email is already taken by someone else
        existing = User.query.filter_by(email=new_email).first()
        if existing and existing.id != user.id:
            return jsonify({'message': 'Email already in use'}), 409
        user.email = new_email
    if new_password:
        user.password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
    if new_role:
        user.role = new_role
    
    db.session.commit()

    return jsonify({'message': 'User updated successfully'}), 200