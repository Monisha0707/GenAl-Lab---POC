import React, { useEffect, useState } from "react";
import axios from "axios";

export default function KnowledgeBaseList() {
  const [kbs, setKbs] = useState([]);
  const [selectedKb, setSelectedKb] = useState("");
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleFileUpload = async (kbName) => {
    if (files.length === 0) {
      alert("Please select one or more files to upload.");
      return;
    }

    setLoading(true);
    setStatus(`Uploading files to ${kbName}...`);

    const fd = new FormData();
    fd.append("kb_name", kbName);
    for (let i = 0; i < files.length; i++) {
      fd.append("file", files[i]);
    }

    try {
      await axios.post("http://localhost:5000/rag/add_to_kb", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(`✅ Files added successfully to ${kbName}`);
      setFiles([]);
      setSelectedKb("");
      setStatus("Upload successful!");
      fetchKbs();
    } catch (err) {
      console.error(err);
      alert("❌ Error uploading files: " + (err.response?.data?.error || err.message));
      setStatus("Error: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="w-full max-w-3xl bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-center mb-4">
          📚 Knowledge Bases
        </h2>

        {kbs.length > 0 ? (
          <table className="w-full border border-gray-700 rounded-lg">
            <tbody>
              {kbs.map((k) => (
                <tr key={k} className="border-b border-gray-700">
                  <td className="p-3 text-gray-200">{k}</td>
                  <td className="p-3 text-right">
                    {selectedKb === k ? (
                      <div className="flex flex-col items-end space-y-2">
                        <input
                          type="file"
                          multiple
                          accept="application/pdf"
                          onChange={(e) => setFiles(Array.from(e.target.files))}
                          className="border border-gray-600 p-1 rounded-md text-gray-100 bg-gray-800 w-full sm:w-auto"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleFileUpload(k)}
                            disabled={loading}
                            className={`px-3 py-1 rounded-md ${
                              loading
                                ? "bg-gray-500 cursor-not-allowed"
                                : "bg-teal-600 hover:bg-teal-700"
                            }`}
                          >
                            {loading ? "Uploading..." : "Upload"}
                          </button>
                          <button
                            onClick={() => setSelectedKb("")}
                            className="px-3 py-1 rounded-md bg-gray-600 hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedKb(k)}
                        className="px-3 py-1 rounded-md bg-teal-600 hover:bg-teal-700"
                      >
                        ➕ Add Files
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 text-center">No Knowledge Bases found.</p>
        )}

        {status && (
          <p className="text-sm text-gray-400 text-center mt-4">
            <strong>Status:</strong> {status}
          </p>
        )}
      </div>
    </div>
  );
}
