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
