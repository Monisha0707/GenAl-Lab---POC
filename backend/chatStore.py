from flask import Blueprint, request, jsonify
from db import mongo
import uuid
from datetime import datetime

chat_bp = Blueprint("chat_bp", __name__)
MAX_CONTEXT_MESSAGES = 10


# 💾 Save chat
@chat_bp.route("/api/chat/save", methods=["POST"])
def save_message():
    data = request.get_json()
    user = data["user"]
    question = data["message"]
    answer = data["response"]
    session_id = data.get("session_id")

    # 🧠 Check for active session or use the provided session_id
    session = mongo.db.chat_sessions.find_one({"user": user, "session_id": session_id})

    if not session:
        session = {
            "user": user,
            "session_id": session_id,
            "active": True,
            "chat_history": [],
            "created_at": datetime.utcnow(),
        }

    # Append new Q/A
    session["chat_history"].append({"question": question, "answer": answer})
    session["chat_history"] = session["chat_history"][-MAX_CONTEXT_MESSAGES:]

    mongo.db.chat_sessions.update_one(
        {"user": user, "session_id": session_id},
        {"$set": session},
        upsert=True,
    )

    return jsonify({"success": True, "message": "Chat saved"}), 200


# 📜 Get chats
@chat_bp.route("/api/chat/<user>/<session_id>", methods=["GET"])
def get_chats(user, session_id):
    session = mongo.db.chat_sessions.find_one({"user": user, "session_id": session_id})
    if not session:
        return jsonify([]), 200
    return jsonify(session.get("chat_history", [])), 200


# 🧹 End current session
@chat_bp.route("/api/chat/end/<user>/<session_id>", methods=["POST"])
def end_session(user, session_id):
    mongo.db.chat_sessions.update_one(
        {"user": user, "session_id": session_id},
        {"$set": {"active": False, "ended_at": datetime.utcnow()}},
    )
    return jsonify({"success": True, "message": "Session ended"}), 200
