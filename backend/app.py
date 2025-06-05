from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db, bcrypt, jwt
from config import Config

# BluePrints
from routes.user_routes import user_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # Routes
    app.register_blueprint(user_bp, url_prefix='/api/users')

    @app.route("/api/hello")
    def hello():
        return jsonify(message="Hello from flask backend!")

    with app.app_context():
        db.create_all()

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000)
