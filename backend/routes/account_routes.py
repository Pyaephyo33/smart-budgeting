from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.account import Account
from models.user import User
from extensions import db

account_bp = Blueprint('account_bp', __name__)

# Create account
@account_bp.route('/', methods=['POST'])
@jwt_required()
def create_account():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404
    
    existing_accounts = Account.query.filter_by(user_id=user.id).count()
    if existing_accounts >= 3:
        return jsonify({"message": "Maximum of 3 accounts allowed"}), 403
    
    data = request.get_json()
    account_type = data.get("account_type")

    if not account_type:
        return jsonify({"message": "Account type is required"}), 400
    
    new_account = Account(user_id=user.id, account_type=account_type)
    db.session.add(new_account)
    db.session.commit()

    return jsonify({"message": "Account created successfully"}), 201

# List all accounts for logged-in user
@account_bp.route('/', methods=['GET'])
@jwt_required()
def list_accounts():
    user_id = get_jwt_identity()
    accounts = Account.query.filter_by(user_id=user_id).all()
    result = [
        {"id": acc.id, "type": acc.account_type, "balance": acc.balance}
        for acc in accounts
    ]
    return jsonify(result), 200

# Deposit money into an account
@account_bp.route('/<int:account_id>/deposit', methods=['PATCH'])
@jwt_required()
def deposit_money(account_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    amount = data.get('amount')

    if not amount or amount <= 0:
        return jsonify({"message": "Amount must be greater than zero"}), 400

    account = Account.query.filter_by(id=account_id, user_id=user_id).first()
    if not account:
        return jsonify({"message": "Account not found"}), 404

    account.balance += amount
    db.session.commit()

    return jsonify({
        "message": f"{amount} added to account",
        "new_balance": account.balance
    }), 200




# Withdraw money from an account
@account_bp.route('/<int:account_id>/withdraw', methods=['PATCH'])
@jwt_required()
def withdraw_money(account_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    amount = data.get('amount')

    if not amount or amount <= 0:
        return jsonify({"message": "Amount must be greater than zero"}), 400

    account = Account.query.filter_by(id=account_id, user_id=user_id).first()
    if not account:
        return jsonify({"message": "Account not found"}), 404

    if account.balance < amount:
        return jsonify({"message": "Insufficient funds"}), 403

    account.balance -= amount
    db.session.commit()

    return jsonify({
        "message": f"{amount} withdrawn from account",
        "new_balance": account.balance
    }), 200


# Delete an account by ID
@account_bp.route('/<int:account_id>', methods=['DELETE'])
@jwt_required()
def delete_account(account_id):
    user_id = get_jwt_identity()
    account = Account.query.filter_by(id=account_id, user_id=user_id).first()

    if not account:
        return jsonify({"message": "Account not found"}), 404

    db.session.delete(account)
    db.session.commit()
    return jsonify({"message": "Account deleted"}), 200
