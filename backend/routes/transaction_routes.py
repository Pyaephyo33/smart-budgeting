from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.transaction import Transaction
from models.account import Account
from models.category import Category
from models.envelope import Envelope
from models.savings_goal import SavingsGoal
from extensions import db
from datetime import datetime, date

transaction_bp = Blueprint('transaction_bp', __name__)

# Get dropdown data for creating transaction
@transaction_bp.route('/dropdown-data', methods=['GET'])
@jwt_required()
def get_dropdown_data():
    user_id = get_jwt_identity()

    accounts = Account.query.filter_by(user_id=user_id).all()
    envelopes = Envelope.query.filter_by(user_id=user_id).all()
    categories = Category.query.all()
    goals = SavingsGoal.query.filter_by(user_id=user_id).all()

    return jsonify({
        "accounts": [
            {"id": a.id, "account_type": a.account_type, "balance": a.balance} for a in accounts
        ],
        "envelopes": [
            {"id": e.id, "name": e.name} for e in envelopes
        ],
        "categories": [
            {"id": c.id, "name": c.name} for c in categories
        ],
        "goals": [
            {"id": g.id, "title": g.title} for g in goals
        ]
    }), 200



# Create Transaction
@transaction_bp.route('/', methods=['POST'])
@jwt_required()
def create_transaction():
    user_id = get_jwt_identity()
    data = request.get_json()

    account_id = data.get("account_id")
    envelope_id = data.get("envelope_id")
    category_id = data.get("category_id")
    goal_id = data.get("goal_id")
    amount = data.get("amount")
    payment_method = data.get("payment_method", "cash")
    txn_type = data.get("type")
    notes = data.get("notes")
    date_str = data.get("date")

    if not amount or not txn_type:
        return jsonify({"message": "Amount and type are required"}), 400

    try:
        date = datetime.strptime(date_str, "%Y-%m-%d").date() if date_str else datetime.now().date()
    except ValueError:
        return jsonify({"message": "Invalid date format (use YYYY-MM-DD)"}), 400

    if account_id:
        account = Account.query.filter_by(id=account_id, user_id=user_id).first()
        if not account:
            return jsonify({"message": "Account not found"}), 404

        if txn_type == "expense" and account.balance < amount:
            return jsonify({"message": "Insufficient balance."}), 400

        if txn_type == "expense":
            account.balance -= amount
        elif txn_type == "income":
            account.balance += amount

    txn = Transaction(
        user_id=user_id,
        account_id=account_id,
        envelope_id=envelope_id,
        category_id=category_id,
        goal_id=goal_id,
        amount=amount,
        payment_method=payment_method,
        type=txn_type,
        notes=notes,
        date=date
    )

    db.session.add(txn)
    db.session.commit()
    return jsonify({"message": "Transaction created successfully"}), 201

# Get all transactions for user
@transaction_bp.route('/', methods=['GET'])
@jwt_required()
def get_transactions():
    user_id = get_jwt_identity()

    txns = db.session.query(
        Transaction,
        Account.account_type.label("account_name"),
        Envelope.name.label("envelope_name"),
        Category.name.label("category_name"),
        SavingsGoal.title.label("goal_title")
    ).outerjoin(Account, Transaction.account_id == Account.id)\
     .outerjoin(Envelope, Transaction.envelope_id == Envelope.id)\
     .outerjoin(Category, Transaction.category_id == Category.id)\
     .outerjoin(SavingsGoal, Transaction.goal_id == SavingsGoal.id)\
     .filter(Transaction.user_id == user_id).all()

    result = []
    for t, account_name, envelope_name, category_name, goal_title in txns:
        result.append({
            "id": t.id,
            "amount": t.amount,
            "type": t.type,
            "payment_method": t.payment_method,
            "date": t.date.isoformat(),
            "notes": t.notes,
            "is_refunded": t.is_refunded,
            "account": account_name,
            "envelope": envelope_name,
            "category": category_name,
            "goal": goal_title
        })

    return jsonify(result), 200


# Delete a transaction
@transaction_bp.route('/<int:txn_id>', methods=['DELETE'])
@jwt_required()
def delete_transaction(txn_id):
    user_id = get_jwt_identity()
    txn = Transaction.query.filter_by(id=txn_id, user_id=user_id).first()

    if not txn:
        return jsonify({"message": "Transaction not found"}), 404
    
    # Revert balance
    account = Account.query.get(txn.account_id)
    if txn.type == "income":
        account.balance -= txn.amount
    elif txn.type == "expense":
        account.balance += txn.amount

    db.session.delete(txn)
    db.session.commit()
    return jsonify({"message": "Transaction deleted and account balance adjusted"}), 200


# Filter/Search Transaction
@transaction_bp.route('/search', methods=['GET'])
@jwt_required()
def filter_transactions():
    user_id = get_jwt_identity()
    query = Transaction.query.filter_by(user_id=user_id)

    # Optional filters
    account_id = request.args.get('account_id')
    category_id = request.args.get('category_id')
    envelope_id = request.args.get('envelope_id')
    goal_id = request.args.get('goal_id')
    tx_type = request.args.get('type')
    date_from = request.args.get('from')
    date_to = request.args.get('to')

    if account_id:
        query = query.filter(Transaction.account_id == account_id)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if envelope_id:
        query = query.filter(Transaction.envelope_id == envelope_id)
    if goal_id:
        query = query.filter(Transaction.goal_id == goal_id)
    if tx_type:
        query = query.filter(Transaction.type == tx_type)
    if date_from:
        query = query.filter(Transaction.date >= date_from)
    if date_to:
        query = query.filter(Transaction.date <= date_to)

    transactions = query.order_by(Transaction.date.desc()).all()

    result = [{
        "id": t.id,
        "amount": t.amount,
        "type": t.type,
        "date": t.date.isoformat(),
        "notes": t.notes,
        "account_id": t.account_id,
        "envelope_id": t.envelope_id,
        "category_id": t.category_id,
        "goal_id": t.goal_id,
        "payment_method": t.payment_method
    } for t in transactions]

    return jsonify(result), 200


