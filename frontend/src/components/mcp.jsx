import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
export default function AgentPlayground() {
  const [instruction, setInstruction] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sendInstruction = async () => {
    setLoading(true);
    const res = await fetch("http://localhost:5001/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instruction }),
    });
    const data = await res.json();
    setResponse(JSON.stringify(data, null, 2));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-800 p-6 flex flex-col items-center">

        <div className="w-full bg-gray-800 p-4 flex justify-between items-center  relative">
  <div className="flex items-center space-x-2">
    <h1 className="text-xl font-semibold text-teal-400">MCP</h1>

    {/* Hamburger Menu */}
    <button
      onClick={() => setIsCollapsed(!isCollapsed)}
      className="p-2 rounded-md bg-gray-200 hover:bg-gray-100 transition"
    >
      <Menu size={22} />
    </button>

    {/* Collapsible Dropdown Menu */}
    {isCollapsed && (
      <div className="absolute top-14 left-24 w-56 text-gray-100 bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-3 animate-fade-in z-50">
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
          <button
            onClick={() => navigate("/mcp")}
            className="text-left text-sm bg-gray-700 hover:bg-gray-600 p-2 rounded-md"
          >
            MCP
          </button>
        </div>
      </div>
    )}
  </div>
</div>

      <h1 className="text-3xl text-gray-100 font-bold mt-0 mb-4">🤖 MCP Agent Playground</h1>
      <textarea
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        placeholder="Type your instruction (e.g., 'Append new note about automation')"
        className="w-2/3 p-3 bg-gray-700 text-gray-100 border rounded mb-4"
        rows="4"
      />
      <button
        onClick={sendInstruction}
        className="bg-blue-600 text-white px-6 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Thinking..." : "Send to Agent"}
      </button>
      <pre className="bg-white p-4 mt-6 w-2/3 rounded shadow text-left overflow-auto">
        {response || "Response will appear here..."}
      </pre>
    </div>
  );
}
