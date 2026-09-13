import type { StoryBeat } from "./types";

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
