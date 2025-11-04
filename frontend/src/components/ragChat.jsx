import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { generateLLMResponse } from "../utils/chatUtils/chatapi.js";
import { formatResponse } from "../utils/chatUtils/chatFormater.jsx";
import {
  saveRagChat,
  getRagChats,
  getAllRagSessions,
  deleteRagSession
} from "../utils/chatUtils/chatapi.js";
import { ArrowUp, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
function RagChat() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [kbs, setKbs] = useState([]); // KB list
  const [selectedKb, setSelectedKb] = useState(""); // selected KB (UI-only for now)
  const userId = "guest";
  const [sessionId, setSessionId] = useState(
    localStorage.getItem("ora_session_id") || uuidv4()
  );
  const chatContainerRef = useRef(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
 const navigate = useNavigate();

  // 🧭 Load current session chats
 // 🧭 Load current session chats
useEffect(() => {
  (async () => {
    try {
      const data = await getRagChats(userId, sessionId);
      if (Array.isArray(data)) {
        const msgs = data.flatMap((msg) => [
          {
            role: "user",
            text: msg.question || "",
          },
          {
            role: "bot",
            text: msg.answer || "",
            citations: msg.citations || [], // ✅ include citations
          },
        ]);
        setMessages(msgs);
        console.log("🧾 Loaded messages with citations:", msgs);
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
      const allSessions = await getAllRagSessions(userId);
      // console.log("📂 Loaded all sessions:", allSessions);
      setSessions(allSessions);
    })();
  }, []);

  // ✅ Load KB list (UI only)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/rag/list_kbs");
        if (!res.ok) {
          throw new Error("Failed to fetch KBs");
        }
        const data = await res.json();
        const list = data.kbs || [];
        setKbs(list);
        if (list.length > 0 && !selectedKb) setSelectedKb(list[0]);
      } catch (err) {
        console.error("❌ Failed to load KBs:", err);
      }
    })();
    // run once on mount
  }, []);

  // 🧭 Select a session
  const handleSessionSelect = async (id) => {
  setSessionId(id);
  localStorage.setItem("ora_session_id", id);

  try {
    const data = await getRagChats(userId, id);
    if (Array.isArray(data)) {
      const msgs = data.flatMap((msg) => [
  { role: "user", text: msg.question || "" },
  { 
    role: "bot", 
    text: msg.answer || "", 
    citations: msg.citations || []  // ✅ Include citations
  },
]);

      setMessages(msgs);
    } else {
      setMessages([]);
    }
  } catch (err) {
    console.error("❌ Failed to fetch chats for session:", err);
    setMessages([]);
  }
};
const refreshSessions = async () => {
  const allSessions = await getAllRagSessions(userId);
  setSessions(allSessions);
};



  // 🆕 New session
  const handleNewSession = () => {
    refreshSessions();
    const newSession = uuidv4();
    setSessionId(newSession);
    localStorage.setItem("ora_session_id", newSession);
    setMessages([]);
    console.log("🆕 Started new session:", newSession);

  };

  // 🧹 End + start fresh session
  const handleClear = async () => {
    try {
      const allSessions = await getAllRagSessions(userId);
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


  const handleDeleteSession = async (id) => {
    refreshSessions();
  const confirmDelete = window.confirm("🗑️ Are you sure you want to delete this chat session?");
  if (!confirmDelete) return;

  try {
    await deleteRagSession(userId, id);
    alert("✅ Chat session deleted successfully!");

    const updated = sessions.filter((s) => s.session_id !== id);
    setSessions(updated);

    if (id === sessionId && updated.length > 0) {
      setSessionId(updated[0].session_id);
    } else if (updated.length === 0) {
      handleNewSession();
    }
  } catch (err) {
    console.error("❌ Failed to delete session:", err);
    alert("❌ Failed to delete session. Please try again.");
  }
};

  // 💬 Submit handler
 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!prompt.trim() || !selectedKb) return;

  setLoading(true);
  const userMessage = { role: "user", text: prompt };
  setMessages((prev) => [...prev, userMessage]);
  setPrompt("");

  try {
    const res = await fetch("http://localhost:5000/ragChat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kb_name: selectedKb,
        query: prompt,
        user_id: userId,
        session_id: sessionId,
      }),
    });

    const data = await res.json();

    /// 🧩 Extract citations safely
const citations = Array.isArray(data.citations)
  ? data.citations
  : Array.isArray(data.context_docs)
  ? data.context_docs
  : [];



    // ✅ Save chat (still using text only)
    await saveRagChat(
  userId,
  sessionId,
  prompt.trim(),
  data.text || data.answer,
  citations // ✅ send citations to backend
);


    // ✅ Append bot message WITH citations
    const botMessage = {
      role: "bot",
      text: data.text || data.answer,
      citations: citations,
    };

    setMessages((prev) => [...prev, botMessage]);
  } catch (err) {
    console.error("❌ Chat error:", err);
  } finally {
    setLoading(false);
  }
};


