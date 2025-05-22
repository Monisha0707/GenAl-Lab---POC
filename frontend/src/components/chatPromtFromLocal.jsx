import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from "../Service/helper.js";

function chatPromtFromLocal() {
  // Local model
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3",
          prompt: prompt,
          stream: false,
        }),
      });

      const data = await res.json();
      setResponse(data.response);
    } catch (err) {
      console.error(err);
      setResponse("Failed to get response.");
    } finally {
      setLoading(false);
    }
  };

  // 🧠 Function to detect and format code blocks
  const formatResponse1 = (text) => {
    const codeRegex = /```(?:[a-z]*\n)?([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(text)) !== null) {
      const codeStart = match.index;
      const codeEnd = codeRegex.lastIndex;

      if (lastIndex < codeStart) {
        parts.push(
          <p key={lastIndex} className="text-left whitespace-pre-wrap">
            {text.slice(lastIndex, codeStart)}
          </p>
        );
      }

      parts.push(
        <pre
          key={codeStart + "-code"}
          className="bg-gray-800 text-white p-4 rounded my-2 overflow-auto text-left"
        >
          <code className="whitespace-pre">{match[1]}</code>
        </pre>
      );

      lastIndex = codeEnd;
    }

    if (lastIndex < text.length) {
      parts.push(
        <p key="last" className="text-left whitespace-pre-wrap">
          {text.slice(lastIndex)}
        </p>
      );
    }

    return parts;
  };

  return (
    <div className="text-gray-600 body-font w-full">
  <div className="w-full p-1">
    <div className="border-2 border-gray-200 p-6 h-full rounded-2xl bg-stone-50 shadow-inner">
      {/* Welcome message */}
      <h1 className="md:text-3xl text-2xl font-medium title-font text-gray-900 mb-2 text-center italic">
        Welcome to OraChat
      </h1>
      <p className="text-center text-sm text-gray-500 mb-6">
        This chat uses a local LLaMA model for AI responses.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
          rows={5}
          placeholder="Enter your prompt..."
        />
        <button
          type="submit"
          className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors duration-300"
          disabled={loading}
        >
          {loading ? "Generating..." : "Ask oraChat"}
        </button>
      </form>

      {/* Response */}
      {response && (
        <div className="mt-6 p-5 bg-gray-100 border border-gray-300 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Response:</h3>
          {formatResponse1(response)}
        </div>
      )}
    </div>
  </div>
</div>

  );
}

export default chatPromtFromLocal;
