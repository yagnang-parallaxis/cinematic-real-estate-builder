import type { HeroContent, HeroHotspot, HeroVariant } from "./types";

export function resolveHeroMedia(content: HeroContent, variant: HeroVariant) {
  if (variant === "night" && content.nightImageSrc) {
    return {
      src: content.nightImageSrc,
      alt: content.nightImageAlt ?? content.imageAlt,
    };
  }

  return { src: content.imageSrc, alt: content.imageAlt };
}

export function clampHotspots(hotspots: HeroHotspot[] = []): HeroHotspot[] {
  return hotspots.slice(0, 4);
}

/** Glyphs of one lockup line, so the second word can arrive letter by letter. */
export function lockupChars(line: string): string[] {
  return Array.from(line);
}

/**
 * How far the brand lockup and sentence have left — 0 at the top of the page,
 * 1 after a short first-viewport travel. Scroll back reverses the same curve.
 */
export function brandLeaveProgress(scrollY: number, viewH: number): number {
  const travel = Math.max(1, viewH * 0.38);
  const t = Math.min(1, Math.max(0, scrollY / travel));
  return t * t * (3 - 2 * t);
}

export function magneticOffset(
  clientX: number,
  clientY: number,
  rect: Pick<DOMRect, "left" | "top" | "width" | "height">,
  strength = 0.22,
  max = 14,
) {
  const x = (clientX - (rect.left + rect.width / 2)) * strength;
  const y = (clientY - (rect.top + rect.height / 2)) * strength;
  const distance = Math.hypot(x, y);

  if (distance <= max || distance === 0) {
    return { x, y };
  }

  const scale = max / distance;
  return { x: x * scale, y: y * scale };
}
