from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Allow CORS for all routes

@app.route("/api/hello")
def hello():
    return jsonify(message="Hello from Flask backend!")