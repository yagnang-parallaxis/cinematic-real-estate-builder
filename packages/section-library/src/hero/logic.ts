import type { NavTone } from "../navigation/types";
import type {
  HeroBreakpoint,
  HeroContent,
  HeroFraming,
  HeroHotspot,
  HeroVariant,
} from "./types";

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
 * Whether the hero lockup may play its entrance.
 *
 * The boot plate fires `cinematic:open` as it lifts, which is the right moment
 * when nothing precedes the hero. With a curtain ahead of it that event is
 * still the plate leaving — the lockup has to wait until the arch is spent,
 * or it plays out of sight and the first screen arrives already finished.
 */
export function heroIntroReady(curtainOpening: boolean): boolean {
  return !curtainOpening;
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

const DEFAULT_FRAMING: Required<{
  subject: number;
  land: Record<HeroBreakpoint, number>;
  focus: Record<HeroBreakpoint, number>;
}> = {
  subject: 0.55,
  land: { desktop: 0.99, compact: 0.77 },
  focus: { desktop: 0.5, compact: 0.5 },
};

/** Below 1.2 viewports the three stations collide; above 2.2 the scroll drags. */
const RUNWAY_MIN_SVH = 120;
const RUNWAY_MAX_SVH = 220;

function fraction(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(1, Math.max(0, value));
}

/**
 * Height of the hero runway in svh, derived from where the subject sits in the
 * photograph and where it should land in the first viewport.
 *
 * The image fills the runway vertically, so the subject lands `subject ×
 * runway` from the top of the section. Solving that for the authored landing
 * point is what keeps a compact viewport off a screenful of empty sky, and it
 * re-frames on its own when a differently composed photograph is swapped in.
 */
export function heroRunwaySvh(framing: HeroFraming | undefined, breakpoint: HeroBreakpoint): number {
  const subject = fraction(framing?.subject, DEFAULT_FRAMING.subject);
  const land = fraction(framing?.land?.[breakpoint], DEFAULT_FRAMING.land[breakpoint]);

  if (subject === 0) {
    return RUNWAY_MAX_SVH;
  }

  return Math.round(Math.min(RUNWAY_MAX_SVH, Math.max(RUNWAY_MIN_SVH, (land / subject) * 100)));
}

/** Horizontal crop focus as an `object-position` percentage. */
export function heroFocusPercent(
  framing: HeroFraming | undefined,
  breakpoint: HeroBreakpoint,
): number {
  return Math.round(fraction(framing?.focus?.[breakpoint], DEFAULT_FRAMING.focus[breakpoint]) * 100);
}

/**
 * Chrome contrast for the light on the photograph. Daylight needs the scrim to
 * hold paper ink against a bright sky; after dark the frame supplies its own
 * contrast and the scrim only muddies the hairlines.
 */
export function heroNavTone(variant: HeroVariant): NavTone {
  switch (variant) {
    case "day":
      return "on-media";
    case "night":
      return "on-media-night";
    default: {
      const exhaustive: never = variant;
      return exhaustive;
    }
  }
}
