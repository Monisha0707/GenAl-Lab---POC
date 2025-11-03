import React, { useState } from "react";
import axios from "axios";
import { generateEmbedding, fetchAllEmbeddings, generateLocalEmbedding, deleteEmbedding } from "../utils/embeddingUtils/embeddingapi.js";
const EmbeddingManager = () => {
  const [text, setText] = useState("");
  const [data, setData] = useState([]);
  const [expanded, setExpanded] = useState({});

  const handleGenerate = async () => {
  try {
    const res = await generateLocalEmbedding(text);
    alert("✅ Embedding generated and stored!");
    console.log("New embedding:", res.embedding);
    setText("");
    
    // 🔁 Refresh the list after success
    await handleFetch();
  } catch (error) {
    console.error("Error generating embedding:", error);
  }
};



const handleFetch = async () => {
  const res = await axios.get("http://localhost:5000/embeddings/get_all_embeddings");
  const combined = res.data.documents.map((doc, i) => ({
    id: res.data.ids[i],           // ✅ add id
    text: doc,
    embedding: res.data.embeddings[i],
  }));
  setData(combined);
};

  const toggleExpand = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="text-gray-100 bg-gray-900 min-h-screen flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-4xl bg-gray-800 border border-gray-700 rounded-2xl shadow-inner p-6">
        <h2 className="text-2xl font-bold text-teal-400 mb-6 text-center italic">
          🧠 Embedding Manager
        </h2>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to generate embedding..."
          className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 mb-4 resize-none"
          rows={3}
        />

        <div className="flex justify-center space-x-4 mb-6">
  <button
    onClick={async () => {
      try {
        await handleGenerate();
        setText(""); // 🧹 Clear text box after successful generation
      } catch (error) {
        console.error("Error generating embedding:", error);
      }
    }}
    className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg shadow-md transition-colors duration-200"
  >
    Generate & Store
  </button>

  <button
    onClick={handleFetch}
    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md transition-colors duration-200"
  >
    Fetch Embeddings
  </button>
</div>


        <div>
          <h3 className="text-lg font-semibold mb-4 text-teal-300 border-b border-gray-700 pb-2">
            Stored Documents & Embeddings
          </h3>

          {data.length > 0 ? (
            <ul className="space-y-3">
              {data.map((item, i) => (
                <li
  key={i}
  className="bg-gray-700 border border-gray-600 rounded-xl overflow-hidden shadow-sm"
>
  <div
    className="cursor-pointer px-4 py-3 flex justify-between items-center hover:bg-gray-600 transition-all"
    onClick={() => toggleExpand(i)}
  >
    <span className="font-medium text-gray-200">
      {item.text.length > 25 ? item.text.slice(0, 25) + "..." : item.text}
    </span>
    <div className="flex items-center space-x-3">
      <button
        onClick={async (e) => {
          e.stopPropagation(); // prevent expand toggle
          try {
            await deleteEmbedding(item.id);
            alert("🗑 Embedding deleted successfully!");
            handleFetch(); // refresh list
          } catch (error) {
            console.error("Error deleting embedding:", error);
            alert("Failed to delete embedding.");
          }
        }}
        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm shadow"
      >
        Delete
      </button>
      <span className="text-teal-400 text-sm">
        {expanded[i] ? "▲ Hide" : "▼ View"}
      </span>
    </div>
  </div>

  {expanded[i] && (
    <div className="px-4 py-3 bg-gray-800 border-t border-gray-600 text-sm">
      <p className="mb-2 text-gray-300">
        <strong>Full Text:</strong> {item.text}
      </p>
      <pre className="bg-gray-900 p-2 rounded-lg overflow-x-auto text-xs text-gray-400 border border-gray-700">
        {JSON.stringify(item.embedding.slice(0, 50), null, 2)}...
      </pre>
    </div>
  )}
</li>

              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic">No embeddings found yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmbeddingManager;
