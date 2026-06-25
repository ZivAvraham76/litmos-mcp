#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Server is now running — MCP clients connect via stdio
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${(err as Error).message}\n`);
  process.exit(1);
});
