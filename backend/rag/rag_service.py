import requests
import json
import chromadb
from chromadb.config import Settings

# backend/rag/routes.py
from flask import Blueprint, request, jsonify, current_app
from rag.pdf_utils import extract_text_from_pdf_bytes
# from rag.rag_service import  query_kb
import io
from datetime import datetime
from db import mongo  # ✅ using your centralized Mongo connection
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
    4. Include metadata for citations.
    """
    collection = client.get_collection(kb_name)

    results = collection.query(
        query_texts=[query],
        n_results=top_k,
        include=["documents", "metadatas", "distances"]
    )

    docs = results["documents"][0] if results["documents"] else []
    metadatas = results["metadatas"][0] if results["metadatas"] else []
    distances = results["distances"][0] if results["distances"] else []

    if not docs:
        return {
            "query": query,
            "matches": [],
            "context_used": [],
            "answer": "I'm sorry, but I don’t have any relevant information in the knowledge base to answer that."
        }

    context = "\n\n".join(docs)

    prompt = f"""
    You are a Retrieval-Augmented Generation (RAG) assistant.
    Use the provided context to accurately answer the question.
    If the context lacks the answer, politely say so.

    Context:
    {context}

    Question:
    {query}

    Answer:
    """

    answer = query_local_ollama(prompt).strip()

    # Prepare matches with metadata for citation display
    matches = []
    for doc, meta, dist in zip(docs, metadatas, distances):
        matches.append({
            "page_content": doc,
            "metadata": meta,
            "similarity": round(1 - dist, 3)
        })

    # Return consistent structure
    return {
        "query": query,
        "answer": answer,
        "matches": matches,
        "context_used": matches  # ✅ ADD THIS LINE
    }





rag_bp = Blueprint("rag_bp", __name__)


@rag_bp.route("/query", methods=["POST"])
def query():
    data = request.get_json() or {}
    kb_name = data.get("kb_name")
    query_text = data.get("query")
    top_k = int(data.get("top_k", 4))

    if not kb_name or not query_text:
        return jsonify({"error": "kb_name and query required"}), 400

    try:
        results = query_kb(kb_name, query_text, top_k=top_k)

        # Extract citations from match metadata
        citations = []
        for m in results.get("matches", []):
            meta = m.get("metadata", {})
            src = meta.get("source") or meta.get("file_name") or "Unknown source"
            citations.append(src)

        return jsonify({
            "answer": results.get("answer", "No answer generated"),
            "matches": results.get("matches", []),
            "citations": citations
        }), 200

    except Exception as e:
        current_app.logger.exception("Error in /query")
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
    


# @rag_bp.route("/api/ragChat", methods=["POST"])
# def rag_chat():
#     data = request.get_json() or {}
#     query_text = data.get("query")
#     kb_name = data.get("kb_name")

#     if not query_text or not kb_name:
#         return jsonify({"error": "query and kb_name are required"}), 400

#     try:
#         # Call your RAG function (must return context/docs)
#         result = query_kb(kb_name, query_text, top_k=4)

#         # Extract model output and context
#         answer = result.get("answer") or result.get("output_text") or ""
#         citations = result.get("context_used") or result.get("source_documents") or []

#         # Optional: convert citations to readable text
#         formatted_citations = []
#         for doc in citations:
#             if isinstance(doc, dict):
#                 formatted_citations.append(doc.get("page_content", str(doc)))
#             elif hasattr(doc, "page_content"):
#                 formatted_citations.append(doc.page_content)
#             else:
#                 formatted_citations.append(str(doc))
#         print("Formatted Citations:", formatted_citations)
#         # ✅ Return both text and citations
#         return jsonify({
#             "role": "bot",
#             "text": answer,
#             "citations": formatted_citations
#         }), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500