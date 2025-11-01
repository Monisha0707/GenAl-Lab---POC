import React, { useState } from "react";


function ChatPromptFromLocal() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const startTime = Date.now();
    const message = prompt.trim();
    if (!message) {
      alert("Please enter a message.");
      return;
    }

    setLoading(true);
    setResponse("");

    const email = localStorage.getItem("email");

    try {
      // Step 1: Fetch today's chat history
      const historyRes = await fetch("http://localhost:5000/localChat/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      if (!historyRes.ok) {
        throw new Error("Failed to fetch history");
      }

      const historyData = await historyRes.json();
  
      const history = historyData.messages || [];
      // Step 2: Create prompt from history + current message
      let fullPrompt = "";

for (let i = 0; i < history.length; i += 2) {
  const userMsg = history[i]?.role === "user" ? history[i].text : "";
  const botMsg = history[i + 1]?.role === "bot" ? history[i + 1].text : "";
  fullPrompt += `User: ${userMsg}\nLLM: ${botMsg}\n`;
}

fullPrompt += `User: ${prompt}`;

      // Step 3: Send prompt to local LLM
    const llmRes = await fetch("http://localhost:5000/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt: message }), // ✅ Only current user prompt
});
// const result = await llmRes.json();
const llmData = await llmRes.json();
console.log(llmData.response); // Display or use response

      if (!llmRes.ok) {
        throw new Error("Failed to get LLM response");
      }

      
      
      if (!llmData.response) {
        throw new Error("Invalid LLM response format");
      }

      const llmResponse = llmData.response;

     setResponse(llmResponse.text);
      console.log("✅ Set response:", llmResponse);

      const endTime = Date.now(); // ⏱️ End time
      setResponseTime(endTime - startTime);
      const saveRes = await fetch("http://localhost:5000/localChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          user_message: message,
          bot_response: llmResponse,
        }),
      });

      if (!saveRes.ok) {
        console.warn("Failed to save chat history");
      }

      setPrompt(""); // clear input after all async work done
    } catch (err) {
      console.error("Error:", err);
      setResponse("Failed to get response.");
    } finally {
      setLoading(false);
    }
  };

  // Function to detect and format code blocks
  const formatResponse = (text) => {
  const codeRegex = /```(?:[a-z]*\n)?([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  // Helper to render the text with bold + vertical line + rest below
  const renderBoldWithBelow = (line) => {
  // Bold word regex
  const boldRegex = /\*\*(.+?)\*\*/;
  const m = line.match(boldRegex);

  if (!m) {
    // Check if line is a bullet point starting with "* "
    if (line.trimStart().startsWith("* ")) {
      // Split bullet from text
      const trimmed = line.trimStart();
      const bulletText = trimmed.slice(2); // after "* "

      return (
        <p className="text-left whitespace-pre-wrap">
          <strong>•</strong> {bulletText}
        </p>
      );
    }
    // No bold or bullet - render normally
    return <p className="text-left whitespace-pre-wrap">{line}</p>;
  }

  const boldWord = m[1];
  const beforeBold = line.slice(0, m.index);
  const afterBold = line.slice(m.index + m[0].length).trimStart();

  return (
    <div key={Math.random()} className="mb-3">
      {/* Bold word on first line */}
      <p className="font-bold">{boldWord}</p>

      {/* vertical line only, no colon, and the rest on next line */}
      <div className="flex items-start">
        <div
          className="mr-2 font-mono"
          style={{ lineHeight: 1.5, fontWeight: "bold" }}
        >
          |
        </div>
        <div>{beforeBold + afterBold}</div>
      </div>
    </div>
  );
};

  while ((match = codeRegex.exec(text)) !== null) {
    const codeStart = match.index;
    const codeEnd = codeRegex.lastIndex;

    if (lastIndex < codeStart) {
      // process plain text before code block, line by line
      const plainText = text.slice(lastIndex, codeStart);
      const lines = plainText.split("\n");

      lines.forEach((line, idx) => {
        parts.push(renderBoldWithBelow(line));
      });
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
    const trailingText = text.slice(lastIndex);
    const lines = trailingText.split("\n");

    lines.forEach((line, idx) => {
      parts.push(renderBoldWithBelow(line));
    });
  }

  return parts;
};

  return (
    <div className="text-gray-600 body-font w-full">
      <div className="w-full p-1">
        <div className="border-2 border-gray-200 p-6 h-full rounded-2xl bg-stone-50 shadow-inner">
          <h1 className="md:text-3xl text-2xl font-medium title-font text-gray-900 mb-2 text-center italic">
            Welcome to OraChat
          </h1>
          <p className="text-center text-sm text-gray-500 mb-6">
            This chat uses a local LLaMA model for AI responses.
          </p>

          <form onSubmit={handleSubmit} className="mb-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
              rows={5}
              placeholder="Enter your prompt..."
              disabled={loading}
            />
            <button
              type="submit"
              className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors duration-300"
              disabled={loading}
            >
              {loading ? "Generating..." : "Ask oraChat"}
            </button>
          </form>

          {response && (
            <div className="mt-6 p-5 bg-gray-100 border border-gray-300 rounded-lg">
  <div className="flex justify-between items-center mb-2">
    <h3 className="font-semibold text-gray-900">Response:</h3>
    {responseTime !== null && (
      <p className="text-sm text-gray-900">
        ⏱️ Response Time: {(responseTime / 1000).toFixed(2)} sec
      </p>
    )}
  </div>
  {formatResponse(response)}
</div>

          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPromptFromLocal;
