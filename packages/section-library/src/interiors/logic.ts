import type { InteriorImage } from "./types";

/** One primary photograph plus a thumbnail row; past this the row stops reading as a row. */
export const MAX_INTERIOR_IMAGES = 8;

export const MIN_ROTATION_MS = 1600;
export const MAX_ROTATION_MS = 12000;
export const DEFAULT_ROTATION_MS = 2600;

export interface GallerySplit {
  primary: InteriorImage | null;
  secondary: InteriorImage[];
}

/** Normalise any integer into `0 .. length - 1`, wrapping at both ends. */
export function wrapIndex(index: number, length: number): number {
  if (length <= 0 || !Number.isFinite(index)) {
    return 0;
  }
  const whole = Math.trunc(index);
  return ((whole % length) + length) % length;
}

export function nextImageIndex(index: number, length: number): number {
  return wrapIndex(index + 1, length);
}

export function previousImageIndex(index: number, length: number): number {
  return wrapIndex(index - 1, length);
}

/** Lightbox counter, zero padded to the width of the total: `"03 / 07"`. */
export function formatCounter(index: number, length: number): string {
  if (length <= 0) {
    return "00 / 00";
  }
  const width = Math.max(2, String(length).length);
  const position = wrapIndex(index, length) + 1;
  return `${String(position).padStart(width, "0")} / ${String(length).padStart(width, "0")}`;
}

/** Advance the rotating headline word. A single word never rotates. */
export function cycleWordIndex(index: number, wordCount: number): number {
  if (wordCount <= 1) {
    return 0;
  }
  return wrapIndex(index + 1, wordCount);
}

export function clampRotationMs(rotationMs?: number): number {
  if (rotationMs === undefined || !Number.isFinite(rotationMs)) {
    return DEFAULT_ROTATION_MS;
  }
  return Math.min(MAX_ROTATION_MS, Math.max(MIN_ROTATION_MS, Math.round(rotationMs)));
}

/** Drop entries the gallery cannot render, collapse repeated ids, and cap the count. */
export function normaliseImages(
  images: InteriorImage[],
  max = MAX_INTERIOR_IMAGES,
): InteriorImage[] {
  const limit = Math.max(0, max);
  const seen = new Set<string>();
  const kept: InteriorImage[] = [];

  for (const image of images) {
    if (kept.length >= limit) {
      break;
    }
    if (!image.id.trim() || !image.src.trim() || seen.has(image.id)) {
      continue;
    }
    seen.add(image.id);
    kept.push(image);
  }

  return kept;
}

export function splitGallery(images: InteriorImage[]): GallerySplit {
  const [primary, ...secondary] = images;
  return { primary: primary ?? null, secondary };
}
