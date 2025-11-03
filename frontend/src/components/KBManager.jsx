// src/components/KBManager.jsx
import React, { useState } from "react";
import axios from "axios";

export default function KBManager() {
  const [file, setFile] = useState(null);
  const [kbName, setKbName] = useState("");
  const [status, setStatus] = useState("");
  const [kbs, setKbs] = useState([]);

  const handleUpload = async () => {
    if (!file || !kbName) return alert("Choose file and KB name");
    setStatus("Uploading...");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kb_name", kbName);

    try {
      const res = await axios.post("http://localhost:5000/rag/create_kb", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus("KB created: " + JSON.stringify(res.data.stats));
      setKbName("");
      setFile(null);
      await fetchKbs();
    } catch (err) {
      console.error(err);
      setStatus("Error: " + (err.response?.data?.error || err.message));
    }
  };

  const fetchKbs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/rag/list_kbs");
      setKbs(res.data.kbs || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
      <h2 className="text-xl mb-4">Create Knowledge Base (KB)</h2>
      <input
        value={kbName}
        onChange={(e) => setKbName(e.target.value)}
        placeholder="KB name (e.g. FinanceDocs)"
        className="w-full p-2 mb-2 border rounded"
      />
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-2"
      />
      <div className="flex space-x-2">
        <button onClick={handleUpload} className="px-4 py-2 bg-teal-600 text-white rounded">
          Upload & Create KB
        </button>
        <button onClick={fetchKbs} className="px-4 py-2 bg-gray-200 rounded">
          Refresh KBs
        </button>
      </div>

      <div className="mt-4">
        <strong>Status:</strong> {status}
      </div>

      <div className="mt-4">
        <strong>Available KBs:</strong>
        <ul className="list-disc ml-6">
          {kbs.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
