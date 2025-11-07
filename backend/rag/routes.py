# backend/rag/routes.py
from flask import Blueprint, request, jsonify, current_app
from rag.pdf_utils import extract_text_from_pdf_bytes
from rag.rag_service import query_kb
import io

rag_bp = Blueprint("rag_bp", __name__)

from flask import Blueprint, request, jsonify, current_app
import os
import chromadb
from chromadb.utils import embedding_functions

# from chromadb.config import Settings
from langchain.text_splitter import RecursiveCharacterTextSplitter

# from sentence_transformers import SentenceTransformer

rag_bp = Blueprint("rag_bp", __name__)

# Initialize Chroma client once
client = chromadb.PersistentClient(path="./db/chroma")

# Use a local embedding model (change to ollama or OpenAI if needed)
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)


@rag_bp.route("/create_kb", methods=["POST"])
def create_kb():
    try:
        kb_name = request.form.get("kb_name")
        files = request.files.getlist("file")  # match frontend key
        if not kb_name or not files:
            return jsonify({"error": "kb_name and file(s) are required"}), 400

        try:
            collection = client.get_collection(kb_name)
        except Exception:
            collection = client.create_collection(
                name=kb_name, embedding_function=embedding_fn
            )

        splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
        total_chunks = 0

        for file in files:
            pdf_bytes = file.read()  # ✅ convert stream to bytes
            text = extract_text_from_pdf_bytes(pdf_bytes)
            chunks = splitter.split_text(text)
            if len(chunks) > 0:
                # 🧠 Generate embedding for the first chunk just for debugging
                sample_embedding = embedding_fn([chunks[0]])[0]
                print(f"🔍 Sample embedding for '{file.filename}' (first chunk):")
                print(
                    sample_embedding[:10], "..."
                )  # print only first 10 dims for readability

            ids = [f"{file.filename}_{i}" for i in range(len(chunks))]
            metadatas = [
                {"source": file.filename, "chunk": i} for i in range(len(chunks))
            ]
            collection.add(documents=chunks, ids=ids, metadatas=metadatas)

            total_chunks += len(chunks)
            print(
                f"✅ Stored {len(chunks)} chunks (with embeddings) from {file.filename}"
            )

        return (
            jsonify(
                {
                    "message": f"KB '{kb_name}' updated successfully",
                    "files_uploaded": [f.filename for f in files],
                    "total_chunks": total_chunks,
                }
            ),
            200,
        )

    except Exception as e:
        current_app.logger.exception("create_kb error")
        return jsonify({"error": str(e)}), 500


@rag_bp.route("/delete_kb", methods=["POST"])
def delete_kb():
    try:
        data = request.get_json()
        kb_name = data.get("kb_name")

        if not kb_name:
            return jsonify({"error": "kb_name is required"}), 400

        # ✅ Try to delete the collection if it exists
        try:
            client.delete_collection(kb_name)
            return jsonify({"message": f"KB '{kb_name}' deleted successfully"}), 200
        except Exception as e:
            return jsonify({"error": f"Failed to delete KB '{kb_name}': {str(e)}"}), 500

    except Exception as e:
        current_app.logger.exception("delete_kb error")
        return jsonify({"error": str(e)}), 500


@rag_bp.route("/add_to_kb", methods=["POST"])
def add_to_kb():
    """
    Append new PDFs to an existing Knowledge Base (Chroma collection).
    """
    try:
        kb_name = request.form.get("kb_name")
        files = request.files.getlist("file")

        if not kb_name or not files:
            return jsonify({"error": "kb_name and file(s) are required"}), 400

        # ✅ Get existing collection (must exist)
        collection = client.get_collection(kb_name)
        from langchain.text_splitter import RecursiveCharacterTextSplitter

        splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)

        total_chunks = 0

        for file in files:
            pdf_bytes = file.read()
            from rag.pdf_utils import extract_text_from_pdf_bytes

            text = extract_text_from_pdf_bytes(pdf_bytes)
            chunks = splitter.split_text(text)

            ids = [f"{file.filename}_{i}" for i in range(len(chunks))]
            metadatas = [
                {"source": file.filename, "chunk": i} for i in range(len(chunks))
            ]

            collection.add(documents=chunks, ids=ids, metadatas=metadatas)

            total_chunks += len(chunks)
            print(f"✅ {file.filename}: {len(chunks)} new chunks added to {kb_name}")

        return (
            jsonify(
                {
                    "message": f"Added {len(files)} file(s) to KB '{kb_name}' successfully",
                    "total_chunks": total_chunks,
                }
            ),
            200,
        )

    except Exception as e:
        current_app.logger.exception("add_to_kb error")
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
        return (
            jsonify(
                {
                    "ids": items["ids"],
                    "metadatas": items["metadatas"],
                    "documents": items["documents"],
                    "embeddings": items["embeddings"],
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500
