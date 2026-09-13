import type { StoryBeat } from "./types";

/** How long each plate holds before the carousel steps on, in milliseconds. */
export const STORY_AUTO_MS = 4500;

/** Outgoing title word fade, then a beat before the incoming title starts. */
export const STORY_TITLE_OUT_MS = 560;
export const STORY_TITLE_OUT_STAGGER_MS = 55;
export const STORY_TITLE_HANDOFF_MS = 100;

export function titleWords(title: string): string[] {
  return title.trim().split(/\s+/).filter(Boolean);
}

/** Time until the last outgoing word has finished leaving. */
export function titleOutDuration(title: string): number {
  const n = Math.max(titleWords(title).length, 1);
  return STORY_TITLE_OUT_MS + (n - 1) * STORY_TITLE_OUT_STAGGER_MS;
}

/** Delay before the incoming title begins, so it waits for the outgoing run. */
export function titleEnterDelay(outgoingTitle: string | null): number {
  if (!outgoingTitle) {
    return 0;
  }

  return titleOutDuration(outgoingTitle) + STORY_TITLE_HANDOFF_MS;
}

export function canAutoAdvance({
  inView,
  reducedMotion,
  count,
}: {
  inView: boolean;
  reducedMotion: boolean;
  count: number;
}): boolean {
  return inView && !reducedMotion && count > 1;
}

export function clampBeats(beats: StoryBeat[], max = 8): StoryBeat[] {
  return beats.slice(0, max);
}

export function wrapIndex(index: number, length: number): number {
  if (length <= 0) {
    return 0;
  }

  return ((index % length) + length) % length;
}

export function nextIndex(index: number, length: number): number {
  return wrapIndex(index + 1, length);
}

export function prevIndex(index: number, length: number): number {
  return wrapIndex(index - 1, length);
}

export function formatSlideLabel(index: number): string {
  return String(index).padStart(2, "0");
}

/** One-based slide number, as shown on the boutique pager. */
export function formatBeatNumber(index: number): string {
  return String(index + 1);
}

export function slideProgress(index: number, length: number): number {
  if (length <= 0) {
    return 0;
  }

  return ((index + 1) / length) * 100;
}

export function swipeStep(deltaX: number, threshold = 48): -1 | 0 | 1 {
  if (deltaX <= -threshold) {
    return 1;
  }

  if (deltaX >= threshold) {
    return -1;
  }

  return 0;
}
