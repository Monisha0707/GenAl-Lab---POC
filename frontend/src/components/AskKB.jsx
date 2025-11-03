// src/components/AskKB.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AskKB() {
  const [kb, setKb] = useState("");
  const [question, setQuestion] = useState("");
  const [kbs, setKbs] = useState([]);
  const [results, setResults] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // 🔹 Fetch available KBs on load
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("http://localhost:5000/rag/list_kbs");
        setKbs(res.data.kbs || []);
        if (res.data.kbs && res.data.kbs[0]) setKb(res.data.kbs[0]);
      } catch (err) {
        console.error("Error fetching KBs:", err);
      }
    })();
  }, []);

  // 🔹 Handle question query
  const handleQuery = async () => {
    if (!kb || !question) return alert("Select KB and ask a question");
    try {
      const res = await axios.post("http://localhost:5000/rag/query", {
        kb_name: kb,
        query: question,
        top_k: 4,
      });
      setResults(res.data);
      setShowDetails(false);
    } catch (err) {
      console.error("Query error:", err);
      alert("Error querying the KB");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow mt-6">
      <h2 className="text-xl mb-4 font-semibold">Ask a KB</h2>

      {/* 🔹 KB Selector */}
      <div className="mb-2">
        <select
          value={kb}
          onChange={(e) => setKb(e.target.value)}
          className="p-2 border rounded w-full"
        >
          <option value="">-- Select KB --</option>
          {kbs.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      {/* 🔹 Question Box */}
      <textarea
        rows={3}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="w-full p-2 border rounded"
        placeholder="Ask something about the KB..."
      />

      {/* 🔹 Submit Button */}
      <div className="mt-2">
        <button
          onClick={handleQuery}
          className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
        >
          Retrieve
        </button>
      </div>

      {/* 🔹 Results Section */}
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Answer</h3>

        {results ? (
          <>
            <div className="bg-green-50 border border-green-200 p-3 rounded text-gray-800">
              {results.answer || "No answer generated"}
            </div>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              {showDetails ? "Hide details ▲" : "Show full result ▼"}
            </button>

            {showDetails && (
              <pre className="bg-gray-100 p-3 rounded mt-2 max-h-60 overflow-auto text-xs">
                {JSON.stringify(results, null, 2)}
              </pre>
            )}
          </>
        ) : (
          <div className="bg-gray-100 p-3 rounded">No results yet</div>
        )}
      </div>
    </div>
  );
}
