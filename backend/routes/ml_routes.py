import torch
import torch.nn as nn
import numpy as np
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.transaction import Transaction
from models.ml_prediction import MLPrediction
from sqlalchemy import text
import joblib
from datetime import datetime, timedelta

ml_bp = Blueprint("ml_bp", __name__)

# --- LSTM Model Definition ---
class LSTMModel(nn.Module):
    def __init__(self, input_size=1, hidden_size=64, num_layers=1, output_size=1):
        super(LSTMModel, self).__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        out, _ = self.lstm(x)
        out = self.fc(out[:, -1, :])
        return out

# --- Load Model and Scaler ---
MODEL_PATH = "ml/best_lstm_model.pth"
SCALER_PATH = "ml/lstm_feature_scaler.pkl"
MODEL_VERSION = "LSTM_v1"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = LSTMModel()
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.to(device)
model.eval()

scaler = joblib.load(SCALER_PATH)

# --- Helper: Last 5 expenses ---
def get_last_expense_transactions(user_id, limit=5):
    txns = Transaction.query.filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.is_refunded == False
    ).order_by(Transaction.date.desc()).limit(limit).all()

    if not txns or len(txns) < limit:
        return None

    amounts = [txn.amount for txn in reversed(txns)]
    return np.array(amounts).reshape(-1, 1)

# --- Predict Weekly Spending ---
@ml_bp.route('/predict-weekly-spending', methods=["GET"])
@jwt_required()
def predict_weekly_spending():
    user_id = get_jwt_identity()
    amount_data = get_last_expense_transactions(user_id)

    if amount_data is None or len(amount_data) < 5:
        return jsonify({"message": "Not enough transaction data to predict."}), 400

    # --- Prepare input ---
    scaled = scaler.transform(amount_data)[-5:]
    input_seq = torch.tensor(scaled, dtype=torch.float32).unsqueeze(0).to(device)

    # --- Model inference ---
    with torch.no_grad():
        prediction = model(input_seq).cpu().numpy().flatten()[0]

    # --- Clamp extreme values from model output ---
    prediction = np.clip(prediction, -3.0, 3.0)

    # --- Inverse scaling ---
    predicted_scaled = np.array([[prediction]])
    predicted_amount = float(scaler.inverse_transform(predicted_scaled)[0][0])

    # --- Recent 30-day expense average ---
    last_30_days = datetime.now() - timedelta(days=30)
    recent_expenses = Transaction.query.filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.is_refunded == False,
        Transaction.date >= last_30_days
    ).all()
    recent_total = sum(t.amount for t in recent_expenses)
    weekly_avg = recent_total / 4 if recent_total else 0
    cap1 = 2 * weekly_avg

    # --- Get total balance (for 40% cap) ---
    # account_balances = db.session.execute(
    #     "SELECT SUM(balance) FROM account WHERE user_id = :user_id",
    #     {'user_id': user_id}
    # ).scalar()
    account_balances = db.session.execute(
    text("SELECT SUM(balance) FROM account WHERE user_id = :user_id"),
        {'user_id': user_id}
    ).scalar()

    cap2 = account_balances * 0.4 if account_balances else 1000

    # --- Final clamped prediction ---
    final_cap = min(cap1, cap2)
    predicted_amount = min(predicted_amount, final_cap)

    print(f"[LOGIC] User {user_id} | Weekly avg: £{weekly_avg:.2f} | Balance cap: £{cap2:.2f} | Final cap: £{final_cap:.2f}")
    print(f"[DEBUG] Scaled: {prediction} | Final predicted weekly: £{predicted_amount:.2f}")

    # --- Check for duplicate ---
    last_prediction = MLPrediction.query.filter_by(user_id=user_id).order_by(MLPrediction.timestamp.desc()).first()
    if last_prediction and round(last_prediction.predicted_amount, 2) == round(predicted_amount, 2):
        return jsonify({
            "message": "Prediction already exists with the same value for this user.",
            "predicted_class": last_prediction.predicted_class,
            "predicted_amount": round(last_prediction.predicted_amount, 2),
            "model_version": last_prediction.model_version,
            "timestamp": last_prediction.timestamp.isoformat()
        }), 200

    # --- Monthly prediction limit ---
    now = datetime.now()
    start_of_month = datetime(now.year, now.month, 1)
    end_of_month = datetime(now.year + 1, 1, 1) if now.month == 12 else datetime(now.year, now.month + 1, 1)

    monthly_predictions = MLPrediction.query.filter(
        MLPrediction.user_id == user_id,
        MLPrediction.timestamp >= start_of_month,
        MLPrediction.timestamp < end_of_month
    ).count()

    if monthly_predictions >= 3:
        return jsonify({
            "message": "Monthly prediction limit (3) reached.",
            "next_available": end_of_month.strftime("%Y-%m-%d")
        }), 429

    # --- Classification ---
    if predicted_amount < 500:
        predicted_class = "low"
    elif predicted_amount < 2000:
        predicted_class = "medium"
    else:
        predicted_class = "high"

    # --- Save to DB ---
    prediction_record = MLPrediction(
        user_id=user_id,
        transaction_id=None,
        predicted_class=predicted_class,
        predicted_amount=round(predicted_amount, 2),
        model_version=MODEL_VERSION
    )
    db.session.add(prediction_record)
    db.session.commit()

    return jsonify({
        "message": "Prediction successful",
        "predicted_class": predicted_class,
        "predicted_amount": round(predicted_amount, 2),
        "model_version": MODEL_VERSION,
        "timestamp": prediction_record.timestamp.isoformat()
    }), 200
