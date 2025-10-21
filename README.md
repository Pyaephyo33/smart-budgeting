# 💸 Smart Budgeting – Financial Planning and Expense Forecasting App

**Smart Budgeting** is a full-stack, machine-learning-integrated web application that empowers users to manage their personal finances intelligently. It enables budgeting, expense categorization, savings goal tracking, and automated forecasts based on real spending habits.

---

## 🧩 What This Project Does

- ✅ Tracks income and expenses
- ✅ Categorizes transactions into “Needs”, “Wants”, and “Savings”
- ✅ Allows users to create financial goals with deadlines and track progress
- ✅ Forecasts future expenses using ML models trained on personal history
- ✅ Shows dashboards with pie charts, line graphs, and budget summaries
- ✅ Uses JWT for secure authentication
- ✅ Runs in Dockerized environment for easy deployment

---

## ⚙️ Tech Stack Overview

| Layer       | Tech Used              |
|-------------|------------------------|
| Frontend    | React + Vite           |
| Backend     | Flask + SQLAlchemy     |
| ML          | Scikit-learn (regression/time-series) |
| Database    | PostgreSQL             |
| Auth        | JWT (JSON Web Tokens)  |
| DevOps      | Docker + Docker Compose |
| Web Server  | Nginx (reverse proxy)  |

---

## 📁 Folder Structure

```
smart-budgeting/
├── frontend/                # React (Vite) app for UI
│   ├── components/          # Cards, charts, settings, modals
│   └── pages/               # Dashboard, login, transactions, settings
├── backend/                 # Flask API
│   ├── app.py               # Entrypoint for Flask app
│   ├── routes/              # API endpoints
│   ├── ml_routes.py         # ML model inference
│   └── models/              # DB Models
├── nginx/                   # Reverse proxy config
├── docker-compose.yml       # Orchestrates frontend + backend + DB
```

---

## 🚀 How to Run (Step-by-Step)

### 🔹 1. Prerequisites

- Docker & Docker Compose installed

### 🔹 2. Clone the Repo

```bash
git clone https://github.com/Pyaephyo33/smart-budgeting.git
cd smart-budgeting
```

### 🔹 3. Start All Services

```bash
docker-compose up --build
```

This launches:
- Flask API on port 5000
- PostgreSQL database container
- React frontend served on port 3000 via Nginx
- ML endpoints and database migrations

### 🔹 4. Access the App

```
Frontend: http://localhost:3000
Backend (API): http://localhost:5000
```

---

## 🧠 How It Works – Explained Clearly

### 🧾 Expense Tracking
- Users input their income and expenses manually or through a form
- Each transaction is tagged by:
  - Envelope (budget category)
  - Type (income/expense)
  - Payment method
  - Linked savings goal (optional)

### 🎯 Goal Planning
- Users can define savings goals like “Emergency Fund” or “New Laptop”
- The app tracks progress toward each goal over time
- If a goal is overdue, it's flagged visually

### 🔐 User Authentication
- Uses JWT (JSON Web Token) to store user identity securely
- Every API request includes the token for protected routes

### 📊 Dashboards
- The frontend fetches backend data using React hooks
- Visualizations:
  - Pie Chart: Expense distribution by envelope
  - Line Chart: Monthly or weekly spending trends
  - Forecast Card: ML-predicted expenses
  - Goal Tracker: Meter showing goal progress

---

## 🧮 ML Forecasting Module – Explained

### Goal:
Predict future expenses for the next 7 days to help users anticipate financial needs.

### 🔬 Pipeline:
1. **Data Collection**: User’s past transactions are retrieved.
2. **Preprocessing**:
   - Aggregated by date
   - Missing values handled
   - Normalized via Scikit-learn `MinMaxScaler`
3. **Model Types Tested**:
   - Linear Regression
   - Ridge Regression
   - SVR
   - Time Series: ARIMA
4. **Evaluation**:
   - RMSE (Root Mean Squared Error)
   - R² Score
5. **Inference**:
   - The best model is stored
   - `/predict` endpoint returns JSON with forecast data
6. **Frontend Rendering**:
   - Actual vs. predicted shown with ±5% margin

---

## 🛠 Developer Notes

### ✅ To Test Backend Locally:
```bash
cd backend
python app.py
```

### ✅ To Run Frontend Locally (Dev Mode):
```bash
cd frontend
npm install
npm run dev
```

### ✅ ML Testing:
```bash
cd backend
python ml_routes.py
```

---

## 🧪 Example Features You Can Try

| Feature                       | Example |
|------------------------------|---------|
| Add a transaction            | Expense → Groceries → £40 |
| Set a savings goal           | “Travel Fund” → £500 by Dec |
| View monthly forecast        | On dashboard (auto-generated) |
| Get warning on overdue goal | “Laptop Fund overdue” |

---

## 🎯 Future Plans

- Email notifications for goal deadlines
- Auto-categorization using NLP
- Multi-user shared budgets
- Currency conversion (multi-region support)
- Real-time ML retraining on new data

---

## 📜 License

This project is licensed for academic and educational purposes.

---

## 📬 Contact

- GitHub: [Pyaephyo33](https://github.com/Pyaephyo33)

