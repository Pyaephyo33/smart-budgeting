import torch
import numpy as np
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sklearn.preprocessing import MinMaxScaler
from extensions import db
from models.transaction import Transaction
from models.ml_prediction import MLPrediction
import joblib
from datetime import datetime, timedelta

ml_bp = Blueprint("ml_bp", __name__)

# Load model and scaler once at startup
MODEL_PATH = "ml/best_lstm_model.pth"
SCALER_PATH = "ml/lstm_feature_scaler.pkl"
MODEL_VERSION = "LSTM_v1"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = torch.load(MODEL_PATH, map_location=device)
model.eval()
scaler = joblib.load(SCALER_PATH)

def get_last_week_transactions(user_id):
    today = datetime.today().date()
    one_week_