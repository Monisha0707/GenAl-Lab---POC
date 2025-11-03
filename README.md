Steps to run this code

1. Run the frontend - npm run dev
2. run the backend - 
        a. source venv/bin/activate
        b. python3 -m venv venv
        c. python3 app.py

3. Run the ollama model
         a. start the app ollama

.env data 

MONGO_URI="your mongo db URI"
JWT_SECRET_KEY=your-secret-key 


🧠 1️⃣ Ollama has one single local server process

When you run:

ollama serve


or simply open the Ollama desktop app,
it automatically starts a local API server at:

http://localhost:11434


That server exposes all endpoints for both:

/api/generate → for generating text (LLM)

/api/embeddings → for generating embeddings (vector representation)