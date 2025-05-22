import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from "../Service/helper.js";

function App() {
  const [userMessage, setUserMessage] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [responseStreamMessage, setResponseStreamMessage] = useState("");

  // Function to handle non-streamed message
  const sendMessage = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${BASE_URL}/query`,
        { message: userMessage },
        { headers: { "Content-Type": "application/json" } }
      );
      setResponseMessage(response.data.response || "No response from server");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Function to handle streamed message
  const sendStreamMessage = async (e) => {
    e.preventDefault();
    setResponseStreamMessage("");

    try {
      await axios.post(`${BASE_URL}/send-stream`, { message: userMessage }, {
        headers: { "Content-Type": "application/json" }
      });

      const eventSource = new EventSource(`${BASE_URL}/stream-chat`);
      eventSource.onmessage = (event) => {
        setResponseStreamMessage((prev) => prev + event.data);
      };

      eventSource.onerror = (error) => {
        console.error("Error with EventSource", error);
        eventSource.close();
      };
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Helper to format mixed code/text response
  function formatResponse(message) {
    if (!message) return null;

    const codeKeywords = ["#include", "main()", "::cout", "::cin", "int ", "return"];
    const codeStartIndex = codeKeywords
      .map((kw) => message.indexOf(kw))
      .filter((index) => index !== -1)
      .sort((a, b) => a - b)[0];

    if (codeStartIndex !== undefined) {
      const codePart = message.slice(codeStartIndex).trim();
      const textPart = message.slice(0, codeStartIndex).trim();

      return (
        <>
          {textPart && <p className="text-gray-800 mb-2">{textPart}</p>}
          <pre className="bg-black text-green-400 p-3 rounded overflow-auto text-sm leading-relaxed whitespace-pre-wrap">
            <code>{formatMultilineCode(codePart)}</code>
          </pre>
        </>
      );
    }

    return <p className="text-gray-800">{message}</p>;
  }

  function formatMultilineCode(code) {
    return code
      .replace(/cppinclude|include/g, '#include')
      .replace(/::/g, 'std::')
      .replace(/main\s*\(\)/g, 'int main()')
      .replace(/([^a-zA-Z])num1/g, '$1int num1')
      .replace(/([^a-zA-Z])num2/g, '$1int num2')
      .replace(/([^a-zA-Z])sum/g, '$1int sum')
      .replace(/stdendl/g, 'std::endl')
      .replace(/\b0;/g, 'return 0;')
      .replace(/;/g, ';\n')
      .replace(/{/g, '{\n')
      .replace(/}/g, '\n}')
      .replace(/\n{2,}/g, '\n')
      .trim();
  }

  return (
    <div className="text-gray-600 body-font w-full">
      <div className="w-full p-1">
        <div className="border-2 border-gray-200 p-6 h-full rounded-2xl bg-stone-50 shadow-inner">
          <h1 className="md:text-3xl text-2xl font-medium title-font text-gray-900 mb-2 text-center italic">
            Welcome to OraChat
          </h1>
          <p className="text-center text-sm text-gray-500 mb-6">
            This chat uses the local LLaMA model via the Cohere RAG pipeline.
          </p>

          <div className="leading-relaxed p-4 md:p-8 lg:p-12 font-base md:font-medium text-center hover:text-gray-900 sm:text-xl text-base">
            {/* Input */}
            <input
              type="text"
              placeholder="Type your message here..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              className="p-2 border border-gray-300 rounded mb-4 w-full max-w-2xl"
            />

            {/* Buttons */}
            <div className="flex justify-center gap-4 flex-wrap">
              <button
                onClick={sendMessage}
                className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
              >
                Send Non-Streamed Message
              </button>
              <button
                onClick={sendStreamMessage}
                className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
              >
                Send Streamed Message
              </button>
            </div>

            {/* Non-Streamed Response */}
            {responseMessage && (
              <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded">
                <h3 className="font-semibold text-gray-900 mb-2">Response from server:</h3>
                <p className="text-gray-900">{responseMessage}</p>
              </div>
            )}

            {/* Streamed Response */}
            {responseStreamMessage && (
              <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded">
                <h3 className="font-semibold text-gray-900 mb-2">Stream response from server:</h3>
                {formatResponse(responseStreamMessage)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
