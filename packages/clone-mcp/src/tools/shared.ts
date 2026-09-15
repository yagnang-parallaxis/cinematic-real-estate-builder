import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { CloneApiError } from "../api-client.js";

export const MERGE_MODES = ["merge", "replace"] as const;
export type MergeMode = (typeof MERGE_MODES)[number];

export const mergeModeSchema = z
  .enum(MERGE_MODES)
  .default("merge")
  .describe(
    "merge: deep-merge (arrays replaced wholesale). replace: overwrite the target outright.",
  );

export const slugArg = z
  .string()
  .min(1)
  .describe('Clone slug, e.g. "aurelia" — the directory name under data/clones/.');

export function jsonResult(payload: unknown): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
}

export function errorResult(message: string, details?: unknown): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          details === undefined ? { error: message } : { error: message, details },
          null,
          2,
        ),
      },
    ],
    isError: true,
  };
}

/**
 * Tool handlers report failures as tool results rather than transport errors so
 * the model sees the API's Zod issues / prerequisite ids and can retry.
 */
export async function run(handler: () => Promise<CallToolResult>): Promise<CallToolResult> {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof CloneApiError) {
      return errorResult(error.message, { status: error.status, ...(error.details as object) });
    }
    return errorResult(error instanceof Error ? error.message : String(error));
  }
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function applyMode<T>(
  current: T,
  incoming: unknown,
  mode: MergeMode,
  merge: (a: T, b: unknown) => T,
): T {
  switch (mode) {
    case "merge":
      return merge(current, incoming);
    case "replace":
      return incoming as T;
    default: {
      const unhandled: never = mode;
      throw new Error(`Unhandled merge mode: ${String(unhandled)}`);
    }
  }
}
