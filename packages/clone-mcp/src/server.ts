import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { CloneApiClient } from "./api-client.js";
import { loadConfig, type McpConfig } from "./config.js";
import { registerBriefTools } from "./tools/brief.js";
import { registerCloneTools } from "./tools/clones.js";
import { registerExportTools } from "./tools/export.js";

export const SERVER_NAME = "cinematic-clones";
export const SERVER_VERSION = "0.0.0";

const INSTRUCTIONS = `Create and customise cinematic real-estate site clones.

Every tool talks to the local Nest API (apps/api), which owns data/clones — this
server never writes those files directly, so the builder UI and any agent always
see the same state.

Typical flow for a new customer:
1. describe_clone_schema — learn the fields a brief can fill.
2. evaluate_brief — see which prerequisites the customer's brief already covers.
3. create_clone (template "aurelia" to keep seed copy, "blank" to start empty),
   optionally passing the brief in the same call.
4. apply_customer_brief / set_section_content / upsert_residence for the rest.
5. check_prerequisites until ready, then export_clone.`;

export interface CloneMcpServer {
  server: McpServer;
  config: McpConfig;
}

export function createCloneMcpServer(config: McpConfig = loadConfig()): CloneMcpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { instructions: INSTRUCTIONS },
  );
  const client = new CloneApiClient(config.apiUrl);

  registerCloneTools(server, client, config);
  registerBriefTools(server, client);
  registerExportTools(server, client, config);

  return { server, config };
}
