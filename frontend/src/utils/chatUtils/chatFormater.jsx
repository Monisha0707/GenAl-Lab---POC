// src/utils/formatResponse.js
import React from "react";
import CodeBlock from "./codeBlock.jsx";

export const formatResponse = (text) => {
  const codeRegex = /```(?:([a-z]+)\n)?([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  // 🔹 Render formatted non-code lines with darker background
  const renderBoldWithBelow = (line) => {
    if (!line.trim()) return null; // skip empty lines

    const boldRegex = /\*\*(.+?)\*\*/;
    const m = line.match(boldRegex);

    // bullet points
    if (!m) {
      if (line.trimStart().startsWith("* ")) {
        const trimmed = line.trimStart();
        const bulletText = trimmed.slice(2);
        return (
          <p
            key={Math.random()}
            className="text-left whitespace-pre-wrap  text-gray-100 px-3 py-1 rounded-md my-1"
          >
            <strong>•</strong> {bulletText}
          </p>
        );
      }
      // plain line
      return (
        <p
          key={Math.random()}
          className="text-left whitespace-pre-wrap  text-gray-100 px-3 py-1 rounded-md my-1"
        >
          {line}
        </p>
      );
    }

    // bold section
    const boldWord = m[1];
    const beforeBold = line.slice(0, m.index);
    const afterBold = line.slice(m.index + m[0].length).trimStart();

    return (
      <div
        key={Math.random()}
        className="mb-3 bg-gray-100 text-gray-100 px-3 py-2 rounded-md"
      >
        <p className="font-bold text-white">{boldWord}</p>
        <div className="flex items-start mt-1">
          <div className="mr-2 font-mono font-bold text-teal-900">|</div>
          <div>{beforeBold + afterBold}</div>
        </div>
      </div>
    );
  };

  // 🔹 Split text into plain + code parts
  while ((match = codeRegex.exec(text)) !== null) {
    const [_, language, codeContent] = match;
    const codeStart = match.index;
    const codeEnd = codeRegex.lastIndex;

    // Text before code block
    if (lastIndex < codeStart) {
      const plainText = text.slice(lastIndex, codeStart);
      const lines = plainText.split("\n");
      lines.forEach((line) => parts.push(renderBoldWithBelow(line)));
    }

    // ✅ Render code block using CodeBlock component
    parts.push(
      <div key={codeStart + "-code"} className="my-3">
        <CodeBlock language={language || "text"} value={codeContent.trim()} />
      </div>
    );

    lastIndex = codeEnd;
  }

  // Remaining text after last code block
  if (!text || typeof text !== "string") {
    return ""; // safely return empty if text is null/undefined/non-string
  }
  if (lastIndex < text.length) {
    const trailingText = text.slice(lastIndex);
    const lines = trailingText.split("\n");
    lines.forEach((line) => parts.push(renderBoldWithBelow(line)));
  }

  return parts;
};
