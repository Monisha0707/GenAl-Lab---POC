import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, Menu } from "lucide-react";
export default function KBManager() {
  const [files, setFiles] = useState([]);
  const [kbName, setKbName] = useState("");
  const [status, setStatus] = useState("");
  const [kbs, setKbs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddFiles, setShowAddFiles] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchKbs();
  }, []);

  const fetchKbs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/rag/list_kbs");
      setKbs(res.data.kbs || []);
    } catch (err) {
      console.error(err);
      alert("⚠️ Failed to fetch KBs");
    }
  };

  const handleUpload = async () => {
    if (files.length === 0 || !kbName) {
      alert("Please provide KB name and select files.");
      return;
    }

    setLoading(true);
    setStatus("Uploading...");

    const fd = new FormData();
    fd.append("kb_name", kbName);
    for (let i = 0; i < files.length; i++) {
      fd.append("file", files[i]);
    }

    try {
      const url = showAddFiles
        ? "http://localhost:5000/rag/add_to_kb"
        : "http://localhost:5000/rag/create_kb";

      const res = await axios.post(url, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(res.data.message || "✅ Operation successful!");
      setStatus(res.data.message || "Done!");
      setKbName("");
      setFiles([]);
      await fetchKbs();
      setShowAddFiles(false);
    } catch (err) {
      console.error(err);
      alert("❌ Error: " + (err.response?.data?.error || err.message));
      setStatus("Error: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddFilesClick = (kb) => {
    setKbName(kb);
    setShowAddFiles(true);
  };

  const handleDeleteKb = async (kb) => {
    if (!window.confirm(`Are you sure you want to delete KB: ${kb}?`)) return;

    try {
      await axios.post("http://localhost:5000/rag/delete_kb", { kb_name: kb });
      alert(`🗑️ ${kb} deleted successfully`);
      fetchKbs();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete KB: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="body-font w-full flex h-screen bg-gray-800 text-gray-100">
      {/* 🔹 Sidebar */}
      <div className="w-56 h-[100vh] bg-gray-900 mt-0 text-white p-2 rounded-xl flex flex-col shadow-inner ">
        
        {/* Collapsible Section */}
        <div className="mb-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex justify-between items-center bg-gray-700 hover:bg-gray-600 p-2 rounded-md transition"
          >
            <div className="flex items-center gap-2">
                      <Menu size={18} className="text-white" />
                      <span className="text-sm  font-semibold">Knowledge base</span>
                    </div>
            {isCollapsed ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>

          {isCollapsed && (
            <div className="mt-2 flex flex-col space-y-1 pl-2 animate-fade-in">
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
          )}
        </div>

        {/* Knowledge Bases */}
        <h2 className="text-sm font-semibold mb-4 text-center border-b border-gray-700 pb-2">
          Knowledge Bases
        </h2>

        <div className="flex-1 overflow-y-auto space-y-2">
          {kbs.length > 0 ? (
            kbs.map((k) => (
              <div
                key={k}
                className="flex justify-between items-center bg-gray-700 p-2 rounded-md hover:bg-gray-600 transition"
              >
                <span className="truncate">{k}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddFilesClick(k)}
                    className="text-teal-400 hover:text-teal-300"
                    title="Add files"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteKb(k)}
                    title="Delete KB"
                    className="ml-2 text-red-400 hover:text-red-600 transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm text-center">No KBs found.</p>
          )}
        </div>

        <button
          onClick={fetchKbs}
          className="mt-4 py-1 text-sm rounded-md bg-gray-700 hover:bg-gray-600 border border-gray-600"
        >
          Refresh
        </button>
      </div>

      {/* 🔹 Center Create/Add Box */}
      <div className="flex flex-col items-center justify-center flex-1 p-1 mt-0 rounded-xl ">
        <div className="w-full max-w-lg bg-gray-800 shadow-xl rounded-2xl p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            {showAddFiles ? `Add Files to ${kbName}` : "Create Knowledge Base"}
          </h2>

          <div className="space-y-4">
            {!showAddFiles && (
              <input
                value={kbName}
                onChange={(e) => setKbName(e.target.value)}
                placeholder="Enter KB name (e.g., FinanceDocs)"
                className="w-full p-2 rounded-md bg-gray-700 text-gray-100 placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            )}

            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files))}
              className="w-full  p-2 rounded-md text-gray-100 bg-gray-700"
            />

            {files.length > 0 && (
              <div className="text-sm text-gray-400">
                📁 <strong>{files.length}</strong> file(s) selected
              </div>
            )}

            <div className="flex space-x-3 justify-center">
              <button
                onClick={handleUpload}
                disabled={loading}
                className={`px-4 py-2 rounded-md text-white ${
                  loading ? "bg-gray-500" : "bg-teal-600 hover:bg-teal-700"
                }`}
              >
                {loading
                  ? "Uploading..."
                  : showAddFiles
                  ? "Add Files to KB"
                  : "Upload & Create KB"}
              </button>

              {showAddFiles && (
                <button
                  onClick={() => {
                    setShowAddFiles(false);
                    setKbName("");
                  }}
                  className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 "
                >
                  Cancel
                </button>
              )}
            </div>

            {status && (
              <div className="text-sm text-gray-400 text-center mt-2">
                <strong>Status:</strong> {status}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
