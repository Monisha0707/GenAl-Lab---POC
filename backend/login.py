from flask import Blueprint, request, jsonify
from db import mongo
from werkzeug.security import check_password_hash
import jwt
import datetime
from bson import ObjectId

login_bp = Blueprint("login", __name__)

# Secret key for encoding JWT (use a secure key in production)
SECRET_KEY = "your_secret_key_here"


@login_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()

        if not data or not data.get("email") or not data.get("password"):
            return jsonify({"error": "Email and password are required"}), 400

        user_collection = mongo.db.user
        user = user_collection.find_one({"email": data["email"]})
        print("User found:", user)  # Debugging line to check user retrieval
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Verify password
        if not check_password_hash(user["password"], data["password"]):
            return jsonify({"error": "Incorrect password"}), 401

        # Create JWT token (expires in 1 hour)
        token = jwt.encode(
            {
                "email": user["email"],
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1),
            },
            SECRET_KEY,
            algorithm="HS256",
        )

        # ✅ Include user ID in the response (convert ObjectId to string)
        return (
            jsonify(
                {
                    "message": "Login successful!",
                    "token": token,
                    "email": user["email"],
                    "userID": str(user["_id"]),
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500
