from flask import Blueprint, request, jsonify
from sentence_transformers import SentenceTransformer
import chromadb

embedding_bp = Blueprint("embedding_bp", __name__)

# Initialize Chroma client (persistent)
chroma_client = chromadb.PersistentClient(path="./db/chroma")
collection = chroma_client.get_or_create_collection(name="embeddings")

# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

@embedding_bp.route("/generate_embedding", methods=["POST", "OPTIONS"])
def generate_embedding():
    if request.method == "OPTIONS":
        return jsonify({"message": "Preflight OK"}), 200

    try:
        data = request.get_json()
        print("Received data:", data)
        text = data.get("text", "")
        if not text:
            return jsonify({"error": "Text is required"}), 400

        embedding = model.encode(text).tolist()

        import uuid
        collection.add(
            ids=[str(uuid.uuid4())],
            documents=[text],
            embeddings=[embedding]
        )

        return jsonify({
            "message": "Embedding stored successfully!",
            "embedding": embedding
        })
    except Exception as e:
        import traceback
        print("Error:", e)
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500



@embedding_bp.route("/get_all_embeddings", methods=["GET"])
def get_all_embeddings():
    try:
        results = collection.get(include=["documents", "embeddings"])
        return jsonify({
            "ids": results["ids"],            # 👈 Add this line
            "documents": results["documents"],
            "embeddings": results["embeddings"]
        })
    except Exception as e:
        print("Error fetching embeddings:", e)
        return jsonify({"error": str(e)}), 500


@embedding_bp.route("/delete_embedding", methods=["DELETE", "OPTIONS"])
def delete_embedding():
    if request.method == "OPTIONS":
        return jsonify({"message": "Preflight OK"}), 200

    try:
        data = request.get_json(force=True)
        embedding_id = data.get("id")

        if not embedding_id:
            return jsonify({"error": "No ID provided"}), 400

        collection.delete(ids=[embedding_id])
        print(f"🗑️ Deleted embedding ID: {embedding_id}")
        return jsonify({"message": f"Embedding {embedding_id} deleted successfully!"}), 200

    except Exception as e:
        import traceback
        print("Error deleting embedding:", e)
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


