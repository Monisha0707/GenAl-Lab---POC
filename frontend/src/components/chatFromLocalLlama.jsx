import React, { useState, useEffect, useRef } from "react";
import { generateLLMResponse } from "../utils/chatUtils/chatapi.js";
import { formatResponse } from "../utils/chatUtils/chatFormater.jsx";
import {
  saveChat,
  getChats,
  endSession,
} from "../utils/chatUtils/chatapi.js";
import { v4 as uuidv4 } from "uuid";

function ChatPromptFromLocal() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(null);
  const [messages, setMessages] = useState([]);

  const userId = "guest"; // or your auth user ID
  const [sessionId, setSessionId] = useState(
    localStorage.getItem("ora_session_id") || uuidv4()
  );
  const chatContainerRef = useRef(null);


  // ✅ Load current session chats
  useEffect(() => {
    (async () => {
      try {
        const data = await getChats(userId, sessionId); // GET /api/chat/:user/:session_id
        if (Array.isArray(data)) {
          const msgs = data.flatMap((msg) => [
            { role: "user", text: msg.message },
            { role: "bot", text: msg.response },
          ]);
          setMessages(msgs);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error("❌ Failed to load chats:", err);
      }
    })();
  }, [sessionId]);
  useEffect(() => {
  if (chatContainerRef.current) {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }
}, [messages]);

  // 🧹 End session
  const handleClear = async () => {
    try {
      await endSession(userId, sessionId); // POST /api/chat/end/:user/:session_id
      const newSession = uuidv4();
      setSessionId(newSession);
      localStorage.setItem("ora_session_id", newSession);
      setMessages([]);
      console.log("✅ Session ended, new session started:", newSession);
    } catch (err) {
      console.error("❌ Failed to end session:", err);
    }
  };

  // 💬 Handle chat submission
  // 💬 Handle chat submission
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!prompt.trim()) return;

  const startTime = Date.now();
  setLoading(true);

  const userMessage = { role: "user", text: prompt.trim() };
  const newMessages = [...messages, userMessage];
  setMessages(newMessages);
  setPrompt("");

  try {
    // 🧠 Build context (last 5 messages)
    const contextWindow = 5;
    const contextMessages = newMessages.slice(-contextWindow * 2); // last few pairs
    const contextString = contextMessages
      .map((m) => `${m.role.toUpperCase()}: ${m.text}`)
      .join("\n");

    // 🪄 Combine context + new prompt
    const fullPrompt = `
You are an AI assistant continuing a conversation.
Here is the previous context:
${contextString}

Now the user says:
${prompt.trim()}

Respond naturally and consistently.
`;

    // 🧠 Call LLM with context
    const llmResponse = await generateLLMResponse(fullPrompt);

    const endTime = Date.now();
    setResponseTime(endTime - startTime);

    const botMessage = { role: "bot", text: llmResponse };
    const updatedMessages = [...newMessages, botMessage];
    setMessages(updatedMessages);

    // 💾 Save chat to DB
    await saveChat(userId, sessionId, prompt.trim(), llmResponse);
  } catch (err) {
    console.error("Error:", err);
    const errorMessage = { role: "bot", text: "⚠️ Failed to get response." };
    setMessages([...newMessages, errorMessage]);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="text-gray-600 body-font w-full">
      <div className="w-full p-1">
        <div className="border-2 border-gray-200 p-6 h-full rounded-2xl bg-stone-50 shadow-inner">
          <h1 className="md:text-3xl text-2xl font-medium title-font text-gray-900 mb-2 text-center italic">
            Welcome to OraChat
          </h1>
          <p className="text-center text-sm text-gray-400 mb-6">
            This chat uses a local LLaMA model for AI responses.
          </p>

          {/* 🧹 End Session Button */}
          <div className="flex justify-end mb-2">
            <button
              onClick={handleClear}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
            >
              End Session
            </button>
          </div>

          {/* 💬 Chat History */}
          <div
  ref={chatContainerRef}
  className="h-96 overflow-y-auto bg-gray-800 text-gray-100 p-4 rounded-lg space-y-3 border border-gray-700"
>

            {messages.length === 0 && (
              <p className="text-gray-400 text-center">
                Start a conversation below 👇
              </p>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-teal-600 text-white self-end ml-auto"
                    : "bg-gray-700 text-gray-100 self-start mr-auto"
                }`}
              >
                {msg.role === "bot" ? formatResponse(msg.text) : msg.text}
              </div>
            ))}
          </div>

          {/* ✍️ Input Form */}
          <form onSubmit={handleSubmit} className="mt-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-3 border border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-800 text-white"
              rows={4}
              placeholder="Enter your prompt..."
              disabled={loading}
            />
            <button
              type="submit"
              className={`mt-4 px-6 py-2 rounded-lg text-white transition-colors duration-300 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-teal-500 hover:bg-teal-600"
              }`}
              disabled={loading}
            >
              {loading ? "Generating..." : "Ask OraChat"}
            </button>
          </form>

          {/* 🕓 Response Time */}
          {responseTime !== null && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              ⏱️ {(responseTime / 1000).toFixed(2)} sec
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPromptFromLocal;
