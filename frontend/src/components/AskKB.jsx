import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

export default function AskKB() {
  const [kb, setKb] = useState("");
  const [question, setQuestion] = useState("");
  const [kbs, setKbs] = useState([]);
  const [results, setResults] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gray-800 text-gray-100 flex flex-col items-center">
      {/* Header with Menu */}
      {/* 🔹 Header Bar */}
<div className="w-full bg-gray-900 p-4 flex justify-between items-center shadow-md relative">
  <div className="flex items-center space-x-2">
    <h1 className="text-xl font-semibold text-teal-400">Ask KB</h1>

    {/* Hamburger Menu */}
    <button
      onClick={() => setIsCollapsed(!isCollapsed)}
      className="p-2 rounded-md hover:bg-gray-700 transition"
    >
      <Menu size={22} />
    </button>

    {/* Collapsible Dropdown Menu */}
    {isCollapsed && (
      <div className="absolute top-14 left-24 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-3 animate-fade-in z-50">
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => navigate("/chat")}
            className="text-left text-sm bg-gray-700 hover:bg-gray-600 p-2 rounded-md"
          >
            OraChat
          </button>
          <button
            onClick={() => navigate("/ragChat")}
            className="text-left text-sm bg-gray-700 hover:bg-gray-600 p-2 rounded-md"
          >
            OraRagChat
          </button>
          <button
            onClick={() => navigate("/kb")}
            className="text-left text-sm bg-gray-700 hover:bg-gray-600 p-2 rounded-md"
          >
            Knowledge Base
          </button>
          <button
            onClick={() => navigate("/askkb")}
            className="text-left text-sm bg-gray-700 hover:bg-gray-600 p-2 rounded-md"
          >
            Ask KB
          </button>
        </div>
      </div>
    )}
  </div>
</div>



      {/* Main Section */}
      <div className="p-6 max-w-3xl w-full mx-auto bg-gray-800 text-gray-100 rounded-xl shadow-lg mt-6">
        <h2 className="text-2xl mb-4 font-semibold text-teal-400">
          Ask a Knowledge Base
        </h2>

        {/* KB Selector */}
        <div className="mb-3">
          <select
            value={kb}
            onChange={(e) => setKb(e.target.value)}
            className="p-2 border border-gray-600 rounded w-full bg-gray-700 text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="">-- Select KB --</option>
            {kbs.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        {/* Question Input */}
        <textarea
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none"
          placeholder="Ask something about the KB..."
        />

        {/* Retrieve Button */}
        <div className="mt-3">
          <button
            onClick={handleQuery}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition duration-200"
          >
            Retrieve
          </button>
        </div>

        {/* Results */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2 text-teal-400">Answer</h3>

          {results ? (
            <>
              <div className="bg-gray-700 border border-gray-600 p-3 rounded text-gray-100">
                {results.answer || "No answer generated"}
              </div>

              {results.matches && results.matches.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2 text-teal-300">
                    Top Similar Results
                  </h4>
                  <div className="space-y-3">
                    {results.matches.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 border border-gray-600 rounded bg-gray-700 hover:bg-gray-600 transition duration-200"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-400 font-medium">
                            Chunk {idx + 1}
                          </span>
                          <span className="text-xs text-gray-400">
                            🔹 Similarity:{" "}
                            {item.similarity?.toFixed(3) ?? "N/A"}
                          </span>
                        </div>
                        <div className="text-sm text-gray-100 whitespace-pre-line">
                          {item.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-3 text-sm text-teal-400 hover:underline"
              >
                {showDetails ? "Hide details ▲" : "Show full JSON ▼"}
              </button>

              {showDetails && (
                <pre className="bg-gray-900 border border-gray-700 p-3 rounded mt-2 max-h-60 overflow-auto text-xs text-gray-300">
                  {JSON.stringify(results, null, 2)}
                </pre>
              )}
            </>
          ) : (
            <div className="bg-gray-700 border border-gray-600 p-3 rounded text-gray-300">
              No results yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
