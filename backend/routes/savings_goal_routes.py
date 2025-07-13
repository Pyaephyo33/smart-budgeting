from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date
from models.savings_goal import SavingsGoal
from models.account import Account
from extensions import db

goal_bp = Blueprint('goal_bp', __name__)

# create a new savings goal
@goal_bp.route('/', methods=['POST'])
@jwt_required()
def create_goal():
    user_id = get_jwt_identity()
    data = request.get_json()

    title = data.get("title")
    target_amount = data.get("target_amount")
    target_date_str = data.get("target_date")

    if not title or not target_amount or not target_date_str:
        return jsonify({"message": "All fields are required"}), 404
    
    try:
        target_date = datetime.strptime(target_date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"message": "Invalid date format (use YYYY-MM-DD)"}), 400
    
    new_goal = SavingsGoal(
        user_id = user_id,
        title = title,
        target_amount = target_amount,
        target_date = target_date,
        current_saved = 0.0,
        achieved = False
    )

    db.session.add(new_goal)
    db.session.commit()
    return jsonify({"message": "Savings goal created successfully"}), 201

# Get all goals for a user
@goal_bp.route('/', methods=['GET'])
@jwt_required()
def get_goals():
    user_id = get_jwt_identity()
    goals = SavingsGoal.query.filter_by(user_id=user_id).all()

    return jsonify([
        {
            "id": g.id,
            "title": g.title,
            "target_amount": g.target_amount,
            "target_date": g.target_date.isoformat(),
            "current_saved": g.current_saved,
            "achieved": g.achieved
        } for g in goals
    ]), 200

# # Deposit money into a goal
# @goal_bp.route('/<int:goal_id>/deposit', methods=['PATCH'])
# @jwt_required()
# def deposit_to_goal(goal_id):
#     user_id = get_jwt_identity()
#     data = request.get_json()

#     # amount = data.get_json()
#     amount = data.get("amount")
#     from_account_id = data.get("from_account_id") # optional

#     if not amount or amount <= 0:
#         return jsonify({"message": "Amount must be greater than 0"}), 400
    
#     goal = SavingsGoal.query.filter_by(id=goal_id, user_id=user_id).first()
#     if not goal:
#         return jsonify({"message": "Goal not found"}), 404
    
#     if goal.achieved:
#         return jsonify({"message": "Goal already achieved"}), 400
    
#     if from_account_id:
#         account = Account.query.filter_by(id=from_account_id, user_id=user_id).first()
#         if not account:
#             return jsonify({"message": "Account not found"}), 404
#         if account.balance < amount:
#             return jsonify({"message": "Insufficient account balance"}), 400
#         account.balance -= amount


#     goal.current_saved += amount
#     if goal.current_saved >= goal.target_amount:
#         goal.achieved = True
    
#     db.session.commit()
#     return jsonify({
#         "message": f"{amount} added to savings goal",
#         "current_saved": goal.current_saved,
#         "achieved": goal.achieved
#     }), 200

# NEW LOGIC: deposit money into a goal 
@goal_bp.route('/<int:goal_id>/deposit', methods=['PATCH'])
@jwt_required()
def deposit_to_goal(goal_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    amount = data.get("amount")
    from_account_id = data.get("from_account_id") # optional

    if not amount or amount <= 0:
        return jsonify({"message": "Amount must be greater than 0"}), 400
    
    goal = SavingsGoal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({"message": "Goal not found"}), 404
    
    if goal.achieved:
        return jsonify({"message": "Goal already achieved"}), 400
    
    if goal.current_saved + amount > goal.target_amount:
        return jsonify({
            "message": "Deposit would exceed target amount",
            "current_saved": goal.current_saved,
            "target_amount": goal.target_amount
        }), 400
    
    if from_account_id:
        account = Account.query.filter_by(id=from_account_id, user_id=user_id).first()
        if not account:
            return jsonify({"message": "Account not found"}), 404
        if account.balance < amount:
            return jsonify({"message": "Insufficient amount balance"}), 400
        account.balance -= amount

    goal.current_saved += amount

    if goal.current_saved >= goal.target_amount:
        goal.achieved = True
    
    db.session.commit()
    return jsonify({
        "message": f"{amount} added to savings goal",
        "current_saved": goal.current_saved,
        "achieved": goal.achieved
    }), 200



# reset an achieved goal 
@goal_bp.route('/<int:goal_id>/reset', methods=['PATCh'])
@jwt_required()
def reset_goal(goal_id):
    user_id = get_jwt_identity()
    goal = SavingsGoal.query.filter_by(id=goal_id, user_id=user_id).first()

    if not goal:
        return jsonify({"message": "Goal not found"}), 404
    
    goal.current_saved = 0.0
    goal.achieved = False
    db.session.commit()

    return jsonify({"message": "Goal reset successfully"}), 200

# Delete a goal
@goal_bp.route('/<int:goal_id>', methods=['DELETE'])
@jwt_required()
def delete_goal(goal_id):
    user_id = get_jwt_identity()
    goal = SavingsGoal.query.filter_by(id=goal_id, user_id=user_id).first()

    if not goal:
        return jsonify({"message": "Goal not found"}), 404
    
    db.session.delete(goal)
    db.session.commit()
    return jsonify({"message": "Goal deleted"}), 200


# Get overdue goals
@goal_bp.route('/overdue', methods=['GET'])
@jwt_required()
def get_overdue_goals():
    today = date.today()
    user_id = get_jwt_identity()
    overdue_goals = SavingsGoal.query.filter(
        SavingsGoal.user_id == user_id,
        SavingsGoal.target_date < today,
        SavingsGoal.achieved == False
    ).all()

    return jsonify([
        {
            "id": g.id,
            "title": g.title,
            "target_date": g.target_date.isoformat(),
            "target_amount": g.target_amount,
            "current_saved": g.current_saved
        } for g in overdue_goals
    ]), 200