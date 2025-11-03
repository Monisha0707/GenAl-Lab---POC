// src/utils/formatResponse.js
import React from "react";
import CodeBlock from "./codeBlock.jsx";

export const formatResponse = (text) => {
  const codeRegex = /```(?:([a-z]+)\n)?([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  const renderBoldWithBelow = (line) => {
    if (!line.trim()) return null;


    // 🧹 Clean up duplicated bullets or stray dots
  line = line.replace(/^•\s*/, "");  // remove leading bullet
  line = line.replace(/^-\s*/, "");  // remove leading dash
  line = line.replace(/^\*\s*/, ""); // remove leading asterisk

    // 🔹 Detect Markdown headers
    const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const headerText = headerMatch[2];
      const headerSizes = {
        1: "text-3xl",
        2: "text-2xl",
        3: "text-xl",
        4: "text-lg",
        5: "text-base",
        6: "text-sm",
      };
      return (
        <p
          key={Math.random()}
          className={`${headerSizes[level]} font-bold text-white mt-4 mb-2`}
        >
          {headerText}
        </p>
      );
    }

    // 🔹 Detect bold
    const boldRegex = /\*\*(.+?)\*\*/;
    const m = line.match(boldRegex);

    // 🔹 Handle bullet points
    if (!m) {
      if (line.trimStart().match(/^(\*|\-|\•)\s+/)) {
  const bulletText = line.replace(/^(\*|\-|\•)\s+/, "");
  return (
   <p
  key={Math.random()}
  className="text-left whitespace-pre-wrap text-gray-100 px-3 py-1 rounded-md my-2"
>
  <strong>•</strong>{bulletText}
</p>


  );
}


      // plain text
      return (
        <p
          key={Math.random()}
          className="text-left whitespace-pre-wrap text-gray-100 px-3 py-1 rounded-md my-1"
        >
          {line}
        </p>
      );
    }

    // 🔹 Handle bold with description below
    const boldWord = m[1];
    const beforeBold = line.slice(0, m.index);
    const afterBold = line.slice(m.index + m[0].length).trimStart();

    return (
      <div
        key={Math.random()}
        className="mb-3 bg-gray-900 text-gray-100 px-3 py-2 rounded-md"
      >
        <p className="font-bold text-white">{boldWord}</p>
        <div className="flex items-start mt-1">
          <div className="mr-2 text-lg font-bold text-gray-100">•</div>
          <div>{beforeBold + afterBold}</div>
        </div>
      </div>
    );
  };

  // 🔹 Split text into plain + code blocks
  while ((match = codeRegex.exec(text)) !== null) {
    const [_, language, codeContent] = match;
    const codeStart = match.index;
    const codeEnd = codeRegex.lastIndex;

    if (lastIndex < codeStart) {
      const plainText = text.slice(lastIndex, codeStart);
      const lines = plainText.split("\n");
      lines.forEach((line) => parts.push(renderBoldWithBelow(line)));
    }

    parts.push(
      <div key={codeStart + "-code"} className="my-3">
        <CodeBlock language={language || "text"} value={codeContent.trim()} />
      </div>
    );

    lastIndex = codeEnd;
  }

  // Remaining text after last code block
  if (!text || typeof text !== "string") return "";
  if (lastIndex < text.length) {
    const trailingText = text.slice(lastIndex);
    const lines = trailingText.split("\n");
    lines.forEach((line) => parts.push(renderBoldWithBelow(line)));
  }

  return parts;
};
