/**
 * Geometry for the arch transition — Era-style.
 *
 * The arch is always a slice of a full-stage-width circle (radius = half the
 * stage width). Progress raises how much of that circle is visible:
 *
 * Phase 1: a shallow padded bump grows into a full semicircle.
 * Phase 2: the semicircle stays on top while the panel extends upward with
 * straight sides until the photograph is covered.
 *
 * Lettering rides the top curve in both phases.
 */

/**
 * Starting visible height of the circle slice, as a fraction of stage height.
 * Tuned so the first peek reads ~45% of the stage width with clear side padding
 * (Era’s opening bump), not a tiny centred bubble.
 */
export const ARCH_H_FROM = 0.09;

/** Ending panel height, as a fraction of the stage height (slight overshoot). */
export const ARCH_H_TO = 1.06;

/** Ease on height growth — assertive early rise, soft settle at the end. */
export const ARCH_H_EASE = 0.88;

/**
 * Where the composition sits when it is not scroll-driven — on compact
 * screens and under reduced motion.
 */
export const ARCH_STATIC_PROGRESS = 0.48;

/** How much of the scroll range the dome takes to grow, in viewport heights. */
export const ARCH_SCROLL_VH = 260;

export interface ArchStage {
  width: number;
  height: number;
}

export interface ArchGeometry {
  /** Centre of the arch on the stage's x axis. */
  cx: number;
  /** The line the panel springs from: the bottom of the stage. */
  floorY: number;
  /** Radius of the full-width circle the slice is cut from. */
  rx: number;
  /** Same as `rx` — true circle. */
  ry: number;
  /** Visible panel height measured up from the floor. */
  height: number;
  /**
   * True once the panel is taller than a semicircle and has grown straight
   * sides under a full-width curved top.
   */
  extended: boolean;
}

