#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { pathToFileURL } from "node:url";

import { createCloneMcpServer } from "./server.js";

export { createCloneMcpServer, SERVER_NAME, SERVER_VERSION } from "./server.js";
export { CloneApiClient, CloneApiError } from "./api-client.js";
export { applyBrief, customerBriefSchema, type CustomerBrief } from "./brief.js";
export { loadConfig, type McpConfig } from "./config.js";

async function main(): Promise<void> {
  const { server } = createCloneMcpServer();
  /* stdout belongs to the JSON-RPC stream; diagnostics go to stderr only. */
  await server.connect(new StdioServerTransport());
  process.stderr.write("cinematic-clones MCP server ready on stdio\n");
}

/* Only self-start when executed as the entry point, so the exports stay importable. */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    process.stderr.write(`cinematic-clones MCP server failed: ${String(error)}\n`);
    process.exit(1);
  });
}
