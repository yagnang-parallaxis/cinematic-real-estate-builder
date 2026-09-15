# @cinematic/clone-mcp

MCP server that lets an AI agent (Cursor, Claude Desktop, …) build and customise
cinematic real-estate site clones: create a clone, apply a customer brief, check
what the brief is still missing, and export the deployable zip.

Every tool calls the local Nest API (`apps/api`, `http://localhost:4000`), which
owns `data/clones/`. This server never touches those files directly, so the
builder UI at `:3001` and any agent always read and write the same state.

## Prerequisites

1. `pnpm install`
2. `pnpm dev` (or at least `pnpm --filter @cinematic/api dev`) so the API answers on `:4000`
3. `pnpm seed:clone` once, so the `aurelia` template exists — `create_clone` seeds from it
4. `pnpm mcp:clones:build` to compile this package (`dist/index.js` is the stdio entry point)

## Run it

```bash
pnpm mcp:clones          # stdio transport; stdout is the JSON-RPC stream
pnpm mcp:clones:smoke    # end-to-end check of all 13 tools against the live API
```

The smoke test creates a throwaway clone, exercises every tool including the zip
export, then deletes the clone (`--keep` to leave it in place).

## Register in Cursor

This repo ships a project-local `.cursor/mcp.json` already pointing at the
server, so opening the workspace and enabling **cinematic-clones** in Cursor's
MCP settings is enough:

```json
{
  "mcpServers": {
    "cinematic-clones": {
      "command": "pnpm",
      "args": ["mcp:clones"],
      "env": {
        "CLONE_API_URL": "http://localhost:4000",
        "CLONE_WEB_URL": "http://localhost:3000",
        "CLONE_BUILDER_URL": "http://localhost:3001"
      }
    }
  }
}
```

For a global entry in `~/.cursor/mcp.json`, or any client that does not start the
process in the repo root, use absolute paths:

```json
{
  "mcpServers": {
    "cinematic-clones": {
      "command": "node",
      "args": ["/absolute/path/to/cinematic-real-estate-builder/packages/clone-mcp/dist/index.js"],
      "env": {
        "CLONE_API_URL": "http://localhost:4000",
        "CLONE_WEB_URL": "http://localhost:3000",
        "CLONE_BUILDER_URL": "http://localhost:3001"
      }
    }
  }
}
```

Claude Desktop uses the same shape in `claude_desktop_config.json`.

### Environment

| Variable            | Default                            | Purpose                                     |
| ------------------- | ---------------------------------- | ------------------------------------------- |
| `CLONE_API_URL`     | `http://localhost:4000`            | Nest API this server calls                  |
| `CLONE_WEB_URL`     | `http://localhost:3000`            | Base URL for the preview links tools return |
| `CLONE_BUILDER_URL` | `http://localhost:3001`            | Base URL for builder links tools return     |
| `CLONE_EXPORT_DIR`  | `<tmpdir>/cinematic-clone-exports` | Where `export_clone` writes zips            |

Docker services (`pnpm docker:up`) are not required: the clone store is
file-backed in the MVP.

## Tools

| Tool                     | What it does                                                                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `get_api_status`         | Confirms the API is reachable and echoes the URLs in use. Start here when anything fails to connect.                             |
| `list_clones`            | Every clone with prerequisite counts, export readiness, and preview/builder URLs.                                                |
| `get_clone`              | Compact overview by default; `select` for dotted paths, `full: true` for the whole config (~70 KB).                              |
| `create_clone`           | New clone from `aurelia` (keeps seed copy/media) or `blank`. Accepts a `brief` to seed content in the same call.                 |
| `update_clone_config`    | Deep-merge a partial `CloneConfig` (arrays replace wholesale) or replace it outright. Supports `dryRun`.                         |
| `set_section_content`    | Write one section's content, merge or replace.                                                                                   |
| `set_section_visibility` | Show/hide a section; hidden sections keep their content.                                                                         |
| `upsert_residence`       | Add or update one residence in `residences.items`, matched on its slug.                                                          |
| `check_prerequisites`    | Full checklist plus what is blocking export and how to fix each item.                                                            |
| `apply_customer_brief`   | The one-call intake: identity, colours, per-section copy/media, contact details and residences. Supports `dryRun`.               |
| `evaluate_brief`         | Dry-runs a brief against an existing clone or a fresh template and reports which prerequisites remain. Writes nothing.           |
| `export_clone`           | Checks prerequisites, then writes `<slug>-site.zip` to disk and returns its path (MCP transports cannot carry binaries).         |
| `describe_clone_schema`  | Field-level map of `CloneConfig`: theme tokens, every section's fields, the prerequisite each feeds, the brief group writing it. |

### Customer brief shape

`apply_customer_brief` and `evaluate_brief` take one object with these groups:
`identity`, `colors`, `hero`, `story`, `vista`, `concept`, `location`,
`amenities`, `interiors`, `architecture`, `assurance`, `contact`, `footer`,
`residences[]`. Unknown keys are rejected rather than silently dropped, so call
`describe_clone_schema` first and fall back to `set_section_content` for fields
the brief does not model (navigation menus, `arch`, `residenceTypes`,
`residenceFigures`, `closingView`, `enquiry`).

Two groups do more than copy fields across:

- `identity` propagates `brand`, `place`, `tagline` and `wordmark` into the
  loading, navigation, hero, footer and enquiry sections.
- `contact` turns `email`, `phone` and `salesOffice` into `contact.channels`
  entries (`mailto:` / `tel:` / maps links) and mirrors the phone and address
  into the footer lead lines.

### Suggested agent flow

```
describe_clone_schema → evaluate_brief → create_clone (with brief)
  → apply_customer_brief / set_section_content / upsert_residence
  → check_prerequisites → export_clone
```

`evaluate_brief` is the cheap first move for a new customer: it reports which of
the 15 prerequisites the brief already satisfies without creating anything.
