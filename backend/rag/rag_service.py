import requests
import json
import chromadb
from chromadb.config import Settings

# Initialize Chroma client (persistent vector DB)
client = chromadb.PersistentClient(path="./db/chroma")

def query_local_ollama(prompt, model="llama3.2:latest"):
    """
    Send a query to the local Ollama instance and return the response text.
    """
    url = "http://localhost:11434/api/generate"
    headers = {"Content-Type": "application/json"}
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False
    }

    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        response.raise_for_status()
        data = response.json()
        return data.get("response", "")
    except requests.exceptions.RequestException as e:
        print(f"❌ Ollama request failed: {e}")
        return "Error communicating with local Ollama instance."


def query_kb(kb_name, query, top_k=3):
    """
    1. Retrieve top relevant chunks using vector similarity.
    2. Build context prompt.
    3. Ask LLM (local Ollama) and return answer.
    """
    # Step 1 — Get the KB collection
    collection = client.get_collection(kb_name)

    # Step 2 — Retrieve top matching documents
    results = collection.query(
        query_texts=[query],
        n_results=top_k,
        include=["documents", "metadatas", "distances"]
    )

    docs = results["documents"][0] if results["documents"] else []
    context = "\n\n".join(docs)

    # Step 3 — Build a structured prompt
    prompt = f"""
You are a knowledgeable and helpful AI assistant answering user questions based on the given context.

Context:
{context}

User question:
{query}

Answer clearly and concisely, referencing the context when relevant.
If the answer is not in the context, say so politely.
"""

    # Step 4 — Query local LLM (Ollama)
    answer = query_local_ollama(prompt)

    return {
        "query": query,
        "context_used": docs,
        "answer": answer
    }


# backend/rag/routes.py
from flask import Blueprint, request, jsonify, current_app
from rag.pdf_utils import extract_text_from_pdf_bytes
from rag.rag_service import  query_kb
import io

rag_bp = Blueprint("rag_bp", __name__)

@rag_bp.route("/create_kb", methods=["POST"])
def create_kb():
    """
    Accepts multipart/form-data:
      - file: pdf
      - kb_name: string
    """
    try:
        kb_name = request.form.get("kb_name")
        file = request.files.get("file")
        if not kb_name or not file:
            return jsonify({"error": "kb_name and file are required"}), 400

        pdf_bytes = file.read()
        full_text, pages = extract_text_from_pdf_bytes(pdf_bytes)
        stats = create_kb_and_store(kb_name, file.filename, full_text)
        return jsonify({"message": "KB created", "stats": stats}), 200
    except Exception as e:
        current_app.logger.exception("create_kb error")
        return jsonify({"error": str(e)}), 500

@rag_bp.route("/list_kbs", methods=["GET"])
def list_kbs():
    """
    Returns existing collections (KB names).
    """
    try:
        import chromadb
        from chromadb.config import Settings
        client = chromadb.PersistentClient(path="./db/chroma")
        cols = client.list_collections()
        names = [c.name for c in cols]
        return jsonify({"kbs": names}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@rag_bp.route("/query", methods=["POST"])
def query():
    """
    JSON body: { kb_name: str, query: str, top_k: int (optional) }
    """
    data = request.get_json() or {}
    kb_name = data.get("kb_name")
    query_text = data.get("query")
    top_k = int(data.get("top_k", 4))
    if not kb_name or not query_text:
        return jsonify({"error": "kb_name and query required"}), 400
    try:
        results = query_kb(kb_name, query_text, top_k=top_k)
        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@rag_bp.route("/get_embeddings/<kb_name>", methods=["GET"])
def get_embeddings(kb_name):
    """
    Debug endpoint to fetch stored embeddings for a KB.
    """
    try:
        import chromadb
        from chromadb.config import Settings
        client = chromadb.PersistentClient(path="./db/chroma")
        collection = client.get_collection(kb_name)

        # Fetch a few items to inspect (with embeddings)
        items = collection.get(limit=3, include=["embeddings"])
        return jsonify({
            "ids": items["ids"],
            "metadatas": items["metadatas"],
            "documents": items["documents"],
            "embeddings": items["embeddings"]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
