import { SECTION_KEYS } from "@cinematic/schemas";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { join } from "node:path";
import { z } from "zod";

import type { CloneApiClient } from "../api-client.js";
import type { McpConfig } from "../config.js";
import { summarize } from "../report.js";
import { describeSchema } from "../schema-guide.js";
import { errorResult, jsonResult, run, slugArg } from "./shared.js";

const EXPORT_FORMATS = ["next", "static"] as const;
type ExportFormat = (typeof EXPORT_FORMATS)[number];

export function registerExportTools(
  server: McpServer,
  client: CloneApiClient,
  config: McpConfig,
): void {
  server.registerTool(
    "export_clone",
    {
      title: "Export clone zip",
      description:
        "Build the deployable zip for a clone and write it to disk (MCP cannot stream binaries). Prerequisites must all pass first; the tool reports what is blocking instead of failing opaquely.",
      inputSchema: {
        slug: slugArg,
        format: z
          .enum(EXPORT_FORMATS)
          .default("next")
          .describe("next: standalone Next.js project. static: phase 2, not implemented."),
        outputDir: z
          .string()
          .min(1)
          .optional()
          .describe("Absolute directory for the zip; defaults to CLONE_EXPORT_DIR."),
        filename: z.string().min(1).optional().describe("Defaults to <slug>-site.zip."),
      },
    },
    async ({ slug, format, outputDir, filename }) =>
      run(async () => {
        const unsupported = unsupportedFormat(format);
        if (unsupported) {
          return errorResult(unsupported);
        }

        const report = await client.prerequisites(slug);
        if (!report.ready) {
          return errorResult(
            `Clone "${slug}" is not ready to export — complete its prerequisites first.`,
            summarize(report.items),
          );
        }

        const destination = join(outputDir ?? config.exportDir, filename ?? `${slug}-site.zip`);
        const bytes = await client.exportToFile(slug, format, destination);

        return jsonResult({ slug, format, path: destination, bytes });
      }),
  );

  server.registerTool(
    "describe_clone_schema",
    {
      title: "Describe the clone schema",
      description:
        "Field-level map of CloneConfig: identity, theme tokens, every section's fields, which prerequisite each feeds, and which customer-brief group writes it. Call this before composing a brief or a section patch.",
      inputSchema: {
        section: z.enum(SECTION_KEYS).optional().describe("Restrict the answer to one section."),
      },
    },
    async ({ section }) => run(async () => jsonResult(describeSchema(section))),
  );
}

function unsupportedFormat(format: ExportFormat): string | undefined {
  switch (format) {
    case "next":
      return undefined;
    case "static":
      return 'Export format "static" is a phase-2 feature and the API returns 501 — use "next".';
    default: {
      const unhandled: never = format;
      throw new Error(`Unhandled export format: ${String(unhandled)}`);
    }
  }
}
