# {{PROJECT_NAME}}

A cinematic real-estate site, exported from the Cinematic Builder.

This archive is the **content and assets** for the site, packaged so it drops
straight into the cinematic Next.js template.

## What is in here

| Path               | What it is                                                      |
| ------------------ | --------------------------------------------------------------- |
| `site.config.json` | The validated `CloneConfig` — identity, theme and all sections. |
| `public/`          | Every image, drawing and asset the config points at.            |
| `package.json`     | Dependency and script skeleton for the exported site.           |
| `README.md`        | This file.                                                      |

## Running it

1. Start from the cinematic Next.js template (the `apps/web` app and the
   `@cinematic/section-library`, `@cinematic/animation-engine` and
   `@cinematic/ui` packages).
2. Copy `site.config.json` to the template root and `public/` over the
   template's `public/`.
3. Install and run:

   ```bash
   pnpm install
   pnpm build
   pnpm start
   ```

The site reads `site.config.json` at request time, so editing the JSON and
restarting is enough — no code change is needed to re-brand the site.

## Theme

The palette lives under `theme` in `site.config.json` and is bound to CSS
variables (`--paper`, `--ink`, `--primary`, `--primary-foreground`, and the
optional `--paper-deep`, `--ink-deep`, `--tide`, `--shell`). Any valid CSS
colour works, including `oklch()`.

## Sections

`sections` holds one entry per section of the page, in render order. A section
can be hidden without losing its content by setting its key to `false` under
`sectionVisibility`.

## Deploying

Vercel: import the repository, keep the framework preset on Next.js, and deploy.
Any Node host works too — `pnpm build && pnpm start` serves on port 3000.