# Montly Report
@transaction_bp.route('/report/monthly', methods=['GET'])
@jwt_required()
def monthly_report():
    user_id = get_jwt_identity()
    year = request.args.get('year', date.today().year, type=int)
    month = request.args.get('month', date.today().month, type=int)

    total = db.session.query(
        db.func.sum(Transaction.amount)
    ).filter(
        Transaction.user_id == user_id,
        db.extract('year', Transaction.date) == year,
        db.extract('month', Transaction.date) == month
    ).scalar() or 0

    return jsonify({
        "year":year,
        "month":month,
        "total":total
    }), 200



# Annual Report
@transaction_bp.route('/report/annual', methods=["GET"])
@jwt_required()
def annual_report():
    user_id = get_jwt_identity()
    year = request.args.get('year', date.today().year, type=int)

    monthly_totals = db.session.query(
        db.extract('month', Transaction.date).label('month'),
        db.func.sum(Transaction.amount).label('total')
    ).filter(
        Transaction.user_id == user_id,
        db.extract('year', Transaction.date) == year
    ).group_by('month').order_by('month').all()

    report = [{"month": int(m), "total": float(t)} for m, t in monthly_totals]

    return jsonify({
        "year": year,
        "monthly_report": report
    }), 200


# Update Transaction
@transaction_bp.route('/<int:transaction_id>', methods=['PUT'])
@jwt_required()
def update_transaction(transaction_id):
    user_id = get_jwt_identity()
    transaction = Transaction.query.filter_by(id=transaction_id, user_id=user_id).first()

    if not transaction:
        return jsonify({"message": "Transaction not found"}), 404
    
    data = request.get_json()
    editable_fields = [
        'payment_method', 'type', 'notes', 'date',
        'envelope_id', 'category_id', 'goal_id'
    ]

    for field in editable_fields:
        if field in data:
            setattr(transaction, field, data[field])

    db.session.commit()
    return jsonify({"message": "Transaction updated successfully"}), 200



# Refund Transaction (change amount + adjust balance)
@transaction_bp.route('/<int:transaction_id>/refund', methods=['PATCH'])
@jwt_required()
def refund_transaction(transaction_id):
    user_id = get_jwt_identity()
    transaction = Transaction.query.filter_by(id=transaction_id, user_id=user_id).first()

    if not transaction:
        return jsonify({"message": "Transaction not found"}), 404

    if transaction.type == "income":
        return jsonify({"message": "Refunds are not allowed for income transactions"}), 400

    if transaction.is_refunded:
        return jsonify({"message": "This transaction has already been refunded"}), 400

    account = Account.query.filter_by(id=transaction.account_id, user_id=user_id).first()
    if not account:
        return jsonify({"message": "Associated account not found"}), 404

    # Adjust balance: refund the original expense
    account.balance += transaction.amount
    transaction.is_refunded = True

    db.session.commit()
    return jsonify({
        "message": "Transaction fully refunded",
        "refunded_amount": transaction.amount,
        "new_account_balance": account.balance
    }), 200


from sqlalchemy import text

@transaction_bp.route('/expense-summary', methods=["GET"])
@jwt_required()
def expense_summary():
    user_id = get_jwt_identity()
    time_range = request.args.get("range", "monthly")

    if time_range not in ["monthly", "weekly"]:
        return jsonify({"message": "Invalid range. Use 'monthly' or 'weekly'."}), 400

    # Secure format string for TO_CHAR
    date_format = "YYYY-MM" if time_range == "monthly" else "IYYY-IW"


    sql = text(f"""
        SELECT 
            TO_CHAR(t.date, :date_format) as date,
            e.name as envelope,
            SUM(t.amount) as amount
        FROM transactions t
        JOIN envelope e ON t.envelope_id = e.id
        WHERE t.user_id = :user_id AND t.type = 'expense'
        GROUP BY TO_CHAR(t.date, :date_format), e.name
        ORDER BY TO_CHAR(t.date, :date_format)
    """)

    result = db.session.execute(sql, {"user_id": user_id, "date_format": date_format})
    return jsonify([dict(row._mapping) for row in result]), 200



@transaction_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_transaction(id):
    user_id = get_jwt_identity()

    txn = db.session.query(
        Transaction,
        Account.account_type.label("account"),
        Envelope.name.label("envelope"),
        Category.name.label("category"),
        SavingsGoal.title.label("goal")
    ).outerjoin(Account, Transaction.account_id == Account.id)\
     .outerjoin(Envelope, Transaction.envelope_id == Envelope.id)\
     .outerjoin(Category, Transaction.category_id == Category.id)\
     .outerjoin(SavingsGoal, Transaction.goal_id == SavingsGoal.id)\
     .filter(Transaction.user_id == user_id, Transaction.id == id).first()

    if not txn:
        return jsonify({"message": "Transaction not found"}), 404

    t, account, envelope, category, goal = txn

    return jsonify({
        "id": t.id,
        "amount": t.amount,
        "type": t.type,
        "payment_method": t.payment_method,
        "date": t.date.isoformat(),
        "notes": t.notes,
        "is_refunded": t.is_refunded,
        "account": account,
        "envelope": envelope,
        "category": category,
        "goal": goal,
    }), 200
