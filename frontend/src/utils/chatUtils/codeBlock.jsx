// CodeBlock.jsx
import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // fixed 1.5s, not 150s 🙂
  };

  // 🔹 Custom style override for brighter code
  const brightStyle = {
    ...oneDark,
    'pre[class*="language-"]': {
      ...oneDark['pre[class*="language-"]'],
      // background: "#1e1e1e", // darker background for contrast
      color: "#ffffff", // bright white text
      borderRadius: "8px",
      padding: "14px",
      fontSize: "0.75rem",
      lineHeight: "1.2",
    },
    'code[class*="language-"]': {
      ...oneDark['code[class*="language-"]'],
      color: "#ffffff",
    },
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 text-xs  text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? "Copied!" : "Copy"}
      </button>

      <SyntaxHighlighter language={language ?? "javascript"} style={brightStyle}>
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
