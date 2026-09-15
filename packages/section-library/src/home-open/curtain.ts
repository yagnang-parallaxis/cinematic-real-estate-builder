import type { NavTone } from "../navigation/types";

/**
 * Geometry and pacing for the opening gate.
 *
 * The gate is a once-only preloader: a brand plate carrying the wordmark, with
 * an arch-shaped hole cut out of it. Time, not scroll, grows the hole from a
 * narrow doorway at the foot of the stage to full bleed. Behind it the hero
 * photograph is held at its first frame — so the wordmark screen and the
 * photograph are one move rather than an overlay lifting off a page that was
 * already composed. When the arch is spent the overlay unmounts and the visitor
 * is on the hero at the top of the page.
 *
 * Nothing here draws a second copy of the photograph. The plate is a hole, the
 * hero is what shows through it.
 */

/**
 * Pin distance the arch grows over, in svh.
 *
 * Two viewports on a pointer screen: the rise has to be slow enough to read as
 * a doorway opening rather than a wipe. Compact gets less, because the same
 * distance on a phone is a lot of thumb travel for one gesture.
 */
export const CURTAIN_RUN_SVH = 200;
export const CURTAIN_RUN_COMPACT_SVH = 140;

/**
 * Fraction of the pin spent growing the arch to the stage edges. The remainder
 * opens its shoulders out into full bleed, so the last of the rise is the curve
 * leaving rather than the box still growing.
 */
export const CURTAIN_OPEN_AT = 0.86;

/**
 * Eases on the two dimensions of the rise, and they differ on purpose.
 *
 * A single ease on both gives a squat lens that widens as fast as it climbs. An
 * arch has to read as a doorway first: tall and narrow, then widening into the
 * stage. So height leads and width trails. Both are shaped rather than linear
 * because a linear rise spends most of the pin near full bleed, which is the
 * part with nothing left to reveal.
 */
export const CURTAIN_H_EASE = 1.6;
export const CURTAIN_W_EASE = 2.4;

/** Gap between the arch and its outline, as a fraction of the stage width. */
export const CURTAIN_RING_GAP = 0.026;

/**
 * Where the arch is parked when it is not scroll-driven — under reduced motion.
 * Open enough to read as a window onto the photograph, closed enough that the
 * plate and its wordmark are still the composition.
 */
export const CURTAIN_STATIC_PROGRESS = 0.62;

/**
 * Once-only preloader timing. The original gate is not a scroll chapter: a
 * branded plate is held, then the arch opens on its own, then the overlay is
 * gone and the visitor is on the hero. These numbers are the hold (so the
 * lockup can be read) and the rise, measured against that sequence.
 */
export const CURTAIN_HOLD_MS = 720;
export const CURTAIN_PLAY_MS = 3400;

/**
 * Where the arch stands during the once-only play, from elapsed time.
 *
 * Scroll must not drive this: a persistent pin would leave the gate as the
 * first screen forever. Reduced motion skips the rise entirely so the overlay
 * cannot linger as a parked window.
 */
export function curtainPlayProgress({
  elapsedMs,
  holdMs = CURTAIN_HOLD_MS,
  playMs = CURTAIN_PLAY_MS,
  calm = false,
}: {
  elapsedMs: number;
  holdMs?: number;
  playMs?: number;
  calm?: boolean;
}): number {
  if (calm) {
    return 1;
  }
  if (!Number.isFinite(elapsedMs)) {
    return 0;
  }
  const hold = Math.max(0, holdMs);
  const play = Math.max(0, playMs);
  if (play === 0) {
    return elapsedMs >= hold ? 1 : 0;
  }
  return clamp01((elapsedMs - hold) / play);
}

export interface CurtainStage {
  width: number;
  height: number;
}

export interface CurtainWindow {
  /** Visible width of the arch. */
  width: number;
  /** Visible height of the arch, measured up from the stage floor. */
  height: number;
  /** Distance from the top of the stage to the arch apex. */
  top: number;
  /** Inset from each side of the stage. */
  side: number;
  /** Radius of the arch's semicircular cap. */
  radius: number;
}

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

