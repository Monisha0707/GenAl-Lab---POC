<!-- .github/copilot-instructions.md - Project-specific guidance for AI coding agents -->
# Quick orientation (what this repo is)

- Monorepo with three main areas:
  - `frontend/` — React + Vite SPA (dev: `npm run dev`, port 5173)
  - `backend/` — Flask API with modular Blueprints (entry: `backend/App.py`)
  - `genai/` — small Java Spring Boot demo (Maven; optional for most work)

## Big-picture architecture & data flow

- Frontend (5173) → Backend (Flask, default 5000) via REST endpoints. CORS in `backend/App.py` is configured to allow `http://localhost:5173` — do not change origin unless frontend port changes.
- Backend delegates LLM/embeddings to a local Ollama server at `http://localhost:11434` (see root `README.md`). Ollama exposes `/api/generate` and `/api/embeddings`.
- Embeddings storage: persistent Chroma files live under `backend/db/chroma/` (SQLite + vector shards). Treat those files as stateful; avoid removing them in edits.
- Primary backend route groups are organized as Flask Blueprints. Key files:
  - `backend/App.py` — app bootstrap and blueprint registration
  - `backend/chatStore.py`, `backend/chat.py`, `backend/chatLangChain.py` — chat related logic
  - `backend/embeddings/routes.py` — embeddings endpoints (registered at `/embeddings`)
  - `backend/rag/` — RAG endpoints and chat routes (registered at `/rag`)

## Developer workflows (how to run and test locally)

- Frontend (dev):
  - cd `frontend`
  - `npm install` (first time)
  - `npm run dev` — hot-reload on 5173
- Backend (dev):
  - cd `backend`
  - `python3 -m venv venv`
  - `source venv/bin/activate` (macOS / zsh)
  - `pip install -r requirements.txt`
  - `python3 App.py` (App.py contains the Flask app and runs `app.run(debug=True)`)
- Ollama (LLM & embeddings):
  - Start the Ollama process/app: `ollama serve` (or use the OS app UI). API base: `http://localhost:11434`.

## Project-specific conventions & patterns

- Blueprints: Add new HTTP functionality as a Flask Blueprint in a logical subfolder and register it in `backend/App.py` (see existing `app.register_blueprint(...)` usages).
- Routes and prefixes: embeddings are mounted at `/embeddings`, RAG at `/rag`. Follow this pattern for consistent API layout.
- Env config: repo uses environment variables for production-sensitive settings. Keys to know:
  - `MONGO_URI` — MongoDB for user/account data (backend uses `db.py`)
  - `JWT_SECRET_KEY` — JWT signing secret
  Store them in `.env` or export in the shell when running locally.
- Database files: `backend/db/chroma/` contains vector DB artifacts — keep those persistent when possible.
- File naming: the Flask entry file is `App.py` (capitalized). Use the exact filename when running.

## Integration points & external dependencies

- Ollama local server (LLM + embeddings) — referenced in README and expected by backend code.
- MongoDB — user/account data. Look at `backend/db.py` and `backend/register.py` / `login.py` for usage.
- Chroma embeddings on-disk store under `backend/db/chroma/` — used by RAG flows.
- Frontend uses Axios and Redux; key client-side files live in `frontend/src/components/` and call backend endpoints in `Service/helper.js` and `utils/chatUtils/chatapi.js`.

## Editing guidance for AI agents (do's and don'ts)

- Do: Make minimal, local changes. Follow the existing blueprint pattern and route prefixes.
- Do: Update `backend/App.py` only to register new blueprints or fix integration wiring — respect CORS configuration.
- Do: When adding endpoints that call the LLM, assume Ollama is local at `http://localhost:11434` unless the change includes configurable base URL and README update.
- Don't: Remove or rewrite files inside `backend/db/chroma/` — treat them as production test data.
- Don't: Change the frontend dev port (5173) without updating the CORS origin in `backend/App.py`.

## Useful examples (where to look for patterns)

- Registering blueprints: `backend/App.py` (lines that call `app.register_blueprint(...)`)
- Embedding endpoints: `backend/embeddings/routes.py` — example of how embedding requests are handled and routed to the embedding layer
- RAG chat flow: `backend/rag/rag_chat_routes.py` and `backend/rag/rag_service.py`
- Frontend API use: `frontend/src/utils/chatUtils/chatapi.js` and `frontend/src/components/KBManager.jsx` (current working file)

## If you change files

- Keep edits small and scoped. Start the local frontend and backend and verify the endpoint manually (curl or browser) before proposing large merges.
- After creating or editing server-side dependencies, run `pip install -r backend/requirements.txt`.

---
If anything here is unclear or you want me to expand an area (e.g., example requests for a specific endpoint or a short runbook for RAG debugging), tell me which area and I'll iterate.
