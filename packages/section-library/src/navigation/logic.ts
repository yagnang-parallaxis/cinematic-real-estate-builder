import type { NavigationContent, NavigationLink, NavTone } from "./types";

/**
 * Chrome contrast is sampled from `data-nav-tone` on scroll and resize. A
 * section that re-tones in place — the hero's day/night swap — has neither, so
 * it announces the change instead.
 */
export const NAV_TONE_EVENT = "cinematic:nav-tone";

export function scrollProgress(scrollY: number, maxScroll: number): number {
  if (maxScroll <= 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, scrollY / maxScroll));
}

function sameLink(a: NavigationLink, b: NavigationLink) {
  return a.href === b.href && a.label === b.label;
}

export function overlayLinks(content: NavigationContent): NavigationLink[] {
  const home: NavigationLink = { label: "Home", href: content.homeHref };
  const rest = [content.primary, ...content.links, content.cta, content.contact].filter(
    (link): link is NavigationLink => Boolean(link),
  );

  return [home, ...rest.filter((link) => !sameLink(link, home))];
}

export function resolveNavTone(
  sections: { top: number; bottom: number; tone: NavTone }[],
  probeY: number,
): NavTone {
  const match = [...sections]
    .reverse()
    .find((section) => probeY >= section.top && probeY < section.bottom);

  return match?.tone ?? "on-dark";
}

export function resolveSectionIndex(
  sections: { top: number; bottom: number }[],
  probeY: number,
): number {
  const index = sections.findIndex((section) => probeY >= section.top && probeY < section.bottom);
  return index === -1 ? 1 : index + 1;
}

export function formatSectionIndex(index: number): string {
  return String(Math.max(1, index)).padStart(2, "0");
}

/** Clockwise idle, in degrees per second. */
export const SEAL_IDLE_DEG_PER_SEC = 26;

/** Extra degrees per second per pixel-per-second of scroll. */
export const SEAL_VELOCITY_GAIN = 0.14;

/** Cap on the scroll-driven boost so a flick cannot smear the type. */
export const SEAL_VELOCITY_MAX = 280;

/** Scroll speed that counts as a direction change, in px/s. */
export const SEAL_DIRECTION_THRESHOLD = 24;

/** +1 clockwise (right), −1 counter-clockwise (left). */
export type SealDirection = 1 | -1;

export function sealDirectionFromVelocity(
  velocityPxPerSec: number,
  current: SealDirection,
  threshold = SEAL_DIRECTION_THRESHOLD,
): SealDirection {
  if (!Number.isFinite(velocityPxPerSec)) {
    return current;
  }

  if (velocityPxPerSec > threshold) {
    return 1;
  }

  if (velocityPxPerSec < -threshold) {
    return -1;
  }

  return current;
}

/**
 * Instantaneous spin rate. Idle holds a constant turn in the last direction.
 * While the page is moving, scroll speed adds to that turn — faster down,
 * faster right; faster up, faster left.
 */
export function sealSpinRate(
  velocityPxPerSec: number,
  direction: SealDirection,
  idle = SEAL_IDLE_DEG_PER_SEC,
  gain = SEAL_VELOCITY_GAIN,
  max = SEAL_VELOCITY_MAX,
  threshold = SEAL_DIRECTION_THRESHOLD,
): number {
  const hold = direction * idle;
  const speed = Number.isFinite(velocityPxPerSec) ? velocityPxPerSec : 0;

  if (Math.abs(speed) < threshold) {
    return hold;
  }

  const boost = Math.max(-max, Math.min(max, speed * gain));
  const driven = hold + boost;
  /* Never stall mid-scroll — keep at least the idle in the live direction. */
  if (Math.sign(driven) !== 0 && Math.sign(driven) !== direction) {
    return hold;
  }

  return Math.abs(driven) < idle ? hold : driven;
}

export function stepSealAngle(angle: number, rateDegPerSec: number, dtMs: number): number {
  if (!Number.isFinite(angle) || !Number.isFinite(rateDegPerSec) || !Number.isFinite(dtMs)) {
    return Number.isFinite(angle) ? angle : 0;
  }

  return angle + rateDegPerSec * (Math.max(0, dtMs) / 1000);
}

/**
 * Two passes around the ring so the name reads continuously, Era-style.
 */
export function sealRingText(label: string): string {
  const cleaned = label.replace(/\s+/g, " ").trim().toUpperCase();
  if (!cleaned) {
    return "";
  }

  return `${cleaned}  ·  ${cleaned}  ·  `;
}

export function readSectionTones(
  root: ParentNode = document,
): { top: number; bottom: number; tone: NavTone; scrim: boolean }[] {
  return [...root.querySelectorAll<HTMLElement>("[data-nav-tone]")].map((node) => {
    const rect = node.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      bottom: rect.bottom + window.scrollY,
      tone: (node.dataset.navTone as NavTone) || "on-dark",
      scrim: node.hasAttribute("data-nav-scrim"),
    };
  });
}

export function resolveNavChrome(
  sections: { top: number; bottom: number; tone: NavTone; scrim?: boolean }[],
  probeY: number,
): { tone: NavTone; scrim: boolean } {
  const match = [...sections]
    .reverse()
    .find((section) => probeY >= section.top && probeY < section.bottom);

  return {
    tone: match?.tone ?? "on-dark",
    scrim: Boolean(match?.scrim),
  };
}
