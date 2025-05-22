from flask import Blueprint, request, jsonify
from datetime import datetime
from db import mongo

chat_bp = Blueprint("chat", __name__)

@chat_bp.route("/localChat", methods=["POST"])
def save_chat():
    print("save_chat")
    try:
        data = request.get_json()
        email = data.get("email")
        user_message = data.get("user_message")
        bot_response = data.get("bot_response")
        print("save_chat", email, user_message, bot_response)
        if not email or not user_message or not bot_response:
            return jsonify({"error": "Missing fields"}), 400

        today = datetime.utcnow().strftime('%Y-%m-%d')
        collection = mongo.db.chat_history

        # Append messages to the correct day's document
        result = collection.update_one(
            {"email": email, "date": today},
            {"$push": {
                "messages": {
                    "$each": [
                        {"role": "user", "text": user_message},
                        {"role": "bot", "text": bot_response}
                    ]
                }
            }},
            upsert=True
        )

        return jsonify({"message": "Chat saved"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chat_bp.route("/localChat/history", methods=["POST"])
def get_local_chat_history():
    try:
        data = request.get_json()
        email = data.get("email")
        if not email:
            return jsonify({"error": "Email is required"}), 400

        today = datetime.utcnow().strftime("%Y-%m-%d")

        # Debug print
        print(f"Fetching history for email: {email}, date: {today}")

        history = mongo.db.chat_history.find_one(
            {"email": email, "date": today},
            {"_id": 0, "messages": 1}
        )

        if not history:
            print("No history found")
            return jsonify({"messages": []}), 200

        print(f"History found: {history}")
        return jsonify(history), 200

    except Exception as e:
        print(f"Error in get_local_chat_history: {e}")
        return jsonify({"error": str(e)}), 500