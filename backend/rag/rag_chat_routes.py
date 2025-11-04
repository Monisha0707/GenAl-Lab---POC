from flask import Flask, Blueprint, jsonify, request, Response
from bson.json_util import dumps
from datetime import datetime
from db import mongo
from rag.rag_service import query_kb  # assuming your query_kb and query_local_ollama are here
from flask_cors import cross_origin

rag_chat_bp = Blueprint("rag_chat_bp", __name__)

MAX_CONTEXT_MESSAGES = 15


## 💬 Save RAG chat (question + answer + citations)
@rag_chat_bp.route("/api/ragchat/save", methods=["POST", "OPTIONS"])
@cross_origin(origins="*")
def save_rag_chat():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "No JSON body provided"}), 400

        user = data.get("user")
        question = data.get("message")
        answer = data.get("response")
        session_id = data.get("session_id")
        kb_name = data.get("kb_name", "default_kb")
        citations = data.get("citations", [])

        if not user or not session_id:
            return jsonify({"error": "Missing user or session_id"}), 400

        # ✅ Build new entry
        new_entry = {
            "question": question,
            "answer": answer,
            "citations": citations,
            "timestamp": datetime.utcnow().isoformat()
        }

        # ✅ Upsert logic — safely push to chat history without overwriting entire doc
        mongo.db.rag_chat_sessions.update_one(
            {"user": user, "session_id": session_id},
            {
                "$setOnInsert": {
                    "user": user,
                    "session_id": session_id,
                    "kb_name": kb_name,
                    "active": True,
                    "created_at": datetime.utcnow(),
                },
                "$push": {"rag_chat_history": {"$each": [new_entry], "$slice": -MAX_CONTEXT_MESSAGES}},
            },
            upsert=True
        )

        return jsonify({"success": True, "message": "RAG chat saved successfully"}), 200

    except Exception as e:
        print(f"❌ Error saving RAG chat: {e}")
        return jsonify({"error": str(e)}), 500





# 📜 Get all RAG chats for a given session
@rag_chat_bp.route("/api/chat/ragChat/<user>/<session_id>", methods=["GET"])
@cross_origin(origins="*")
def get_rag_chats(user, session_id):
    print(f"📂 Fetching RAG chats for user: {user}, session: {session_id}")
    try:
        session = mongo.db.rag_chat_sessions.find_one(
            {"user": user, "session_id": session_id}
        )
        if not session:
            return jsonify([]), 200
        print(session)
        # ✅ Properly serialize Mongo types (like datetime, ObjectId)
        return Response(
            dumps(session.get("rag_chat_history", [])),
            mimetype="application/json",
        )

    except Exception as e:
        print(f"❌ Error fetching RAG chats: {e}")
        return jsonify({"error": str(e)}), 500



# 📋 Get all RAG sessions for a given user
@rag_chat_bp.route("/api/chat/ragSessions/<user>", methods=["GET"])
@cross_origin(origins="*")  # Allow all origins for dev
def get_all_rag_sessions(user):
    print(f"📂 Fetching RAG sessions for user: {user}")
    try:
        sessions = mongo.db.rag_chat_sessions.find({"user": user})
        session_list = []

        for s in sessions:
            history = s.get("rag_chat_history", [])
            session_list.append({
                "session_id": s.get("session_id"),
                "kb_name": s.get("kb_name"),
                "created_at": s.get("created_at"),
                "active": bool(s.get("active")),
                "rag_chat_history": [
                    {
                        "question": m.get("question", ""),
                        "answer": m.get("answer", ""),
                        "citations": m.get("citations", []),
                        "timestamp": m.get("timestamp", "")
                    } for m in history
                ],
                "last_message": history[-1].get("question", "") if history else "",
            })

        print(f"📦 Returning {len(session_list)} sessions with consistent structure.")
        return jsonify(session_list), 200

    except Exception as e:
        print(f"❌ Error fetching RAG sessions: {e}")
        return jsonify({"error": str(e)}), 500


# 🧹 End RAG session
@rag_chat_bp.route("/api/ragchat/end/<user>/<session_id>", methods=["POST"])
@cross_origin(origins="*")  # Allow all origins for dev
def end_rag_session(user, session_id):
    try:
        mongo.db.rag_chat_sessions.update_one(
            {"user": user, "session_id": session_id},
            {"$set": {"active": False, "ended_at": datetime.utcnow()}},
        )
        return jsonify({"success": True, "message": "RAG session ended"}), 200
    except Exception as e:
        print(f"❌ Error ending RAG session: {e}")
        return jsonify({"error": str(e)}), 500

@rag_chat_bp.route("/api/ragChat", methods=["POST", "OPTIONS"])
@rag_chat_bp.route("/ragChat", methods=["POST", "OPTIONS"])
@cross_origin(origins="*")
def rag_chat():
    """
    Handle RAG-based chat requests using an existing KB and Ollama model.
    """
    data = request.get_json()
    kb_name = data.get("kb_name")
    question = data.get("query")
    user_id = data.get("user_id", "guest")
    session_id = data.get("session_id")

    if not kb_name or not question:
        return jsonify({"error": "Missing kb_name or query"}), 400

    try:
        # Step 1 — Query KB and LLM
        result = query_kb(kb_name, question, top_k=4)

        answer = result.get("answer") or result.get("output_text", "No answer generated.")
        context_used = result.get("context_used") or result.get("source_documents", [])

        # ✅ Step 2 — Format citations safely
        citations = []
        for doc in context_used:
            try:
                if isinstance(doc, dict):
                    # Handle dict-like documents (from Mongo, FAISS, etc.)
                    snippet = doc.get("page_content") or doc.get("text") or str(doc)
                    source = (
                        doc.get("metadata", {}).get("source")
                        or doc.get("source")
                        or "Unknown Source"
                    )
                else:
                    # Handle LangChain Document-like objects
                    snippet = getattr(doc, "page_content", str(doc))
                    meta = getattr(doc, "metadata", {}) or {}
                    source = meta.get("source", "Unknown Source")

                # Append formatted snippet (trimmed for UI)
                citations.append(f"{source}: {snippet[:300]}...")

            except Exception as inner_e:
                citations.append(f"Error reading citation: {str(inner_e)}")

        # Step 3 — Save chat to MongoDB
        db = mongo.cx["rag_chat_db"]
        collection = db[f"rag_chat_{user_id}"]

        chat_doc = {
            "session_id": session_id,
            "user_id": user_id,
            "kb_name": kb_name,
            "question": question,
            "answer": answer,
            "citations": citations,
            "timestamp": datetime.now().isoformat(),
        }
        collection.insert_one(chat_doc)

        # Step 4 — Respond to frontend
#         print("📘 DEBUG RESPONSE:", {
#     "role": "bot",
#     "text": answer,
#     "citations": citations
# })

        return jsonify({
            "role": "bot",
            "text": answer,
            "citations": citations,
        }), 200

    except Exception as e:
        print(f"[rag_chat ERROR] {e}")
        return jsonify({"error": str(e)}), 500


# 🗑️ Delete a RAG chat session
@rag_chat_bp.route("/api/chat/ragchat/delete/<user>/<session_id>", methods=["DELETE", "OPTIONS"])
@cross_origin(origins="*")
def delete_rag_session(user, session_id):
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        result = mongo.db.rag_chat_sessions.delete_one({"user": user, "session_id": session_id})
        if result.deleted_count == 0:
            return jsonify({"error": "Session not found"}), 404
        return jsonify({"success": True, "message": "Session deleted successfully"}), 200
    except Exception as e:
        print(f"❌ Error deleting session: {e}")
        return jsonify({"error": str(e)}), 500
