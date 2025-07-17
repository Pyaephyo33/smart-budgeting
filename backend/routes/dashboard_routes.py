from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.transaction import Transaction
from models.savings_goal import SavingsGoal
from models.category import Category
from models.envelope import Envelope
from datetime import datetime, timedelta
from sqlalchemy import func


dashboard_bp = Blueprint("dashboard_bp", __name__)

from sqlalchemy import text

@dashboard_bp.route("/summary", methods=["GET"])
@jwt_required()
def dashboard_summary():
    user_id = get_jwt_identity()
    today = datetime.today().date()
    start_month = today.replace(day=1)

    # ✅ Fix: wrap SQL in text() and use scalar()
    total_balance = db.session.execute(
        text("SELECT SUM(balance) FROM account WHERE user_id = :uid"),
        {"uid": user_id}
    ).scalar() or 0

    total_spending = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date >= start_month,
        Transaction.is_refunded == False
    ).scalar() or 0

    # ✅ Adjust if you're using `SavingsGoal` instead of `Goal`
    goals = SavingsGoal.query.filter_by(user_id=user_id).all()
    goal_progress = [
        {"title": g.title, "target": g.target_amount, "current": g.current_saved}
        for g in goals
    ]

    return jsonify({
        "total_balance": round(total_balance, 2),
        "monthly_spending": round(total_spending, 2),
        "goal_progress": goal_progress
    }), 200


@dashboard_bp.route("/spending-by-category", methods=["GET"])
@jwt_required()
def spending_by_category():
    user_id = get_jwt_identity()
    today = datetime.today().date()
    start_month = today.replace(day=1)

    result = db.session.query(
        Category.name,
        func.sum(Transaction.amount)
    ).join(Transaction, Category.id == Transaction.category_id).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date >= start_month,
        Transaction.is_refunded == False
    ).group_by(Category.name).all()

    return jsonify([{"category": name, "amount": float(amount)} for name, amount in result]), 200

@dashboard_bp.route("/monthly-expense", methods=["GET"])
@jwt_required()
def monthly_expense_timeline():
    user_id = get_jwt_identity()
    today = datetime.today().date()
    start_this = today.replace(day=1)
    start_last = (start_this - timedelta(days=1)).replace(day=1)

    this_month = db.session.query(
        Transaction.date,
        func.sum(Transaction.amount)
    ).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date >= start_this,
        Transaction.is_refunded == False
    ).group_by(Transaction.date).order_by(Transaction.date).all()

    last_month = db.session.query(
        Transaction.date,
        func.sum(Transaction.amount)
    ).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date >= start_last,
        Transaction.date < start_this,
        Transaction.is_refunded == False
    ).group_by(Transaction.date).order_by(Transaction.date).all()

    return jsonify({
        "this_month": [{"date": d.isoformat(), "amount": float(a)} for d, a in this_month],
        "last_month": [{"date": d.isoformat(), "amount": float(a)} for d, a in last_month]
    }), 200


@dashboard_bp.route("/top-categories", methods=["GET"])
@jwt_required()
def top_categories():
    user_id = get_jwt_identity()
    today = datetime.today().date()
    start_month = today.replace(day=1)

    result = db.session.query(
        Category.name,
        func.sum(Transaction.amount)
    ).join(Transaction, Category.id == Transaction.category_id).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date >= start_month,
        Transaction.is_refunded == False
    ).group_by(Category.name).order_by(func.sum(Transaction.amount).desc()).limit(5).all()

    return jsonify([{"category": name, "amount": float(amount)} for name, amount in result]), 200


@dashboard_bp.route("/budget-vs-actual", methods=["GET"])
@jwt_required()
def budget_vs_actual():
    user_id = get_jwt_identity()
    today = datetime.today().date()
    start_month = today.replace(day=1)

    envelopes = db.session.query(
        Envelope.name,
        Envelope.budgeted_amount,
        func.sum(Transaction.amount)
    ).outerjoin(Transaction, Transaction.envelope_id == Envelope.id).filter(
        Envelope.user_id == user_id,
        (Transaction.date >= start_month) | (Transaction.date == None),
        (Transaction.type == "expense") | (Transaction.type == None),
        (Transaction.is_refunded == False) | (Transaction.is_refunded == None)
    ).group_by(Envelope.id).all()

    result = []
    for name, budget, spent in envelopes:
        result.append({
            "envelope": name,
            "budget": float(budget),
            "spent": float(spent or 0)
        })

    return jsonify(result), 200


# @dashboard_bp.route("/tips", methods=["GET"])
# @jwt_required()
# def personalized_tips():
#     user_id = get_jwt_identity()
#     # Placeholder tips (could later be ML-based)
#     tips = [
#         "Reduce dining out by 20% to save $50/month",
#         "Your subscription costs are 15% higher this month",
#         "You're on track to meet your savings goal!"
#     ]
#     return jsonify({"tips": tips}), 200



@dashboard_bp.route("/tips", methods=["GET"])
@jwt_required()
def personalized_tips():
    user_id = get_jwt_identity()
    today = datetime.today().date()
    start_month = today.replace(day=1)

    tips = []

    # 1. High dining/entertainment expense
    dining = db.session.query(func.sum(Transaction.amount)).join(Category).filter(
        Transaction.user_id == user_id,
        Transaction.category_id == Category.id,
        Category.name.ilike('%dining%'),  # fixed reference
        Transaction.type == 'expense',
        Transaction.date >= start_month,
        Transaction.is_refunded == False
    ).scalar() or 0

    if dining > 200:
        tips.append(f"You spent £{dining:.2f} on dining this month. Reducing it by 20% could save £{dining * 0.2:.2f}.")

    # 2. Subscriptions overspending
    subs = db.session.query(func.sum(Transaction.amount)).join(Category).filter(
        Transaction.user_id == user_id,
        Transaction.category_id == Category.id,
        Category.name.ilike('%subscription%'),
        Transaction.type == 'expense',
        Transaction.date >= start_month,
        Transaction.is_refunded == False
    ).scalar() or 0

    if subs > 50:
        tips.append(f"Subscriptions cost you £{subs:.2f} this month. Consider cancelling unused ones.")

    # 3. Savings goal progress
    goals = SavingsGoal.query.filter_by(user_id=user_id).all()
    for g in goals:
        if g.target_amount > 0:
            percent = (g.current_saved / g.target_amount) * 100
            if percent < 50:
                tips.append(f"You're {percent:.0f}% toward your goal '{g.title}'. Try allocating more to hit your target.")
            elif percent >= 100:
                tips.append(f"Congrats! You've reached your goal '{g.title}'. Time to create a new one?")

    # 4. Monthly spending
    total_spending = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.type == 'expense',
        Transaction.date >= start_month,
        Transaction.is_refunded == False
    ).scalar() or 0

    if total_spending > 1500:
        tips.append(f"Your spending this month is £{total_spending:.2f}, which is above average. Consider reviewing your budget.")

    if not tips:
        tips.append("Great job! You're spending wisely and staying on track with your goals.")

    return jsonify({"tips": tips}), 200
