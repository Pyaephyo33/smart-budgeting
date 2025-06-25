import torch
import torch.nn as nn
import numpy as np
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.transaction import Transaction
from models.ml_prediction import MLPrediction
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

# --- Helper: Get User Transactions in Last 7 Days ---
# def get_last_week_transactions(user_id):
#     today = datetime.today().date()
#     one_week_ago = today - timedelta(days=7)  # change to 30 for testing

#     txns = Transaction.query.filter(
#         Transaction.user_id == user_id,
#         Transaction.date >= one_week_ago,
#         Transaction.date <= today,
#         Transaction.type == "expense",
#         Transaction.is_refunded == False
#     ).order_by(Transaction.date).all()

#     amounts = [txn.amount for txn in txns]
#     print(f"[DEBUG] User {user_id} | Transactions in last week: {len(amounts)} | Amounts: {amounts}")
#     return np.array(amounts).reshape(-1, 1) if amounts else None

def get_last_expense_transactions(user_id, limit=5):
    txns = Transaction.query.filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.is_refunded == False
    ).order_by(Transaction.date.desc()).limit(limit).all()

    if not txns or len(txns) < limit:
        return None

    # We reverse because we want chronological order
    amounts = [txn.amount for txn in reversed(txns)]
    print(f"[DEBUG] User {user_id} | Last {limit} expenses: {amounts}")
    return np.array(amounts).reshape(-1, 1)


@ml_bp.route('/predict-weekly-spending', methods=["GET"])
@jwt_required()
def predict_weekly_spending():
    user_id = get_jwt_identity()
    amount_data = get_last_expense_transactions(user_id)

    if amount_data is None or len(amount_data) < 5:
        return jsonify({"message": "Not enough transaction data to predict."}), 400

    # Prepare input
    scaled = scaler.transform(amount_data)[-5:]
    input_seq = torch.tensor(scaled, dtype=torch.float32).unsqueeze(0).to(device)

    # Run model
    with torch.no_grad():
        prediction = model(input_seq).cpu().numpy().flatten()[0]

    predicted_scaled = np.array([[prediction]])
    predicted_amount = float(scaler.inverse_transform(predicted_scaled)[0][0])

    # Check if the same prediction already exists for the user
    last_prediction = MLPrediction.query.filter_by(user_id=user_id).order_by(MLPrediction.timestamp.desc()).first()
    if last_prediction and round(last_prediction.predicted_amount, 2) == round(predicted_amount, 2):
        return jsonify({
            "message": "Prediction already exists with the same value for this user.",
            "predicted_class": last_prediction.predicted_class,
            "predicted_amount": round(last_prediction.predicted_amount, 2),
            "model_version": last_prediction.model_version,
            "timestamp": last_prediction.timestamp.isoformat()
        }), 200

    # Classification
    if predicted_amount < 50:
        predicted_class = "low"
    elif predicted_amount < 200:
        predicted_class = "medium"
    else:
        predicted_class = "high"

    # Save to DB
    prediction_record = MLPrediction(
        user_id=user_id,
        transaction_id=None,
        predicted_class=predicted_class,
        predicted_amount=predicted_amount,
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
