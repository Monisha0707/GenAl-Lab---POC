import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { stdio } from "@modelcontextprotocol/sdk/transport/node.js";  // ✅ Correct path
import os from "os";


const server = new Server(
  {
    name: "hello-mcp",
    version: "1.0.0",
  },
  {
    tools: {
      ping: {
        description: "Replies with pong",
        execute: async () => ({ content: [{ type: "text", text: "pong 🏓" }] }),
      },
    },
  }
);

// ✅ Register tool list
server.setRequestHandler("tools/list", async () => {
  return {
    tools: [
      {
        name: "get_system_info",
        description: "Returns basic system info (OS, CPU, uptime, memory)",
        inputSchema: { type: "object", properties: {} },
      },
    ],
  };
});

// ✅ Tool execution handler
server.setRequestHandler("tools/call", async ({ name }) => {
  if (name === "get_system_info") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              platform: os.platform(),
              cpus: os.cpus().length,
              uptime: `${(os.uptime() / 3600).toFixed(2)} hours`,
              memoryGB: (os.totalmem() / 1e9).toFixed(2),
            },
            null,
            2
          ),
        },
      ],
    };
  }
  throw new Error(`Unknown tool: ${name}`);
});

// ✅ Start the MCP server
server.connect(stdio());
console.log("✅ MCP Server is running via stdio...");
