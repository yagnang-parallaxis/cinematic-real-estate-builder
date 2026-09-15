import { SECTION_KEYS, type CloneConfig } from "@cinematic/schemas";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { applyBrief, customerBriefSchema } from "../brief.js";
import type { CloneApiClient } from "../api-client.js";
import { previewUrls, type McpConfig } from "../config.js";
import { changedPaths, deepMerge, getPath, isPlainObject, upsertBy } from "../patch.js";
import { checklist, summarize, summarizeConfig } from "../report.js";
import {
  applyMode,
  errorResult,
  jsonResult,
  mergeModeSchema,
  run,
  slugArg,
  slugify,
} from "./shared.js";

const sectionKeySchema = z.enum(SECTION_KEYS);

/** Field names per section instead of the payloads: the full config is ~70 KB. */
function overview(config: CloneConfig): Record<string, unknown> {
  const sections = config.sections as Record<string, unknown>;

  return {
    identity: config.identity,
    theme: config.theme,
    sectionVisibility: config.sectionVisibility ?? {},
    sections: Object.fromEntries(
      SECTION_KEYS.map((key) => {
        const payload = sections[key];
        return [key, isPlainObject(payload) ? Object.keys(payload) : typeof payload];
      }),
    ),
    residences: {
      count: config.residences.items.length,
      slugs: config.residences.items.map((item) => (isPlainObject(item) ? item.slug : undefined)),
    },
  };
}

