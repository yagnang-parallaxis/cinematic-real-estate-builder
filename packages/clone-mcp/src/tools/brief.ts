import { blankCloneFrom, type CloneConfig } from "@cinematic/schemas";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { applyBrief, customerBriefSchema, type CustomerBrief } from "../brief.js";
import type { CloneApiClient } from "../api-client.js";
import { changedPaths } from "../patch.js";
import { summarizeConfig } from "../report.js";
import { jsonResult, run, slugArg } from "./shared.js";

const TEMPLATE_SLUG = "aurelia";

const templateSchema = z
  .enum(["aurelia", "blank"])
  .default("aurelia")
  .describe("Which starting point to evaluate against when `slug` is omitted.");

type Template = z.infer<typeof templateSchema>;

async function baseFor(
  client: CloneApiClient,
  slug: string | undefined,
  template: Template,
  brief: CustomerBrief,
): Promise<CloneConfig> {
  if (slug !== undefined) {
    return (await client.get(slug)).config;
  }

  const source = (await client.get(TEMPLATE_SLUG)).config;

  switch (template) {
    case "aurelia":
      return source;
    case "blank":
      return blankCloneFrom(source, {
        projectName: brief.identity?.projectName ?? "",
        brand: brief.identity?.brand ?? "",
        place: brief.identity?.place ?? "",
      });
    default: {
      const unhandled: never = template;
      throw new Error(`Unhandled template: ${String(unhandled)}`);
    }
  }
}

export function registerBriefTools(server: McpServer, client: CloneApiClient): void {
  server.registerTool(
    "apply_customer_brief",
    {
      title: "Apply customer brief",
      description:
        "Apply a structured customer brief (identity, colours, per-section copy and media, contact details, residences) to a clone in one call. Identity propagates to the loading, navigation, hero, footer and enquiry sections, and contact details are turned into contact channels plus footer lead lines.",
      inputSchema: {
        slug: slugArg,
        brief: customerBriefSchema.describe(
          "Unknown keys are rejected — use describe_clone_schema, then set_section_content for anything the brief does not cover.",
        ),
        dryRun: z.boolean().default(false).describe("Report what would change without writing."),
      },
    },
    async ({ slug, brief, dryRun }) =>
      run(async () => {
        const { config: current } = await client.get(slug);
        const next = applyBrief(current, brief);
        const changed = changedPaths(current, next);

        if (dryRun) {
          return jsonResult({
            dryRun: true,
            changed,
            prerequisitesBefore: summarizeConfig(current),
            prerequisitesAfter: summarizeConfig(next),
          });
        }

        const saved = await client.put(slug, next);
        return jsonResult({
          slug,
          updatedAt: saved.meta.updatedAt,
          changed,
          prerequisites: summarizeConfig(saved.config),
        });
      }),
  );

  server.registerTool(
    "evaluate_brief",
    {
      title: "Evaluate a brief against the prerequisites",
      description:
        "Dry-run a customer brief against an existing clone (`slug`) or a fresh template, and report which prerequisites it satisfies and which are still missing. Writes nothing.",
      inputSchema: {
        brief: customerBriefSchema,
        slug: slugArg.optional().describe("Evaluate against this existing clone."),
        template: templateSchema,
      },
    },
    async ({ brief, slug, template }) =>
      run(async () => {
        const base = await baseFor(client, slug, template, brief);
        const next = applyBrief(base, brief);
        const after = summarizeConfig(next);

        return jsonResult({
          basedOn: slug ?? `${template} template`,
          satisfies: `${after.complete}/${after.total} prerequisites`,
          readyToExport: after.ready,
          stillMissing: after.blocking,
          wouldChange: changedPaths(base, next),
        });
      }),
  );
}
