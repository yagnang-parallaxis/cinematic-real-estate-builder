import {
  cloneConfigSchema,
  cloneMetaSchema,
  type CloneConfig,
  type CloneMeta,
} from "@cinematic/schemas";
import { Injectable } from "@nestjs/common";
import { existsSync } from "node:fs";
import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

/**
 * The clone store, the export template and the template's assets all live at
 * the monorepo root, which is not a fixed number of levels above the API's cwd
 * once it runs from `dist`. Walk up for the workspace marker instead.
 */
function findWorkspaceRoot(): string {
  let current = resolve(process.cwd());

  for (;;) {
    if (existsSync(join(current, "pnpm-workspace.yaml"))) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) {
      throw new Error("Could not find the monorepo root (no pnpm-workspace.yaml above cwd)");
    }
    current = parent;
  }
}

export const WORKSPACE_ROOT = findWorkspaceRoot();
export const DATA_ROOT = join(WORKSPACE_ROOT, "data", "clones");
export const EXPORT_TEMPLATE_ROOT = join(WORKSPACE_ROOT, "export-template");
export const WEB_PUBLIC_ROOT = join(WORKSPACE_ROOT, "apps", "web", "public");

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/** File-backed clone storage. One directory per clone, no database in the MVP. */
@Injectable()
export class ClonesStore {
  cloneDir(slug: string): string {
    return join(DATA_ROOT, slug);
  }

  assetsDir(slug: string): string {
    return join(this.cloneDir(slug), "assets");
  }

  async has(slug: string): Promise<boolean> {
    return exists(join(this.cloneDir(slug), "config.json"));
  }

  async listSlugs(): Promise<string[]> {
    if (!(await exists(DATA_ROOT))) {
      return [];
    }

    const entries = await readdir(DATA_ROOT, { withFileTypes: true });
    const slugs: string[] = [];

    for (const entry of entries) {
      if (entry.isDirectory() && isValidSlug(entry.name) && (await this.has(entry.name))) {
        slugs.push(entry.name);
      }
    }

    return slugs.sort();
  }

  async readMeta(slug: string): Promise<CloneMeta | undefined> {
    try {
      const raw = await readFile(join(this.cloneDir(slug), "meta.json"), "utf8");
      return cloneMetaSchema.parse(JSON.parse(raw));
    } catch {
      return undefined;
    }
  }

  async readConfig(slug: string): Promise<CloneConfig | undefined> {
    try {
      const raw = await readFile(join(this.cloneDir(slug), "config.json"), "utf8");
      return cloneConfigSchema.parse(JSON.parse(raw));
    } catch {
      return undefined;
    }
  }

  async write(slug: string, meta: CloneMeta, config: CloneConfig): Promise<void> {
    await mkdir(this.assetsDir(slug), { recursive: true });
    await writeFile(
      join(this.cloneDir(slug), "meta.json"),
      `${JSON.stringify(meta, null, 2)}\n`,
      "utf8",
    );
    await writeFile(
      join(this.cloneDir(slug), "config.json"),
      `${JSON.stringify(config, null, 2)}\n`,
      "utf8",
    );
  }

  async hasAssets(slug: string): Promise<boolean> {
    const dir = this.assetsDir(slug);
    if (!(await exists(dir))) {
      return false;
    }
    return (await readdir(dir)).length > 0;
  }
}
