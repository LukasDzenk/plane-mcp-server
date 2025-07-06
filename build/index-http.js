#!/usr/bin/env node
import PlaneHttpMcpServer from "./http-server.js";
async function main() {
    const port = parseInt(process.env.PORT || "3000");
    const server = new PlaneHttpMcpServer(port);
    // Handle graceful shutdown
    process.on("SIGINT", () => {
        console.log("\nShutting down server...");
        server.stop();
        process.exit(0);
    });
    process.on("SIGTERM", () => {
        console.log("\nShutting down server...");
        server.stop();
        process.exit(0);
    });
    server.start();
}
main().catch((error) => {
    console.error("Fatal error in HTTP server:", error);
    process.exit(1);
});
