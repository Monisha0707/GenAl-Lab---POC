from flask import Blueprint, request, jsonify
from db import mongo
from werkzeug.security import generate_password_hash

register_bp = Blueprint("register", __name__)


@register_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.json
        user_collection = mongo.db.user
        # Check if user already exists with this email
        existing_user = user_collection.find_one({"email": data["email"]})
        if existing_user:
            return jsonify({"error": "User already exists with this email"}), 400

        # Insert the new user
        user_collection.insert_one(
            {
                "name": data["name"],
                "email": data["email"],
                "password": generate_password_hash(data["password"]),
            }
        )

        return jsonify({"message": "User registered successfully!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
