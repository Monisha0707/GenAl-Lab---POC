from flask import Flask, request, jsonify
import requests
import json
import os
import re
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_FILE = os.path.join(BASE_DIR, "sample.txt")

# ============================================================
# 🔹 Function: Ask LLM which route to call
# ============================================================
def get_llm_route_decision(instruction: str):
    """
    Ask Ollama (or any local LLM) to decide what REST route to call,
    based purely on the natural language instruction.
    """
    system_prompt = """You are a REST route decision engine for a file management server.
Given a natural language instruction, respond ONLY in JSON with one of the available endpoints.

Available routes:
- /create-file (POST): create a file → body: { "filename": "file.txt", "content"?: "optional content" }
- /delete-file (DELETE): delete a file → body: { "filename": "file.txt" }
- /read-file (GET): read file content → body: { "filename": "file.txt" }
- /update-file (POST): append/overwrite content → body: { "filename": "file.txt", "mode": "append" | "overwrite", "content": "text" }
- /replace-content (POST): replace entire file content → body: { "filename": "file.txt", "new_content": "text" }
- /clear-file (POST): erase file content → body: { "filename": "file.txt" }

Return valid JSON ONLY.
Do not include explanations, markdown formatting, or text outside JSON.
"""

    payload = {
        "model": "llama3.1:latest",
        "prompt": f"{system_prompt}\nUser: {instruction}\nAssistant:"
    }

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json=payload,
            stream=True
        )

        full_output = ""
        for line in response.iter_lines():
            if line:
                chunk = json.loads(line.decode("utf-8"))
                if "response" in chunk:
                    full_output += chunk["response"]

        cleaned = re.sub(r"```[a-zA-Z]*", "", full_output).replace("```", "").strip()
        parsed = json.loads(cleaned)
        return parsed

    except Exception as e:
        return {"error": f"Failed to get structured route from LLM: {e}"}


# ============================================================
# 🔹 Function: Ask LLM to generate file content (Python, text, etc.)
# ============================================================
def extract_code_from_text(text: str) -> str:
    """
    Extracts code from markdown-formatted text (e.g. ```python ... ```).
    Falls back to the raw text if no code fences are found.
    """
    code_blocks = re.findall(r"```(?:[a-zA-Z]+\n)?([\s\S]*?)```", text)
    if code_blocks:
        # join multiple code blocks if LLM generated more than one
        cleaned = "\n\n".join(code_blocks).strip()
        return cleaned
    return text.strip()


def generate_code_from_llm(prompt: str) -> str:
    """
    Ask the LLM (Ollama or local model) to generate code or text content.
    Handles streaming output properly and extracts only code blocks.
    """
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3.1:latest",
                "prompt": prompt
            },
            stream=True
        )

        full_output = ""
        for line in response.iter_lines():
            if line:
                try:
                    chunk = json.loads(line.decode("utf-8"))
                    if "response" in chunk:
                        full_output += chunk["response"]
                except json.JSONDecodeError:
                    continue

        # ✨ Extract only code from the response
        cleaned_code = extract_code_from_text(full_output)

        # If no code fences found, fall back to cleaned raw text
        return cleaned_code if cleaned_code else "# No code content generated."

    except Exception as e:
        return f"# LLM content generation failed: {e}"

# ============================================================
# 🔹 File Operation Endpoints
# ============================================================
@app.route("/create-file", methods=["POST"])
def create_file():
    data = request.get_json()
    filename = data.get("filename", "new_file.txt")
    content = data.get("content", "")

    if os.path.exists(filename):
        return jsonify({"error": f"{filename} already exists"}), 400

    with open(filename, "w") as f:
        f.write(content)

    return jsonify({"message": f"{filename} created successfully", "content": content})


@app.route("/delete-file", methods=["DELETE"])
def delete_file():
    data = request.get_json()
    filename = data.get("filename", "sample.txt")

    if not os.path.exists(filename):
        return jsonify({"error": f"{filename} not found"}), 404

    os.remove(filename)
    return jsonify({"message": f"{filename} deleted successfully"})


