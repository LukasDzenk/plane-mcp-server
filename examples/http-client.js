#!/usr/bin/env node
// Simple example client for the HTTP MCP server
// This demonstrates how to interact with the Plane MCP server running in HTTP mode
import http from "http"

class PlaneHttpMcpClient {
  constructor(baseUrl = "http://localhost:3000") {
    this.baseUrl = baseUrl;
    this.mcpEndpoint = `${baseUrl}/mcp`;
  }

  async sendMcpMessage(message) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(message);
      const url = new URL(this.mcpEndpoint);

      const options = {
        hostname: url.hostname,
        port: url.port || 80,
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
          Accept: "application/json, text/event-stream",
        },
      };

      const req = http.request(options, (res) => {
        let responseData = "";

        res.on("data", (chunk) => {
          responseData += chunk;
        });

        res.on("end", () => {
          try {
            const response = JSON.parse(responseData);
            resolve(response);
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${responseData}`));
          }
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }

  async initialize() {
    const message = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {
          tools: {},
        },
        clientInfo: {
          name: "example-http-client",
          version: "1.0.0",
        },
      },
    };

    return this.sendMcpMessage(message);
  }

  async listTools() {
    const message = {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {},
    };

    return this.sendMcpMessage(message);
  }

  async callTool(name, args = {}) {
    const message = {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: name,
        arguments: args,
      },
    };

    return this.sendMcpMessage(message);
  }

  async healthCheck() {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.baseUrl}/health`);

      const options = {
        hostname: url.hostname,
        port: url.port || 80,
        path: url.pathname,
        method: "GET",
      };

      const req = http.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${data}`));
          }
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      req.end();
    });
  }
}

// Example usage
async function main() {
  const client = new PlaneHttpMcpClient();

  try {
    console.log("1. Checking server health...");
    const health = await client.healthCheck();
    console.log("✅ Server is healthy:", health);

    console.log("\n2. Initializing MCP connection...");
    const initResponse = await client.initialize();
    console.log("✅ Initialized:", initResponse);

    console.log("\n3. Listing available tools...");
    const tools = await client.listTools();
    console.log("✅ Available tools:", JSON.stringify(tools, null, 2));

    console.log("\n4. Calling get_user tool...");
    const userResponse = await client.callTool("get_user");
    console.log("✅ User info:", JSON.stringify(userResponse, null, 2));
  } catch (error) {
    console.error("❌ Error:", error.message);

    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 Make sure the HTTP server is running:");
      console.log("   npm run build && npm run start:http");
    }
  }
}

main();
