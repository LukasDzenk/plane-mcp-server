import { Server as HttpServer } from "http";
import { createServer } from "./server.js";
// HTTP transport implementation for MCP server
// Implements the Streamable HTTP transport as defined in the MCP specification
export class PlaneHttpMcpServer {
    port;
    httpServer;
    mcpServer;
    constructor(port = 3000) {
        this.port = port;
        this.mcpServer = createServer().server;
        this.httpServer = new HttpServer();
        this.setupRoutes();
    }
    setupRoutes() {
        this.httpServer.on("request", async (req, res) => {
            // CORS headers
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type");
            if (req.method === "OPTIONS") {
                res.writeHead(200);
                res.end();
                return;
            }
            if (req.url === "/mcp" && req.method === "POST") {
                await this.handleMcpRequest(req, res);
            }
            else if (req.url === "/mcp" && req.method === "GET") {
                await this.handleMcpStream(req, res);
            }
            else if (req.url === "/health") {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "healthy", server: "plane-mcp-server" }));
            }
            else {
                res.writeHead(404);
                res.end("Not Found");
            }
        });
    }
    async handleMcpRequest(req, res) {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });
        req.on("end", async () => {
            try {
                const message = JSON.parse(body);
                // Process MCP message through your existing server
                // This is a simplified example - you'd need to implement proper MCP message handling
                const response = await this.processMcpMessage(message);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(response));
            }
            catch (error) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Invalid JSON-RPC message" }));
            }
        });
    }
    async handleMcpStream(req, res) {
        // Set up Server-Sent Events for streaming
        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        });
        // Send initial endpoint event (required by MCP SSE transport)
        res.write(`event: endpoint\n`);
        res.write(`data: {"type":"endpoint","endpoint":"/mcp"}\n\n`);
        // Keep connection alive
        const keepAlive = setInterval(() => {
            res.write(": heartbeat\n\n");
        }, 30000);
        req.on("close", () => {
            clearInterval(keepAlive);
        });
    }
    async processMcpMessage(message) {
        // This is where you'd integrate with your existing MCP server logic
        // For now, this is a placeholder that shows the structure
        if (message.method === "tools/list") {
            return {
                jsonrpc: "2.0",
                id: message.id,
                result: {
                    tools: [
                        {
                            name: "get_projects",
                            description: "Get all projects for the current user",
                        },
                        {
                            name: "create_project",
                            description: "Create a new project",
                        },
                        // Add all your tools here
                    ],
                },
            };
        }
        // Handle other MCP methods...
        return {
            jsonrpc: "2.0",
            id: message.id,
            error: {
                code: -32601,
                message: "Method not found",
            },
        };
    }
    start() {
        this.httpServer.listen(this.port, () => {
            console.log(`Plane MCP Server running on HTTP port ${this.port}`);
            console.log(`Health check: http://localhost:${this.port}/health`);
            console.log(`MCP endpoint: http://localhost:${this.port}/mcp`);
        });
    }
    stop() {
        this.httpServer.close();
    }
}
// Export for use in other files
export default PlaneHttpMcpServer;
