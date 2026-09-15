import "server-only";

import { applyThemeToCssVars, cloneConfigSchema, type CloneConfig } from "@cinematic/schemas";
import { access, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import type { CSSProperties } from "react";

import { env } from "../env";
import { buildDefaultClone } from "./default-clone";

export const DEFAULT_CLONE_SLUG = "aurelia";

/** Query values arrive as `string | string[] | undefined`; take the first one. */
function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function resolveCloneSlug(value?: string | string[]): string {
  const slug = firstParam(value)?.trim();
  return slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : DEFAULT_CLONE_SLUG;
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * The clone store lives at the monorepo root, which is neither the app cwd in
 * dev nor a fixed number of levels up once Next has moved the build output.
 */
async function findWorkspaceRoot(): Promise<string | undefined> {
  let current = resolve(process.cwd());

  for (;;) {
    if (await exists(join(current, "pnpm-workspace.yaml"))) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) {
      return undefined;
    }
    current = parent;
  }
}

async function fromApi(slug: string): Promise<CloneConfig | undefined> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/clones/${slug}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return undefined;
    }
    const body = (await response.json()) as { config?: unknown };
    const parsed = cloneConfigSchema.safeParse(body.config);
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

async function fromDisk(slug: string): Promise<CloneConfig | undefined> {
  const root = await findWorkspaceRoot();
  if (!root) {
    return undefined;
  }

  try {
    const raw = await readFile(join(root, "data", "clones", slug, "config.json"), "utf8");
    const parsed = cloneConfigSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Resolve a clone: the API first (so the builder's saves show up), then the
 * clone store on disk, then the Aurelia template compiled into the app.
 */
export async function getCloneConfig(slug?: string): Promise<CloneConfig> {
  const resolved = resolveCloneSlug(slug);

  return (await fromApi(resolved)) ?? (await fromDisk(resolved)) ?? buildDefaultClone();
}

/** Theme tokens as an inline `style`, so the server paint already has them. */
export function applyThemeStyle(theme: CloneConfig["theme"]): CSSProperties {
  return applyThemeToCssVars(theme) as CSSProperties;
}
