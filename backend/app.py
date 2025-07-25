from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db, bcrypt, jwt
from config import Config

# BluePrints
from routes.user_routes import user_bp
from routes.account_routes import account_bp
from routes.category_routes import category_bp
from routes.envelope_routes import envelope_bp
from routes.savings_goal_routes import goal_bp
from routes.transaction_routes import transaction_bp
from routes.ml_routes import ml_bp
from routes.dashboard_routes import dashboard_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # Routes
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(account_bp, url_prefix='/api/accounts')
    app.register_blueprint(category_bp, url_prefix='/api/categories')
    app.register_blueprint(envelope_bp, url_prefix='/api/envelopes')
    app.register_blueprint(goal_bp, url_prefix='/api/goals')
    app.register_blueprint(transaction_bp, url_prefix='/api/transactions')
    app.register_blueprint(ml_bp, url_prefix='/api/ml')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

    @app.route("/api/hello")
    def hello():
        return jsonify(message="Hello from flask backend!")

    with app.app_context():
        db.create_all()

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000)
