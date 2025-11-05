import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

export default function AgentPlayground() {
  const [instruction, setInstruction] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileContent, setFileContent] = useState(""); // State to store file content
  const [files, setFiles] = useState([]); // State to store list of files
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  // Fetch list of files and their content from the backend
  useEffect(() => {
    const fetchFiles = async () => {
      const res = await fetch("http://localhost:5001/get-files");
      const data = await res.json();
      setFiles(data.files); // Assuming the response has a 'files' array
    };
    fetchFiles();
  }, []);

  // Fetch file content after the operation
  const fetchFileContent = async (filename) => {
    const res = await fetch(`http://localhost:5001/read-file?filename=${filename}`);
    const data = await res.json();
    if (data.content) {
      setFileContent(data.content); // Update file content state
    }
  };

  const sendInstruction = async () => {
    setLoading(true);
    const res = await fetch("http://localhost:5001/agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ instruction }),
    });

    const data = await res.json();
    setResponse(JSON.stringify(data, null, 2));
    setLoading(false);

    // After performing the operation, fetch the updated file content if necessary
    const filename =
  data?.response_from_route?.filename ||
  data?.body?.filename ||
  data?.filename;

if (filename) {
  await fetchFileContent(filename); // ✅ Always refresh content after any file change
}

  };

  return (
  <div className="body-font w-full flex h-screen bg-gray-800 text-gray-100">

    {/* 🔹 Sidebar */}
    <div className="w-56 h-[100vh] bg-gray-900 mt-0 p-3 rounded-xl flex flex-col shadow-inner border border-gray-700">
      <div className="flex items-center space-x-10">
          <div className="flex items-center w-full">
  <h1 className="text-xl font-semibold text-teal-400">MCP</h1>

  {/* Push menu to the right */}
  <button
    onClick={() => setIsCollapsed(!isCollapsed)}
    className="ml-auto p-2 rounded-md hover:bg-gray-700 transition"
  >
    <Menu size={22} />
  </button>
</div>

      
          {/* Collapsible Dropdown Menu */}
          {isCollapsed && (
            <div className="absolute top-14 left-24 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-3 animate-fade-in z-50">
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
      <h2 className="text-lg font-semibold text-center text-teal-400 mb-3">📁 Files</h2>

      <div className="flex-1 overflow-y-auto space-y-2">
        {files.length > 0 ? (
          files.map((file) => (
            <button
              key={file}
              className="w-full text-left bg-gray-700 hover:bg-gray-600 p-2 rounded-md text-sm truncate transition"
              onClick={() => fetchFileContent(file)}
            >
              {file}
            </button>
          ))
        ) : (
          <p className="text-gray-400 text-sm text-center">No files found.</p>
        )}
      </div>
    </div>

    {/* 🔹 Main Content Container */}
    <div className="flex flex-col flex-1 p-6 overflow-auto">
      <div className="w-full max-w-4xl mx-auto bg-gray-800 shadow-xl rounded-2xl p-6 ">

        <h1 className="text-2xl font-semibold mb-6 text-center text-teal-400">
          🤖 MCP Agent Playground
        </h1>

        {/* Input Box */}
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="Enter instruction (e.g., create a new note file)"
          className="w-full p-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
          rows="4"
        />

        {/* Send Button */}
        <div className="flex justify-center mb-4">
          <button
            onClick={sendInstruction}
            disabled={loading}
            className={`px-6 py-2 rounded-md text-white ${
              loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Thinking..." : "Send to Agent"}
          </button>
        </div>

        {/* Response Box */}
        <div className="bg-gray-900 border border-gray-700 p-4 rounded-md mb-6 shadow-lg max-h-64 overflow-auto">
          <h2 className="text-lg font-semibold text-teal-300 mb-2">📝 Agent Response</h2>
          <pre className="text-sm text-gray-300 whitespace-pre-wrap">
            {response || "Response will appear here..."}
          </pre>
        </div>

        {/* File Content Viewer */}
        <div className="bg-gray-900 border border-gray-700 p-4 rounded-md shadow-lg max-h-96 overflow-auto">
          <h2 className="text-lg font-semibold text-teal-300 mb-2">📄 File Content</h2>
          <pre className="text-sm text-gray-200 whitespace-pre-wrap">
            {fileContent || "Select a file from the left sidebar to view its content"}
          </pre>
        </div>

      </div>
    </div>
  </div>
);

};