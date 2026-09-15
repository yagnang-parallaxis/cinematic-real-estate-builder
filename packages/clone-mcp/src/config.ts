import { z } from "zod";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * The MCP process is started by an editor, not by the monorepo, so it cannot
 * assume a cwd. Everything it needs arrives through env vars with local
 * defaults that match `.env.example`.
 */
export const mcpEnvSchema = z.object({
  CLONE_API_URL: z.string().url().default("http://localhost:4000"),
  CLONE_WEB_URL: z.string().url().default("http://localhost:3000"),
  CLONE_BUILDER_URL: z.string().url().default("http://localhost:3001"),
  CLONE_EXPORT_DIR: z.string().min(1).optional(),
});

export interface McpConfig {
  apiUrl: string;
  webUrl: string;
  builderUrl: string;
  exportDir: string;
}

function stripTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): McpConfig {
  const parsed = mcpEnvSchema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    throw new Error(`Invalid clone-mcp environment — ${issues.join("; ")}`);
  }

  return {
    apiUrl: stripTrailingSlash(parsed.data.CLONE_API_URL),
    webUrl: stripTrailingSlash(parsed.data.CLONE_WEB_URL),
    builderUrl: stripTrailingSlash(parsed.data.CLONE_BUILDER_URL),
    exportDir: parsed.data.CLONE_EXPORT_DIR ?? join(tmpdir(), "cinematic-clone-exports"),
  };
}

export function previewUrls(config: McpConfig, slug: string): Record<string, string> {
  return {
    site: `${config.webUrl}/?clone=${slug}`,
    preview: `${config.webUrl}/?clone=${slug}&preview=1`,
    residences: `${config.webUrl}/residences?clone=${slug}`,
    builder: `${config.builderUrl}/?clone=${slug}`,
  };
}
