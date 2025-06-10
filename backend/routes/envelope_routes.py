from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.envelope import Envelope
from models.user import User
from extensions import db

envelope_bp = Blueprint('envelope_bp', __name__)

# Create envelope
@envelope_bp.route('/', methods=['POST'])
@jwt_required()
def create_envelope():
    user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get('name')
    budgeted_amount = data.get('budgeted_amount')
    cycle_type = data.get('cycle_type', 'monthly') # default to monthly if not provided

    if not name or budgeted_amount is None:
        return jsonify({"message": "Name and budgeted amount are required"}), 400
    
    new_env = Envelope(
        user_id = user_id,
        name = name,
        budgeted_amount = budgeted_amount,
        cycle_type = cycle_type
    )
    db.session.add(new_env)
    db.session.commit()

    return jsonify({"message": "Envelope created"}), 201


# Get all envelopes for a user
@envelope_bp.route('/', methods=['GET'])
@jwt_required()
def get_envelopes():
    user_id = get_jwt_identity()
    envelopes = Envelope.query.filter_by(user_id=user_id).all()
    result = [{
        "id":e.id,
        "name": e.name,
        "budgeted_amount": e.budgeted_amount,
        "cycle_type": e.cycle_type
    } for e in envelopes]
    return jsonify(result), 200


# Update envelope
@envelope_bp.route('/<int:envelope_id>', methods=['PUT'])
@jwt_required()
def update_envelope(envelope_id):
    user_id = get_jwt_identity()
    envelope = Envelope.query.filter_by(id=envelope_id, user_id=user_id).first()
    if not envelope:
        return jsonify({"message": "Envelope not found"}), 404
    
    data = request.get_json()
    envelope.name = data.get('name', envelope.name)
    envelope.budgeted_amount = data.get('budgeted_amount', envelope.budgeted_amount)
    envelope.cycle_type = data.get('cycle_type', envelope.cycle_type)

    db.session.commit()
    return jsonify({"message": "Envelope updated"}), 200


# Delete envelope
@envelope_bp.route('/<int:envelope_id>', methods=['DELETE'])
@jwt_required()
def delete_envelope(envelope_id):
    user_id = get_jwt_identity()
    envelope = Envelope.query.filter_by(id=envelope_id, user_id=user_id).first()
    if not envelope:
        return jsonify({"message": "Envelope not found"}), 404
    
    db.session.delete(envelope)
    db.session.commit()
    return jsonify({"message": "Envelope deleted"}), 200