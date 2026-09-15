/**
 * End-to-end smoke test: drives the stdio MCP server as a real MCP client
 * against a running API (apps/api on :4000), then removes the clone it created.
 *
 *   pnpm --filter @cinematic/clone-mcp smoke        # create, exercise, clean up
 *   pnpm --filter @cinematic/clone-mcp smoke --keep # leave the clone on disk
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const workspaceRoot = dirname(dirname(packageRoot));
const keep = process.argv.includes("--keep");
const slug = `smoke-mcp-${Date.now()}`;

let failures = 0;
let exportedZip;

function report(label, payload) {
  const preview = JSON.stringify(payload);
  console.log(`  ${label}: ${preview.length > 400 ? `${preview.slice(0, 400)}…` : preview}`);
}

async function step(client, name, args, expect) {
  const result = await client.callTool({ name, arguments: args });
  const text = result.content?.[0]?.text ?? "";
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = text;
  }

  if (result.isError) {
    failures += 1;
    console.log(`✗ ${name} returned an error`);
    report("error", payload);
    return payload;
  }

  const problem = expect?.(payload);
  if (problem) {
    failures += 1;
    console.log(`✗ ${name}: ${problem}`);
  } else {
    console.log(`✓ ${name}`);
  }
  report("result", payload);
  return payload;
}

const brief = {
  identity: {
    projectName: "Marina Heights",
    brand: "Marina",
    place: "Southbank",
    tagline: "Twelve residences on the water.",
  },
  colors: { paper: "#f6f1e7", ink: "#1d2530", primary: "#b45309", primaryForeground: "#1d1405" },
  contact: {
    email: "sales@marina.example",
    phone: "+1 (555) 020-0199",
    salesOffice: "9 Southbank Quay",
  },
  residences: [{ slug: "a1", name: "No. A1", status: "available", bedrooms: 2 }],
};

const client = new Client({ name: "clone-mcp-smoke", version: "0.0.0" });
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [join(packageRoot, "dist", "index.js")],
  env: { ...process.env },
  stderr: "inherit",
});

await client.connect(transport);

try {
  const { tools } = await client.listTools();
  console.log(`✓ tools/list → ${tools.length} tools: ${tools.map((tool) => tool.name).join(", ")}`);

  await step(client, "get_api_status", {}, (payload) =>
    payload.reachable === true ? undefined : "API not reachable",
  );
  await step(client, "describe_clone_schema", { section: "hero" }, (payload) =>
    Array.isArray(payload.fields) ? undefined : "missing hero fields",
  );
  await step(client, "list_clones", {}, (payload) =>
    typeof payload.count === "number" ? undefined : "missing count",
  );
  await step(client, "evaluate_brief", { brief, template: "blank" }, (payload) =>
    Array.isArray(payload.stillMissing) ? undefined : "missing stillMissing",
  );
  await step(client, "create_clone", { name: "Marina Heights", slug, brief }, (payload) =>
    payload.created?.slug === slug ? undefined : "clone not created",
  );
  await step(client, "get_clone", { slug, select: ["identity", "theme.primary"] }, (payload) =>
    payload.selected?.["theme.primary"] === "#b45309" ? undefined : "theme not applied",
  );
  await step(
    client,
    "set_section_content",
    { slug, section: "vista", content: { quote: "Set by the smoke test." } },
    (payload) => (payload.section === "vista" ? undefined : "section not written"),
  );
  await step(
    client,
    "set_section_content",
    { slug, section: "arch", content: { label: "only" }, mode: "replace" },
    (payload) => (payload.section === "arch" ? undefined : "replace not written"),
  );
  await step(client, "get_clone", { slug, select: ["sections.arch"] }, (payload) =>
    Object.keys(payload.selected["sections.arch"]).length === 1
      ? undefined
      : "replace mode did not replace the section",
  );
  await step(
    client,
    "set_section_visibility",
    { slug, section: "residenceTypes", visible: false },
    (payload) => (payload.visible === false ? undefined : "visibility not written"),
  );
  await step(
    client,
    "upsert_residence",
    { slug, residence: { slug: "a2", name: "No. A2", status: "reserved" } },
    (payload) => (payload.count >= 2 ? undefined : "residence not added"),
  );
  await step(
    client,
    "update_clone_config",
    { slug, patch: { theme: { primary: "#0f766e" } }, dryRun: true },
    (payload) =>
      payload.changed?.includes("theme.primary") ? undefined : "patch not reflected in changes",
  );
  await step(
    client,
    "apply_customer_brief",
    { slug, brief: { assurance: { heading: "Dry run only" } }, dryRun: true },
    (payload) => (payload.dryRun === true ? undefined : "dry run not honoured"),
  );
  await step(client, "check_prerequisites", { slug }, (payload) =>
    Array.isArray(payload.checklist) ? undefined : "missing checklist",
  );
  const exported = await step(client, "export_clone", { slug }, (payload) =>
    typeof payload.bytes === "number" && payload.bytes > 0 ? undefined : "zip not written",
  );
  exportedZip = typeof exported?.path === "string" ? exported.path : undefined;

  const invalid = await client.callTool({
    name: "apply_customer_brief",
    arguments: { slug, brief: { identity: { nope: 1 } } },
  });
  if (invalid.isError) {
    console.log("✓ apply_customer_brief rejects unknown brief keys");
  } else {
    failures += 1;
    console.log("✗ apply_customer_brief accepted an unknown brief key");
  }
} finally {
  await client.close();
  if (!keep) {
    await rm(join(workspaceRoot, "data", "clones", slug), { recursive: true, force: true });
    console.log(`· removed data/clones/${slug}`);
    if (exportedZip) {
      await rm(exportedZip, { force: true });
      console.log(`· removed ${exportedZip}`);
    }
  }
}

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
