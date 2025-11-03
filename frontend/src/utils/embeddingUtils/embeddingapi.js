// embeddingapi.js
import axios from "axios";

const BASE_URL = "http://localhost:5000/embeddings";

export const generateEmbedding = async (text) => {
  try {
    const res = await axios.post(`${BASE_URL}/generate_embedding`, { text });
    console.log("✅ Embedding generated and stored:", res.data.embedding);
    return res.data;
  } catch (error) {
    console.error("❌ Error generating embedding:", error);
    throw error;
  }
};

export const fetchAllEmbeddings = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/get_all_embeddings`);
    const combined = res.data.documents.map((doc, i) => ({
      text: doc,
      embedding: res.data.embeddings[i],
    }));
    return combined;
  } catch (error) {
    console.error("❌ Error fetching embeddings:", error);
    throw error;
  }
};

// src/api/embeddingapi.js
// embeddingapi.js
export const generateLocalEmbedding = async (text) => {
  try {
    const response = await fetch("http://localhost:11434/api/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "nomic-embed-text", // ✅ your local embedding model
        input: text,
      }),
    });

    if (!response.ok) throw new Error("Failed to get embedding from local LLM");

    const data = await response.json();
    const embedding = data.embedding || data.data?.[0]?.embedding;

    console.log("Embedding from Ollama:", embedding);

    // ✅ send this embedding to Flask for storage
    const storeRes = await fetch("http://localhost:5000/embeddings/generate_embedding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, embedding }),
    });

    const storeData = await storeRes.json();
    return storeData; // ✅ <-- THIS makes handleGenerate() get proper value
  } catch (err) {
    console.error("❌ Error generating embedding:", err);
    throw err;
  }
};


// ✅ Delete a specific embedding by ID
export const deleteEmbedding = async (id) => {
  try {
    const res = await axios.delete("http://localhost:5000/embeddings/delete_embedding", {
      headers: { "Content-Type": "application/json" },
      data: { id: id }, // 👈 Must be inside `data`
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error deleting embedding:", err);
    throw err;
  }
};