export function registerCloneTools(
  server: McpServer,
  client: CloneApiClient,
  config: McpConfig,
): void {
  server.registerTool(
    "get_api_status",
    {
      title: "Clone API status",
      description:
        "Check that the clone API is reachable and report the URLs this MCP server talks to. Call this first if any other tool fails to connect.",
      inputSchema: {},
    },
    async () =>
      run(async () => {
        const health = await client.health();
        return jsonResult({
          reachable: true,
          health,
          apiUrl: config.apiUrl,
          webUrl: config.webUrl,
          builderUrl: config.builderUrl,
          exportDir: config.exportDir,
        });
      }),
  );

  server.registerTool(
    "list_clones",
    {
      title: "List clones",
      description:
        "List every clone with its prerequisite completion count, readiness for export, and preview URLs.",
      inputSchema: {},
    },
    async () =>
      run(async () => {
        const clones = await client.list();
        return jsonResult({
          count: clones.length,
          clones: clones.map((clone) => ({
            ...clone.meta,
            prerequisites: clone.prerequisites,
            urls: previewUrls(config, clone.meta.slug),
          })),
        });
      }),
  );

  server.registerTool(
    "get_clone",
    {
      title: "Get clone config",
      description:
        'Read a clone. Returns a compact overview by default; pass `select` for specific dotted paths (e.g. "sections.hero", "residences.items.0") or `full: true` for the entire config (large).',
      inputSchema: {
        slug: slugArg,
        select: z
          .array(z.string().min(1))
          .optional()
          .describe("Dotted config paths to return verbatim."),
        full: z.boolean().default(false).describe("Return the complete config JSON."),
      },
    },
    async ({ slug, select, full }) =>
      run(async () => {
        const { meta, config: clone } = await client.get(slug);

        if (select && select.length > 0) {
          return jsonResult({
            meta,
            /* null rather than undefined, so a missing path survives JSON. */
            selected: Object.fromEntries(
              select.map((path) => [path, getPath(clone, path) ?? null]),
            ),
          });
        }

        return jsonResult({
          meta,
          urls: previewUrls(config, slug),
          prerequisites: summarizeConfig(clone),
          ...(full ? { config: clone } : { overview: overview(clone) }),
        });
      }),
  );

  server.registerTool(
    "create_clone",
    {
      title: "Create clone",
      description:
        "Create a clone from the Aurelia template (full seed content) or blank (same keys, required fields emptied). Optionally apply a customer brief in the same call.",
      inputSchema: {
        name: z.string().min(1).describe('Human-readable project name, e.g. "Marina Heights".'),
        slug: z
          .string()
          .min(1)
          .optional()
          .describe("Kebab-case slug; derived from the name when omitted."),
        template: z
          .enum(["aurelia", "blank"])
          .default("aurelia")
          .describe("aurelia keeps the seed copy/media as a starting point; blank clears it."),
        brand: z.string().min(1).optional(),
        place: z.string().min(1).optional(),
        brief: customerBriefSchema
          .optional()
          .describe("Applied immediately after creation, same shape as apply_customer_brief."),
      },
    },
    async ({ name, slug, template, brand, place, brief }) =>
      run(async () => {
        const resolvedSlug = slug ?? slugify(name);
        if (resolvedSlug.length === 0) {
          return errorResult(`Could not derive a slug from "${name}" — pass \`slug\` explicitly.`);
        }

        const created = await client.create({ name, slug: resolvedSlug, template, brand, place });
        const record = brief
          ? await client.put(resolvedSlug, applyBrief(created.config, brief))
          : created;

        return jsonResult({
          created: record.meta,
          briefApplied: Boolean(brief),
          urls: previewUrls(config, resolvedSlug),
          prerequisites: summarizeConfig(record.config),
        });
      }),
  );

  server.registerTool(
    "update_clone_config",
    {
      title: "Update clone config",
      description:
        "Deep-merge a partial config into a clone (arrays replace wholesale), or replace the whole config. Validated by the API's Zod schema before it is written.",
      inputSchema: {
        slug: slugArg,
        patch: z
          .record(z.unknown())
          .describe('Partial CloneConfig, e.g. { theme: { primary: "#b45309" } }.'),
        mode: mergeModeSchema,
        dryRun: z
          .boolean()
          .default(false)
          .describe("Report the resulting changes and prerequisites without writing."),
      },
    },
    async ({ slug, patch, mode, dryRun }) =>
      run(async () => {
        const { config: current } = await client.get(slug);
        const next = applyMode(current, patch, mode, deepMerge);
        const changed = changedPaths(current, next);

        if (dryRun) {
          return jsonResult({
            dryRun: true,
            changed,
            prerequisites: summarizeConfig(next),
          });
        }

        const saved = await client.put(slug, next);
        return jsonResult({
          updatedAt: saved.meta.updatedAt,
          changed,
          prerequisites: summarizeConfig(saved.config),
        });
      }),
  );

  server.registerTool(
    "set_section_content",
    {
      title: "Set section content",
      description:
        "Write one section's content. Use describe_clone_schema to see the fields a section accepts.",
      inputSchema: {
        slug: slugArg,
        section: sectionKeySchema,
        content: z.record(z.unknown()).describe("Section fields to write."),
        mode: mergeModeSchema,
      },
    },
    async ({ slug, section, content, mode }) =>
      run(async () => {
        const { config: current } = await client.get(slug);
        const sections = current.sections as Record<string, unknown>;
        /* Assigned rather than deep-merged, so `replace` really replaces. */
        const next: CloneConfig = {
          ...current,
          sections: {
            ...current.sections,
            [section]: applyMode(sections[section], content, mode, deepMerge),
          },
        };

        const saved = await client.put(slug, next);
        return jsonResult({
          section,
          updatedAt: saved.meta.updatedAt,
          changed: changedPaths(current, saved.config),
          prerequisites: summarizeConfig(saved.config),
        });
      }),
  );

  server.registerTool(
    "set_section_visibility",
    {
      title: "Set section visibility",
      description:
        "Show or hide a section. Hidden sections keep their content but are skipped when rendering and exporting.",
      inputSchema: {
        slug: slugArg,
        section: sectionKeySchema,
        visible: z.boolean(),
      },
    },
    async ({ slug, section, visible }) =>
      run(async () => {
        const { config: current } = await client.get(slug);
        const saved = await client.put(
          slug,
          deepMerge(current, { sectionVisibility: { [section]: visible } }),
        );

        return jsonResult({
          section,
          visible,
          sectionVisibility: saved.config.sectionVisibility ?? {},
          updatedAt: saved.meta.updatedAt,
        });
      }),
  );

  server.registerTool(
    "upsert_residence",
    {
      title: "Upsert residence",
      description:
        "Add or update one residence in residences.items, matched by its slug. Requires name, slug and status to satisfy the residences prerequisite.",
      inputSchema: {
        slug: slugArg,
        residence: z
          .object({ slug: z.string().min(1) })
          .passthrough()
          .describe("Residence record; `slug` identifies the entry to upsert."),
        mode: mergeModeSchema,
      },
    },
    async ({ slug, residence, mode }) =>
      run(async () => {
        const { config: current } = await client.get(slug);
        const items = upsertBy(current.residences.items, "slug", residence, mode === "merge");
        const saved = await client.put(slug, deepMerge(current, { residences: { items } }));

        return jsonResult({
          residence: residence.slug,
          count: saved.config.residences.items.length,
          updatedAt: saved.meta.updatedAt,
          prerequisites: summarizeConfig(saved.config),
        });
      }),
  );

  server.registerTool(
    "check_prerequisites",
    {
      title: "Check prerequisites",
      description:
        "Full prerequisite checklist for a clone, plus what is still blocking export and how to fix each item.",
      inputSchema: { slug: slugArg },
    },
    async ({ slug }) =>
      run(async () => {
        const report = await client.prerequisites(slug);
        return jsonResult({
          slug,
          ...summarize(report.items),
          checklist: checklist(report.items),
        });
      }),
  );
}