@app.route("/replace-content", methods=["POST"])
def replace_content():
    data = request.get_json()
    filename = data.get("filename", "sample.txt")
    new_content = data.get("new_content", "")

    if not os.path.exists(filename):
        return jsonify({"error": f"{filename} not found"}), 404

    with open(filename, "w") as f:
        f.write(new_content)

    return jsonify({"message": f"{filename} content replaced successfully"})


@app.route("/clear-file", methods=["POST"])
def clear_file():
    data = request.get_json()
    filename = data.get("filename", "sample.txt")

    if not os.path.exists(filename):
        return jsonify({"error": f"{filename} not found"}), 404

    open(filename, "w").close()
    return jsonify({"message": f"{filename} cleared successfully"})


@app.route("/read-file", methods=["GET"])
def read_file():
    filename = request.args.get("filename", "sample.txt")

    if not os.path.exists(filename):
        return jsonify({"error": f"{filename} not found"}), 404

    with open(filename, "r") as f:
        content = f.read()

    return jsonify({"filename": filename, "content": content})


@app.route("/update-file", methods=["POST"])
def update_file():
    data = request.get_json()
    filename = data.get("filename", "sample.txt")
    mode = data.get("mode", "append")

    if not os.path.exists(filename):
        open(filename, "w").close()

    if mode == "append":
        content = data.get("content", "")
        with open(filename, "a") as f:
            f.write("\n" + content)
        return jsonify({"message": "Content appended successfully!"})

    elif mode == "overwrite":
        content = data.get("content", "")
        with open(filename, "w") as f:
            f.write(content)
        return jsonify({"message": "File overwritten successfully!"})

    else:
        return jsonify({"error": "Unsupported mode"}), 400


# ============================================================
# 🤖 Main LLM Agent Route
# ============================================================
@app.route('/agent', methods=['POST'])
def agent():
    data = request.json
    instruction = data.get("instruction", "")

    # Step 1: Ask LLM which route to call
    route_decision = get_llm_route_decision(instruction)
    if "error" in route_decision:
        return jsonify(route_decision), 500

    endpoint = route_decision.get("endpoint")
    method = route_decision.get("method", "POST")
    body = route_decision.get("body", {})

    # Step 2: If user wants to create a file, ask LLM to generate file content
    if endpoint == "/create-file":
        filename = body.get("filename", "new_file.txt")
        generated_content = generate_code_from_llm(
            f"Generate appropriate file content based on: {instruction}"
        )
        body["content"] = generated_content
    else:
        generated_content = None

    # Step 3: Execute the correct route dynamically
    try:
        if method == "POST":
            res = requests.post(f"http://localhost:5001{endpoint}", json=body)
        elif method == "GET":
            res = requests.get(f"http://localhost:5001{endpoint}", params=body)
        elif method == "DELETE":
            res = requests.delete(f"http://localhost:5001{endpoint}", json=body)
        else:
            return jsonify({"error": "Unsupported HTTP method"}), 400

        return jsonify({
            "executed_route": endpoint,
            "llm_instruction": instruction,
            "response_from_route": res.json(),
            "generated_content": generated_content or ""
        })
    except Exception as e:
        return jsonify({"error": str(e), "route_decision": route_decision}), 500


# ============================================================
# 🧭 Utility: List All Routes
# ============================================================
@app.route("/routes", methods=["GET"])
def list_routes():
    routes = [
        {"endpoint": "/create-file", "method": "POST", "description": "Create a new file"},
        {"endpoint": "/delete-file", "method": "DELETE", "description": "Delete a file"},
        {"endpoint": "/replace-content", "method": "POST", "description": "Replace full content"},
        {"endpoint": "/clear-file", "method": "POST", "description": "Erase file content"},
        {"endpoint": "/update-file", "method": "POST", "description": "Append/overwrite file"},
        {"endpoint": "/read-file", "method": "GET", "description": "Read file content"},
        {"endpoint": "/agent", "method": "POST", "description": "Main LLM agent entry point"}
    ]
    return jsonify({"available_routes": routes})


# ============================================================
# 🚀 Run Flask Server
# ============================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