function smoothstep(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

function ramp(value: number, start: number, end: number): number {
  if (end <= start) {
    return clamp01(value) >= end ? 1 : 0;
  }
  return clamp01((clamp01(value) - start) / (end - start));
}

function n(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Pin distance for the breakpoint, in svh. */
export function curtainRunSvh(breakpoint: "desktop" | "compact"): number {
  switch (breakpoint) {
    case "desktop":
      return CURTAIN_RUN_SVH;
    case "compact":
      return CURTAIN_RUN_COMPACT_SVH;
    default: {
      const exhaustive: never = breakpoint;
      return exhaustive;
    }
  }
}

/** How far through the growth phase the arch is, before the shoulders open. */
export function curtainGrowth(progress: number): number {
  const t = clamp01(progress);
  if (CURTAIN_OPEN_AT <= 0) {
    return 1;
  }
  return Math.min(1, t / CURTAIN_OPEN_AT);
}

/** How far through the shoulder phase — 0 until the arch fills the stage. */
export function curtainOpening(progress: number): number {
  const t = clamp01(progress);
  if (CURTAIN_OPEN_AT >= 1) {
    return 0;
  }
  return clamp01((t - CURTAIN_OPEN_AT) / (1 - CURTAIN_OPEN_AT));
}

export function curtainWindow(progress: number, stage: CurtainStage): CurtainWindow {
  const width = Math.max(1, stage.width);
  const height = Math.max(1, stage.height);
  const grown = curtainGrowth(progress);

  /* From nothing: the plate is unbroken until the visitor asks for the page. */
  const w = width * Math.pow(grown, CURTAIN_W_EASE);
  const h = height * Math.pow(grown, CURTAIN_H_EASE);

  /*
   * A true semicircular cap, so the arch is one radius rather than an ellipse
   * that changes shape with the viewport. Capped by the visible height so a
   * short stage cannot ask for a cap taller than the arch itself.
   */
  const cap = Math.min(w / 2, h);
  const radius = cap * (1 - smoothstep(curtainOpening(progress)));

  return {
    width: w,
    height: h,
    top: Math.max(0, height - h),
    side: Math.max(0, (width - w) / 2),
    radius,
  };
}

/**
 * Outline of the arch, optionally offset outward — the hole at offset 0, its
 * concentric outline at the ring gap. Open at the floor: the caller closes it.
 */
export function curtainArchPath(
  window_: CurtainWindow,
  stage: CurtainStage,
  offset = 0,
): string {
  const floorY = Math.max(1, stage.height);
  const left = window_.side - offset;
  const right = Math.max(1, stage.width) - window_.side + offset;
  const top = window_.top - offset;
  const radius = Math.max(0, Math.min(window_.radius + offset, (right - left) / 2, floorY - top));

  if (radius < 0.5) {
    return `M ${n(left)} ${n(floorY)} L ${n(left)} ${n(top)} L ${n(right)} ${n(top)} L ${n(right)} ${n(floorY)}`;
  }

  const shoulderY = top + radius;
  return [
    `M ${n(left)} ${n(floorY)}`,
    `L ${n(left)} ${n(shoulderY)}`,
    `A ${n(radius)} ${n(radius)} 0 0 1 ${n(right)} ${n(shoulderY)}`,
    `L ${n(right)} ${n(floorY)}`,
  ].join(" ");
}

/**
 * The plate: the whole stage with the arch subtracted. Drawn as one path with
 * two subpaths and `evenodd`, rather than two elements and a mask, so the hole
 * is exact at every frame and there is nothing to keep in sync.
 */
export function curtainPlatePath(window_: CurtainWindow, stage: CurtainStage): string {
  const width = Math.max(1, stage.width);
  const height = Math.max(1, stage.height);
  return `M 0 0 H ${n(width)} V ${n(height)} H 0 Z ${curtainArchPath(window_, stage)} Z`;
}

/**
 * Ring gap in user units.
 *
 * Held back while the doorway is narrow: a fixed gap around a 30px opening is
 * an outline wider than the thing it traces, which reads as a stray mark on the
 * plate rather than as a frame around an opening.
 */
export function curtainRingOffset(window_: CurtainWindow, stage: CurtainStage): number {
  const gap = Math.max(8, Math.round(Math.max(1, stage.width) * CURTAIN_RING_GAP));
  return Math.min(gap, Math.round(window_.width * 0.22));
}

/**
 * The outline arrives once the doorway is large enough to carry it and leaves
 * with the shoulders, so it never has to be drawn off the stage.
 */
export function curtainRingOpacity(progress: number): number {
  return ramp(progress, 0.02, 0.16) * (1 - smoothstep(curtainOpening(progress)));
}

/**
 * How far the wordmark has left, 0 to 1.
 *
 * Early: the lockup is what the visitor read on the plate, and it goes as the
 * photograph starts to rise behind it. Holding it to full bleed would put paper
 * ink over a bright sky and turn the handoff into two things at once.
 */
export function curtainLockupOut(progress: number): number {
  return smoothstep(ramp(progress, 0.06, 0.36));
}

/**
 * How far the tagline has left.
 *
 * With the lockup rather than with the captions, and earlier: it sits on the
 * plate's centre line, which is exactly where the arch rises through. Holding
 * it any longer leaves label copy stranded on the photograph.
 */
export function curtainTaglineOut(progress: number): number {
  return smoothstep(ramp(progress, 0.03, 0.22));
}

/**
 * How far the plate's own frame — the flanking captions and the tagline — has
 * left. Late, because they belong to the plate and the plate is what is being
 * cut away; they are the last of it.
 */
export function curtainFrameOut(progress: number): number {
  return smoothstep(ramp(progress, 0.6, 0.94));
}

/** True once the arch is full bleed and the plate has nothing left to paint. */
export function curtainSpent(progress: number): boolean {
  return clamp01(progress) >= 1;
}

/**
 * Contrast for the fixed chrome over the curtain.
 *
 * Read off the geometry rather than off a progress threshold, because what the
 * chrome is actually sitting on is decided by where the arch apex is: the plate
 * until the curve reaches the chrome band, the photograph after it.
 */
export function curtainNavTone(window_: CurtainWindow, stage: CurtainStage): NavTone {
  return window_.top <= Math.max(1, stage.height) * 0.16 ? "on-media" : "on-dark";
}
