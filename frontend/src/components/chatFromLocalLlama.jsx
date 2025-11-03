import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { generateLLMResponse } from "../utils/chatUtils/chatapi.js";
import { formatResponse } from "../utils/chatUtils/chatFormater.jsx";
import {
  saveChat,
  getChats,
  getAllSessions,
} from "../utils/chatUtils/chatapi.js";

function ChatPromptFromLocal() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const userId = "guest";
  const [sessionId, setSessionId] = useState(
    localStorage.getItem("ora_session_id") || uuidv4()
  );
  const chatContainerRef = useRef(null);

  // 🧭 Load current session chats
  useEffect(() => {
    (async () => {
      try {
        const data = await getChats(userId, sessionId);
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

  // 🧭 Auto-scroll on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 🗂️ Load all sessions
  useEffect(() => {
    (async () => {
      const allSessions = await getAllSessions(userId);
      setSessions(allSessions);
    })();
  }, []);

  // 🧭 Select a session
  const handleSessionSelect = (id) => {
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

  // 🆕 New session
  const handleNewSession = () => {
    const newSession = uuidv4();
    setSessionId(newSession);
    localStorage.setItem("ora_session_id", newSession);
    setMessages([]);
    console.log("🆕 Started new session:", newSession);
  };

  // 🧹 End + start fresh session
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

  // 💬 Submit handler
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
      const contextWindow = 5;
      const contextMessages = newMessages.slice(-contextWindow * 2);
      const contextString = contextMessages
        .map((m) => `${m.role.toUpperCase()}: ${m.text}`)
        .join("\n");

      const fullPrompt = `
You are a friendly and expressive AI assistant continuing a conversation.

Guidelines:
- Respond with natural emotions and tone.
- Include **appropriate emojis** that match the context (e.g., 😊, 💡, 🚀, 🤔, 🎉, 👀, 😂, 🤣, 💥, 🌟, 🏆, 🚀, 👽, 🤖, 💻, 📱, 🕰️, 🔴, 🛸, 👸, 🎁).
- Keep responses concise but warm and engaging.
- Maintain context from the previous messages.

Here is the previous context:
${contextString}

Now the user says: ${prompt.trim()}

Respond naturally, emotionally, and with suitable emojis.
`;

      const llmResponse = await generateLLMResponse(fullPrompt);
      const endTime = Date.now();
      setResponseTime(endTime - startTime);

      const botMessage = { role: "bot", text: llmResponse };
      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);

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
      {/* Sidebar */}
      <div className="w-56 h-[88vh] bg-gray-900 mt-2 text-white p-2 rounded-2xl flex flex-col shadow-inner">
        <h2 className="text-xl font-semibold mb-4 text-center border-b border-gray-700 pb-2">
          💬 Chats History
        </h2>

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
                </div>
              </button>
            ))
          )}
        </div>

        <button
          onClick={handleNewSession}
          className="mt-4 bg-teal-500 hover:bg-teal-600 text-white px-3 py-2 rounded-lg text-sm"
        >
          ➕ New Chat
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="h-[90vh] flex-1 w-full p-1 mt-0 rounded-2xl">
        <div className="border-2 border-gray-200 p-2 h-full rounded-2xl bg-gray-700 shadow-inner">
          {messages.length === 0 ? (
            // Welcome screen
            <div className="text-center space-y-4 py-0">
              <h1 className="md:text-3xl text-2xl font-medium text-gray-100 italic">
                Welcome to OraChat
              </h1>
              <p className="text-gray-100 text-sm">
                Your local LLaMA model is ready to chat.
              </p>

              {/* Input at bottom */}
              <div className="pt-80 mb-10">
                <form
                  onSubmit={handleSubmit}
                  className="mt-20 flex items-center space-x-0 border border-gray-100 rounded-2xl bg-gray-800 p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    className="flex-1 min-h-[70px] max-h-[70px] p-3 rounded-xl border-none resize-none focus:outline-none text-gray-100 bg-gray-800 placeholder-gray-400"
                    placeholder="Message OraChat..."
                    rows={3}
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    className={`px-4 py-2 mb-5 rounded-xl text-white font-medium transition-colors duration-300 ${
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
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-medium text-gray-100 italic">
                  OraChat
                </h1>
                <button
                  onClick={handleClear}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                >
                  End Session
                </button>
              </div>

              {/* Chat Container */}
              <div
                ref={chatContainerRef}
                className="h-[65vh] overflow-y-auto ont-size-0.75rem text-sm bg-gray-800 text-gray-100 p-4 rounded-lg space-y-3 border border-gray-700 flex flex-col"
              >
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex  ${
                      msg.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm font-size-0.75rem md:text-sm leading-relaxed break-words shadow-sm max-w-[75%] ${
                        msg.role === "user"
                          ? "bg-teal-600 text-white rounded-br-none"
                          : "bg-gray-700 text-gray-100 rounded-bl-none"
                      }`}
                    >
                      {msg.role === "bot"
                        ? formatResponse(msg.text)
                        : msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <form
                onSubmit={handleSubmit}
                className="mt-2 flex items-center border border-gray-700 rounded-lg bg-gray-800 focus-within:ring-2 focus-within:ring-teal-400"
              >
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  className="flex-1 p-2 bg-transparent text-white resize-none focus:outline-none placeholder-gray-400"
                  rows={2}
                  placeholder="Ask something..."
                  disabled={loading}
                />
                <button
                  type="submit"
                  className={`ml-2 px-4 py-2 mr-4 rounded-md text-white transition-colors duration-300 ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-teal-500 hover:bg-teal-600"
                  }`}
                  disabled={loading}
                >
                  {loading ? "..." : "Send"}
                </button>
              </form>

              {responseTime && (
                <p className="text-sm text-gray-100 mt-1 text-center">
                  ⏱️ Response Time: {(responseTime / 1000).toFixed(2)} sec
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
