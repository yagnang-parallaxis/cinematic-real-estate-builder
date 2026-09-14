import type {
  ConceptFloral,
  ConceptFloralAccent,
  ConceptFloralPanel,
  ConceptFloralPlace,
} from "./types";

/**
 * Scroll math for the pinned horizontal narrative. Everything here is pure so
 * the pin can be reasoned about — and tested — without a layout engine.
 */

/** Three authored seats. The bottom bush is mounted on the track seam, not
 *  inside a panel — otherwise the next slide paints over the overflowing half. */
export const CONCEPT_FLORAL_SLOTS = [
  { place: "intro-top-left", panel: "intro", corner: "top-left" },
  { place: "intro-bottom-right", panel: "seam", corner: "bottom-right" },
  { place: "route-top-right", panel: "route", corner: "top-right" },
] as const;

export interface PinFrame {
  /** Distance from the top of the document to the top of the scroll area. */
  areaTop: number;
  areaHeight: number;
  viewportHeight: number;
  scrollY: number;
}

export interface TrackMetrics {
  /** Full width of the sideways track. */
  trackWidth: number;
  /** Width of the pinned screen the track moves behind. */
  viewportWidth: number;
}

export type LabelPlacement = "above" | "below";
export type LabelAlign = "start" | "center" | "end";

export function clamp01(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

/**
 * Progress through the pinned range: 0 while the screen is still settling into
 * the top of the viewport, 1 once the area's bottom edge reaches it.
 */
export function pinProgress({ areaTop, areaHeight, viewportHeight, scrollY }: PinFrame): number {
  const range = areaHeight - viewportHeight;
  if (range <= 0) {
    return 0;
  }

  return clamp01((scrollY - areaTop) / range);
}

/** Negative pixel offset applied to the track for a given progress. */
export function trackTranslation(
  progress: number,
  { trackWidth, viewportWidth }: TrackMetrics,
): number {
  const distance = Math.max(0, trackWidth - viewportWidth);
  const shift = clamp01(progress) * distance;

  // Guard against -0, which reads as a negative offset in a transform string.
  return shift === 0 ? 0 : -shift;
}

/**
 * Panels are one screen wide, so the traverse has `panelCount - 1` stops and
 * the panel under the screen is the nearest stop rather than an even slice.
 */
export function activePanelIndex(progress: number, panelCount: number): number {
  const stops = panelCount - 1;
  if (stops <= 0) {
    return 0;
  }

  return Math.min(stops, Math.max(0, Math.round(clamp01(progress) * stops)));
}

/**
 * How far a single panel has travelled into place: 0 as it starts moving in
 * from the right, 1 once it sits on the screen. The first panel is already in
 * place at progress 0.
 */
export function panelEntryProgress(progress: number, panelCount: number, index: number): number {
  const stops = panelCount - 1;
  if (stops <= 0) {
    return 1;
  }

  const step = 1 / stops;
  const start = (index - 1) * step;

  return clamp01((clamp01(progress) - start) / step);
}

/**
 * Waypoints unveil one after another across `span` of the panel's entry, so the
 * labels arrive in step with the line drawing itself in.
 */
export function revealedWaypointCount(entry: number, total: number, span = 0.85): number {
  if (total <= 0) {
    return 0;
  }

  if (span <= 0) {
    return total;
  }

  return Math.min(total, Math.ceil((clamp01(entry) / span) * total));
}

/**
 * Height of the scroll area beyond the first viewport, in viewport heights.
 * Deliberately generous: this section is paced slower than the rest of the page.
 */
export function pinnedScrollSpan(panelCount: number, perPanel = 0.7, min = 1.5): number {
  if (panelCount <= 0) {
    return min;
  }

  return Math.max(min, panelCount * perPanel);
}

/**
 * Exponential smoothing step: moves `current` a fixed fraction of the way
 * toward `target` each frame. Used to trail the raw scroll position so the
 * pin's horizontal drift reads as inertial rather than snapping straight to
 * wherever the scrollbar is, and snaps once the gap is imperceptible so a
 * frame loop built on this never idles forever chasing a fraction of a pixel.
 */
export function smoothApproach(current: number, target: number, factor: number): number {
  if (factor >= 1) {
    return target;
  }

  if (factor <= 0) {
    return current;
  }

  const next = current + (target - current) * factor;
  return Math.abs(target - next) < 0.0004 ? target : next;
}

export function clampIndex(index: number, panelCount: number): number {
  if (panelCount <= 0) {
    return 0;
  }

  return Math.min(panelCount - 1, Math.max(0, index));
}

/** Active panel in the compact strip, read from its own horizontal scroll. */
export function stripIndex(scrollLeft: number, panelWidth: number, panelCount: number): number {
  if (panelWidth <= 0 || panelCount <= 0) {
    return 0;
  }

  return Math.min(panelCount - 1, Math.max(0, Math.round(scrollLeft / panelWidth)));
}

/** Waypoint labels alternate sides of the route so they never collide. */
export function labelPlacement(index: number): LabelPlacement {
  return index % 2 === 0 ? "above" : "below";
}

/** Labels near either end of the plot are aligned inward to stay inside it. */
export function labelAlign(x: number, extent: number, edge = 0.14): LabelAlign {
  if (extent <= 0) {
    return "center";
  }

  const ratio = x / extent;
  if (ratio <= edge) {
    return "start";
  }

  if (ratio >= 1 - edge) {
    return "end";
  }

  return "center";
}

/** Convert an SVG user-space coordinate to a percentage of the plot. */
export function toPercent(value: number, extent: number): number {
  if (extent <= 0) {
    return 0;
  }

  return (value / extent) * 100;
}

export function formatCount(value: number): string {
  return String(value).padStart(2, "0");
}

function floralSrc(floral: ConceptFloral | undefined, place: ConceptFloralPlace): string | undefined {
  if (!floral) {
    return undefined;
  }

  switch (place) {
    case "intro-top-left":
      return floral.introTopLeft;
    case "intro-bottom-right":
      return floral.introBottomRight;
    case "route-top-right":
      return floral.routeTopRight;
  }
}

/** Clips that belong on a given panel — never more than the three seats. */
export function floralAccentsForPanel(
  floral: ConceptFloral | undefined,
  panel: ConceptFloralPanel,
): ConceptFloralAccent[] {
  return CONCEPT_FLORAL_SLOTS.flatMap((slot) => {
    if (slot.panel !== panel) {
      return [];
    }

    const src = floralSrc(floral, slot.place);
    if (!src) {
      return [];
    }

    return [{ place: slot.place, corner: slot.corner, src }];
  });
}
