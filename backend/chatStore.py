from flask import Flask, Blueprint, request, jsonify
from db import mongo
import uuid
from datetime import datetime
from llm_utils import llm, memory

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


app = Flask(__name__)


@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        user_message = data.get("message", "")

        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # 🧠 Add user message to memory
        memory.chat_memory.add_user_message(user_message)

        # 🧩 Get the summarized conversation so far
        context = memory.load_memory_variables({}).get("history", "")

        # 🗣️ Combine with user prompt
        prompt = f"{context}\nUser: {user_message}\nAI:"

        # 🚀 Get LLM response from Ollama
        response = llm(prompt)

        # 💾 Add AI message to memory
        memory.chat_memory.add_ai_message(response)

        return jsonify({"response": response})

    except Exception as e:
        print(f"Error in /api/chat: {e}")
        return jsonify({"error": str(e)}), 500


@chat_bp.route("/api/chat/sessions/<user>", methods=["GET"])
def get_all_sessions(user):
    try:
        sessions = mongo.db.chat_sessions.find({"user": user})
        session_list = []
        print(sessions)
        print("testing")
        for s in sessions:
            session_list.append(
                {
                    "session_id": s.get("session_id"),
                    "created_at": s.get("created_at"),
                    "chat_history": s.get("chat_history", []),
                    "active": bool(s.get("active")),  # Ensure it's a boolean
                    "last_message": (
                        s["chat_history"][-1].get("question", "")
                        if s.get("chat_history")
                        else ""
                    ),
                }
            )

        return jsonify(session_list), 200

    except Exception as e:
        print(f"Error fetching sessions: {e}")
        return jsonify({"error": str(e)}), 500


@chat_bp.route("/api/chat/delete", methods=["DELETE"])
def delete_chat_session():
    data = request.get_json()
    user = data.get("user")
    session_id = data.get("session_id")

    if not user or not session_id:
        return jsonify({"success": False, "message": "Missing user or session_id"}), 400

    result = mongo.db.chat_sessions.delete_one({"user": user, "session_id": session_id})

    if result.deleted_count > 0:
        return (
            jsonify({"success": True, "message": "Chat session deleted successfully"}),
            200,
        )
    else:
        return jsonify({"success": False, "message": "No matching session found"}), 404
