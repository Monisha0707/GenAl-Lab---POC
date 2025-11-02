import React, { useState, useEffect, useRef } from "react";
import { generateLLMResponse } from "../utils/chatUtils/chatapi.js";
import { formatResponse } from "../utils/chatUtils/chatFormater.jsx";
import {
  saveChat,
  getChats,
  endSession,
  getAllSessions,
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
  { role: "user", text: msg.message || msg.question || "" },
  { role: "bot", text: msg.response || msg.answer || "" },
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

// 🗂️ Session chat
const [sessions, setSessions] = useState([]);

useEffect(() => {
  (async () => {
    const allSessions = await getAllSessions(userId);
    setSessions(allSessions);
  })();
}, []);

// 🧭 Select a session to view chat
const handleSessionSelect = async (id) => {
  setSessionId(id);
  localStorage.setItem("ora_session_id", id);
  const selected = sessions.find((s) => s.session_id === id);
  if (selected?.chat_history) {
    const msgs = selected.chat_history.flatMap((m) => [
  { role: "user", text: m.message || m.question || "" },
  { role: "bot", text: m.response || m.answer || "" },
]);

    setMessages(msgs);
  } else {
    setMessages([]);
  }
};


// 🆕 Start new chat session
const handleNewSession = async () => {
  const newSession = uuidv4();
  setSessionId(newSession);
  localStorage.setItem("ora_session_id", newSession);
  setMessages([]);
  console.log("🆕 Started new session:", newSession);
};


  // 🧹 End session
  const handleClear = async () => {
    try {
      const allSessions = await getAllSessions(userId);
      setSessions(allSessions);
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
  <div className="text-gray-600 body-font w-full flex h-screen">
    {/* 🧭 Sidebar */}
    <div className="w-56 h-[84vh] bg-gray-900 mt-10 text-white p-2 rounded-2xl flex flex-col shadow-inner">
      {/* Sidebar Header */}
      <h2 className="text-xl font-semibold mb-4 text-center border-b border-gray-700 pb-2">
        💬 Sessions
      </h2>

      {/* Scrollable Sessions */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {sessions.length === 0 ? (
          <p className="text-gray-400 text-sm text-center">No sessions yet</p>
        ) : (
          sessions.map((s, idx) => (
            <button
              key={s.session_id}
              onClick={() => handleSessionSelect(s.session_id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                s.session_id === sessionId
                  ? "bg-teal-600 text-white"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              <div className="flex flex-col">
                <span className="font-semibold">Session {idx + 1}</span>
                <span className="text-gray-300 text-xs truncate">
                  {s.last_message || "No messages yet"}
                </span>
                {/* {s.created_at && (
                  <span className="text-gray-400 text-xs">
                    {new Date(s.created_at).toLocaleString()}
                  </span>
                )} */}
              </div>
            </button>
          ))
        )}
      </div>

      {/* New Session Button */}
      <button
        onClick={handleNewSession}
        className="mt-4 bg-teal-500 hover:bg-teal-600 text-white px-3 py-2 rounded-lg text-sm"
      >
        ➕ New Session
      </button>
    </div>

    {/* 💬 Main Chat Area */}
    <div className="flex-1 w-full p-1 mt-8 rounded-2xl">
      <div className="border-2 border-gray-200 p-2 h-full rounded-r-2xl bg-stone-50 shadow-inner rounded-2xl">
        {messages.length === 0 ? (
          // 🌟 Initial Welcome Screen
          <div className="text-center space-y-4 py-0">
            <h1 className="md:text-3xl text-2xl font-medium title-font text-gray-900 italic">
              Welcome to OraChat
            </h1>
            <p className="text-gray-400 text-sm">
              Your local LLaMA model is ready to chat.
            </p>

            <form
  onSubmit={(e) => {
    e.preventDefault();
    handleSubmit(e);
  }}
  className="mt-6 flex items-end space-x-3 border border-gray-300 rounded-2xl bg-white p-3 shadow-sm hover:shadow-md transition-all"
>
  <textarea
  value={prompt}
  onChange={(e) => setPrompt(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // stop newline
      handleSubmit(e); // submit form
    }
  }}
  className="flex-1 min-h-[50px] max-h-[180px] p-3 rounded-xl border-none resize-none focus:outline-none text-gray-800 bg-transparent placeholder-gray-400"
  placeholder="Message OraChat..."
  rows={1}
  disabled={loading}
/>

  <button
    type="submit"
    className={`px-4 py-2 rounded-xl text-white font-medium transition-colors duration-300 ${
      loading
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-teal-500 hover:bg-teal-600"
    }`}
    disabled={loading}
  >
    {loading ? "..." : "Send"}
  </button>
</form>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4 ">
              <h1 className="text-2xl font-medium text-gray-900 italic">
                OraChat
              </h1>
              <button
                onClick={handleClear}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
              >
                End Session
              </button>
            </div>

            {/* Chat container */}
<div
  ref={chatContainerRef}
  className="h-[55vh] overflow-y-auto bg-gray-800 text-gray-100 p-4 rounded-lg space-y-3 border border-gray-700 flex flex-col"
>
  {messages.map((msg, i) => (
    <div
      key={i}
      className={`flex w-full ${
        msg.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`px-4 py-3 rounded-2xl text-sm md:text-base leading-relaxed break-words shadow-sm max-w-[75%] ${
          msg.role === "user"
            ? "bg-teal-600 text-white rounded-br-none"
            : "bg-gray-700 text-gray-100 rounded-bl-none"
        }`}
      >
        {msg.role === "bot" ? formatResponse(msg.text) : msg.text}
      </div>
    </div>
  ))}
</div>


            {/* Input */}
            <form onSubmit={(e) => {
    e.preventDefault();
    handleSubmit(e);
  }} className="mt-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-2 border border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-800 text-white"
                rows={2}
                placeholder="Ask something..."
                disabled={loading}
                onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // stop newline
      handleSubmit(e); // submit form
    }
  }}

              />
              <button
                type="submit"
                className={`mt-2 px-6 py-2 rounded-lg text-white transition-colors duration-300 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-teal-500 hover:bg-teal-600"
                }`}
                disabled={loading}
              >
                {loading ? "Generating..." : "Ask OraChat"}
              </button>
            </form>

            {responseTime !== null && (
              <p className="text-sm text-gray-500 mt-0 text-center">
                ⏱️ {(responseTime / 1000).toFixed(2)} sec
              </p>
            )}
          </>
        )}
      </div>
    </div>
  </div>
);

}

export default ChatPromptFromLocal;
