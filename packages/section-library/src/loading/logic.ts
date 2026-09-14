import type { LoadingContent } from "./types";

/** Fired as the loader starts to leave, so the hero lockup can enter with it. */
export const OPEN_EVENT = "cinematic:open";

/** Below this the composition cannot be read; above it the hold is a wait. */
export const MIN_HOLD_MS = 600;
export const MAX_HOLD_MS = 6000;
export const DEFAULT_HOLD_MS = 2000;

/**
 * How long the loader holds before it leaves. Clamped, because the hold is
 * also the duration the progress rule is animated over: an unset or absurd
 * value would otherwise show a rule that never moves, or never arrives.
 */
export function clampHoldMs(maxDurationMs?: number): number {
  if (maxDurationMs === undefined || !Number.isFinite(maxDurationMs)) {
    return DEFAULT_HOLD_MS;
  }

  return Math.min(MAX_HOLD_MS, Math.max(MIN_HOLD_MS, Math.round(maxDurationMs)));
}

/**
 * The wordmark, one entry per line, so each line can unmask in its own turn.
 * Falls back to the brand when no wordmark is authored.
 */
export function wordmarkLines(content: Pick<LoadingContent, "brand" | "wordmark">): string[] {
  const authored = (content.wordmark ?? []).map((line) => line.trim()).filter(Boolean);
  if (authored.length > 0) {
    return authored;
  }

  const brand = content.brand.trim();
  return brand ? [brand] : [];
}

/** The tagline, one entry per authored line, with blank lines dropped. */
export function taglineLines(tagline?: string): string[] {
  if (!tagline) {
    return [];
  }

  return tagline
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