export function clampProgress(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/**
 * How far through its own pinned range the section has scrolled, from its
 * bounding rect. A section no taller than the viewport has no range to scrub,
 * so it reports either end rather than dividing by zero.
 */
export function pinProgress(rect: { top: number; height: number }, viewportHeight: number): number {
  const range = rect.height - viewportHeight;
  if (range <= 0) {
    return rect.top <= 0 ? 1 : 0;
  }
  return clampProgress(-rect.top / range);
}

/** Radius of the full-bleed circle: half the stage width. */
export function archFullRadius(stage: ArchStage): number {
  return Math.max(1, stage.width / 2);
}

/**
 * Half-width of a circular segment of radius `radius` and visible height `height`.
 * This is what keeps side padding on the early bump.
 */
export function archSegmentHalfWidth(radius: number, height: number): number {
  const r = Math.max(1, radius);
  const h = Math.min(Math.max(0, height), r);
  return Math.sqrt(Math.max(0, 2 * r * h - h * h));
}

export function archGeometry(progress: number, stage: ArchStage): ArchGeometry {
  const t = clampProgress(progress);
  const eased = t === 0 || t === 1 ? t : Math.pow(t, ARCH_H_EASE);
  const fullR = archFullRadius(stage);
  const hFrom = Math.max(1, stage.height * ARCH_H_FROM);
  const hTo = Math.max(hFrom + 1, stage.height * ARCH_H_TO);
  const height = lerp(hFrom, hTo, eased);
  const cx = stage.width / 2;
  const floorY = stage.height;

  /*
   * Radius stays locked to half the stage width for the whole rise — early
   * frames are a padded slice of that circle, not a tiny growing bubble.
   */
  if (height <= fullR) {
    return { cx, floorY, rx: fullR, ry: fullR, height, extended: false };
  }

  return { cx, floorY, rx: fullR, ry: fullR, height, extended: true };
}

/** The filled arch panel. */
export function archPath(geometry: ArchGeometry): string {
  const { cx, floorY, rx, ry, height, extended } = geometry;

  if (!extended) {
    const halfW = archSegmentHalfWidth(rx, height);
    return `M ${round(cx - halfW)} ${round(floorY)} A ${round(rx)} ${round(ry)} 0 0 1 ${round(cx + halfW)} ${round(floorY)} Z`;
  }

  const top = floorY - height;
  const shoulderY = top + ry;
  const left = cx - rx;
  const right = cx + rx;
  return [
    `M ${round(left)} ${round(shoulderY)}`,
    `A ${round(rx)} ${round(ry)} 0 0 1 ${round(right)} ${round(shoulderY)}`,
    `L ${round(right)} ${round(floorY)}`,
    `L ${round(left)} ${round(floorY)}`,
    "Z",
  ].join(" ");
}

/**
 * How far inside the dome's edge the lettering path sits.
 * A modest margin — close to the rim like Era, still clearly on the blue.
 */
export function archTextInset(geometry: ArchGeometry, stage: ArchStage): number {
  return Math.max(
    40,
    Math.min(stage.height * 0.1, geometry.height * 0.28, geometry.ry * 0.16),
  );
}

/**
 * The arc the lettering runs along — a concentric inset of the panel curve.
 * `progress` widens the angular span so words can spread as the arch grows.
 */
export function archTextPath(
  geometry: ArchGeometry,
  inset: number,
  progress = ARCH_STATIC_PROGRESS,
): string {
  const { cx, floorY, height } = geometry;
  const textR = Math.max(1, geometry.rx - inset);
  /*
   * Same centre as the visible circle slice: the apex sits `height` above the
   * floor on the outer radius, so the centre is `rx` below the apex.
   */
  const centerY = floorY - height + geometry.rx;
  const beta = archTextArcSpan(progress);
  const leftX = cx - textR * Math.sin(beta);
  const rightX = cx + textR * Math.sin(beta);
  const y = centerY - textR * Math.cos(beta);
  return `M ${round(leftX)} ${round(y)} A ${round(textR)} ${round(textR)} 0 0 1 ${round(rightX)} ${round(y)}`;
}

/**
 * Angular half-span of the lettering arc from the apex. Grows with progress so
 * the path lengthens as word spacing opens up.
 */
export function archTextArcSpan(progress: number): number {
  return lerp(0.68, 1.18, clampProgress(progress));
}

/**
 * Extra space between words on the curve, in `em`. Scales with scroll progress
 * and the content multiplier — raise `amount` to spread words further.
 */
export function curvedWordSpacingEm(progress: number, amount = 1): number {
  const t = clampProgress(progress);
  const eased = t * t * (3 - 2 * t);
  return Math.max(0, (0.04 + eased * 0.78) * Math.max(0, amount));
}

/**
 * Where the interior content starts, measured from the top of the stage.
 */
export function archInteriorTop(
  geometry: ArchGeometry,
  inset: number,
  stageHeight: number,
): number {
  const apexY = geometry.floorY - geometry.height;
  const clearsLettering = apexY + inset * 2.4;
  return Math.max(clearsLettering, stageHeight * 0.36);
}

/** Lettering arrives once the bump is large enough to carry it. */
export function curvedTextOpacity(progress: number): number {
  return ramp(progress, 0.08, 0.28);
}

/** Mark, rule and tagline arrive once the panel is past a semicircle. */
export function interiorOpacity(progress: number): number {
  return ramp(progress, 0.42, 0.68);
}

/** Soft plate closes the top corners once the arch doorway fills the stage. */
export function capOpacity(progress: number): number {
  return ramp(progress, 0.82, 0.97);
}

/** True once the panel has taken the stage. */
export function coversStage(progress: number): boolean {
  return clampProgress(progress) >= 0.92;
}

function ramp(value: number, start: number, end: number): number {
  if (end <= start) {
    return clampProgress(value) >= end ? 1 : 0;
  }
  return clampProgress((clampProgress(value) - start) / (end - start));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