function BotMessageWithCitations({ msg }) {
  const [showCitations, setShowCitations] = useState(false);

  return (
    <div>
      {/* Main Answer */}
      <div>{formatResponse(msg.text)}</div>
      
      {/* Toggle button */}
      <button
        onClick={() => setShowCitations(!showCitations)}
        className="mt-2 text-xs text-teal-400 hover:underline focus:outline-none"
      >
        {showCitations ? "Hide Citations ▲" : "Show Citations ▼"}
      </button>

      {/* Collapsible panel */}
      {showCitations && (
        console.log("Citations:", msg.citations),
        <div className="mt-2 bg-gray-900 border border-gray-700 p-3 rounded-lg text-xs text-gray-300 max-h-48 overflow-auto">
          {msg.citations && msg.citations.length > 0 ? (
            msg.citations.map((c, idx) => (
              <div key={idx} className="mb-2 border-b border-gray-800 pb-1">
                <p className="font-semibold text-gray-200">
                  Source {idx + 1}:
                </p>
                <p className="whitespace-pre-line text-gray-400">{c}</p>
              </div>
            ))
          ) : (
            <p>No citations found for this response.</p>
          )}
        </div>
      )}
    </div>
  );
}




  return (
    <div className="text-gray-600 body-font w-full flex h-screen bg-gray-800">
      {/* Sidebar */}
      <div className="w-56 h-[99vh] bg-gray-800 mt-1 text-white p-1 rounded-xl flex flex-col shadow-inner border border-gray-100">
<div className="mb-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex justify-between items-center bg-gray-700 hover:bg-gray-600 p-2 rounded-md transition"
          >
            <div className="flex items-center gap-2">
                      <Menu size={18} className="text-white" />
                      <span className="text-sm  font-semibold">OraRagChat</span>
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


        
      <h2 className="text-sm mb-4 text-center border-b border-gray-700 pb-2">
        💬 Chats History
      </h2>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
  {sessions.length === 0 ? (
    <p className="text-gray-400 text-sm text-center">No sessions yet</p>
  ) : (
    sessions.map((s, idx) => (
      <div
        key={s.session_id}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
          s.session_id === sessionId
            ? "bg-teal-600 text-white"
            : "bg-gray-800 hover:bg-gray-700"
        }`}
      >
        <button
          onClick={() => handleSessionSelect(s.session_id)}
          className="flex flex-col flex-1 text-left"
        >
          <span className="font-semibold">Session {idx + 1}</span>
          <span className="text-gray-300 text-xs truncate">
  {s.last_message
    ? s.last_message.slice(0, 20) + (s.last_message.length > 20 ? "..." : "")
    : "No messages yet"}
</span>

        </button>

        {/* 🗑️ Delete icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteSession(s.session_id);
          }}
          className="ml-2 text-red-400 hover:text-red-600 transition"
          title="Delete session"
        >
          🗑️
        </button>
      </div>
    ))
  )}
</div>


        <button
          onClick={handleNewSession}
          className="mt-4 py-1 text-sm rounded-md bg-gray-700 hover:bg-gray-600 border border-gray-600"
        >
          New Chat
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="h-[100vh] flex-1 w-full p-1 mt-0 rounded-xl">
        <div className="border-2 border-gray-200 p-2 h-full rounded-2xl bg-gray-800 shadow-inner">
{messages.length === 0 ? (
  // Welcome screen + KB selection
  <div className="text-center space-y-6 flex flex-col items-center justify-center h-full">
    <h1 className="md:text-3xl text-2xl font-medium text-gray-100 italic">
      Welcome to OraRagChat
    </h1>
    <p className="text-gray-300 text-sm mb-4">
      Select a Knowledge Base to begin chatting.
    </p>

    {/* KB selector */}
    <div className="flex flex-col items-center space-y-3">
      <label className="text-gray-200 text-sm">Select Knowledge Base</label>
      <select
        value={selectedKb}
        onChange={(e) => setSelectedKb(e.target.value)}
        className="bg-gray-700 text-gray-100 text-sm p-2 rounded-lg"
      >
        <option value="">-- Choose KB --</option>
        {kbs.map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>
    </div>

    {/* Input appears only when KB is selected */}
    {selectedKb && (
      <div className="w-full max-w-lg mt-10">
        <form
          onSubmit={handleSubmit}
          className="flex items-center space-x-0 border border-gray-600 rounded-2xl bg-gray-800 p-3 shadow-sm hover:shadow-md transition-all"
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
            className={`px-4 py-2 mb-1 rounded-xl text-white font-medium transition-colors duration-300 ${
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
    )}
  </div>
) : (

            <>
              <div className="flex justify-between items-center mb-4">
                {/* Left spacer - intentionally empty */}
                <div></div>

                {/* KB selector (UI-only) */}
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-300 mr-2">KB:</label>
                  <select
                    value={selectedKb}
                    onChange={(e) => setSelectedKb(e.target.value)}
                    className="bg-gray-700 text-gray-100 text-sm p-1 rounded"
                  >
                    <option value="">(none)</option>
                    {kbs.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                {/* End session button on right */}
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
                className="h-[80vh] mt-[-10px] overflow-y-auto font-size-0.75rem text-sm bg-gray-800 text-gray-100 p-4 rounded-lg space-y-3 border border-gray-700 flex flex-col"
              >
                {messages.map((msg, i) => (
  <div
    key={i}
    className={`flex ${
      msg.role === "user" ? "justify-end" : "justify-start"
    }`}
  >
    <div
      className={`px-4 py-3 rounded-2xl text-sm md:text-sm leading-relaxed break-words shadow-sm max-w-[70%] whitespace-pre-wrap
        ${
          msg.role === "user"
            ? "bg-teal-600 text-white rounded-br-none mr-2"
            : "bg-gray-700 text-gray-100 rounded-bl-none ml-[10%]"
        }`}
    >
      {msg.role === "bot" ? (
        <BotMessageWithCitations msg={msg} />
      ) : (
        msg.text
      )}
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
                  rows={1}
                  placeholder="Ask something..."
                  disabled={loading}
                />
                <button
                  type="submit"
                  className={`ml-2 mr-4 p-2 rounded-full flex items-center justify-center transition-colors duration-300 shadow-md
                    ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-teal-500 hover:bg-teal-600"
                    }`}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="text-white text-sm">...</span>
                  ) : (
                    <ArrowUp size={18} className="text-white" />
                  )}
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

export default RagChat;
