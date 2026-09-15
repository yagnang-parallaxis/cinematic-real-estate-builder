/**
 * Geometry for the arch transition.
 *
 * The arch is a circle of radius half the stage width, rising out of the stage
 * floor. Progress raises its apex; what is visible is therefore a slice of that
 * circle, which is why the early frames read as a wide shallow segment and the
 * late ones as a doorway. Once the apex has passed the circle's own centre the
 * sides are vertical, so the shape finishes as a semicircle on a rectangle and
 * fills the stage.
 *
 * The numbers below are measured off the reference rather than chosen. Its dome
 * is a box of the stage's width, half as tall, with both top corners rounded by
 * half the width — so a semicircle on a rectangle — and it does not grow at all:
 * it *translates* up the stage at exactly scroll speed. Probed at 1440×900 and
 * 390×844 (`scripts/dome-probe.mjs`), the apex rises 1px per 1px of scroll, from
 * the floor to the top of the stage over one viewport height, and the fitted
 * radius holds at half the stage width throughout — 720 of 1440, 195 of 390.
 *
 * Lettering rides the top curve.
 */

import { FIT_FLOOR } from "../shared/fit-text";

/**
 * Starting visible height, as a fraction of stage height.
 *
 * Nothing: the reference's dome is entirely below the floor before its rise, and
 * a non-zero start pops a wide bump onto the stage in one frame. Ours used 0.09,
 * which on a 1440×900 stage is a 664px-wide segment — 46% of the stage — arriving
 * with no travel behind it.
 */
export const ARCH_H_FROM = 0;

/**
 * Upper bound on visible height as a fraction of the stage: the whole of it, so
 * the apex finishes at the top edge as the reference's does. This is past the
 * circle's centre on any landscape stage, which is what gives the finish its
 * straight sides.
 */
export const ARCH_H_TO = 1;

/** How much of the scroll range the arch section takes, in viewport heights. */
export const ARCH_SCROLL_VH = 250;

/**
 * Fraction of the scrub used to finish the rise. After this, the closed arch
 * holds for the remaining scrub, which is the beat before the next chapter
 * arrives — the hold is scroll distance the visitor spends, never a timer or a
 * forced travel, so reversing out of it retraces the same curve.
 *
 * Derived rather than picked. The sticky stage is one viewport tall, so the
 * section's scrub range is `ARCH_SCROLL_VH - 100` viewports; spending exactly one
 * of them on the rise makes the apex travel at scroll speed, and leaves the rest
 * as the hold. At 250svh that is a 100svh rise and a 50svh hold, which is what
 * the reference measures (900px of rise, then ~450px of full bleed at 1440×900).
 */
export const ARCH_SETTLE = 100 / (ARCH_SCROLL_VH - 100);

/**
 * Ease on height growth. Linear, because the reference's rise is a translation
 * at scroll speed and so has no ease to copy: measured, its apex moves 50px for
 * every 50px of scroll across the whole range, at both breakpoints.
 */
export const ARCH_H_EASE = 1;

/**
 * Where the composition sits when it is not scroll-driven — on compact
 * screens and under reduced motion.
 */
export const ARCH_STATIC_PROGRESS = 0.48;

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

/**
 * Maps section scrub onto the rise, then holds at 1 so the closed arch
 * does not keep growing after it has reached the top of the stage.
 */
export function settleProgress(progress: number, settleAt = ARCH_SETTLE): number {
  const t = clampProgress(progress);
  const at = clampProgress(settleAt);

  if (at <= 0) {
    return 1;
  }

  if (t >= at) {
    return 1;
  }

  return t / at;
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
  const hFrom = Math.max(0, stage.height * ARCH_H_FROM);
  const hTo = Math.max(hFrom, stage.height * ARCH_H_TO);
  const height = lerp(hFrom, hTo, eased);
  const cx = stage.width / 2;
  const floorY = stage.height;

  /*
   * Radius stays locked to half the stage width for the whole rise — early
   * frames are a slice of that circle, not a tiny growing bubble. Past the
   * circle's own centre the slice has vertical sides, which is the finish.
   */
  return { cx, floorY, rx: fullR, ry: fullR, height, extended: height > fullR };
}

/**
 * Half-width of the dome at one row of the stage, and so the answer to "what is
 * painted at this height" — which is what decides both the silhouette and what
 * the fixed chrome is sitting on.
 */
export function archHalfWidthAt(geometry: ArchGeometry, y: number): number {
  const centreY = geometry.floorY - geometry.height + geometry.ry;
  if (y >= centreY) {
    /* Below the circle's centre the sides are vertical. */
    return geometry.rx;
  }
  const rise = centreY - y;
  if (rise >= geometry.ry) {
    return 0;
  }
  return Math.sqrt(Math.max(0, geometry.ry * geometry.ry - rise * rise));
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
 * Distance from the dome's apex to the top of the lettering's caps, as a
 * fraction of the dome's radius.
 *
 * Measured off the reference: 61px against a 720 radius at 1440×900, held for
 * the whole rise (`scripts/dome-probe.mjs`). A fraction rather than a length,
 * because the reference's lettering runs on a circle concentric with the dome —
 * shrink the dome and the margin shrinks with it.
 */
export const ARCH_CAP_GAP = 61 / 720;

/**
 * Distance from the lettering circle to the top of the caps, in `em` of the
 * rendered size.
 *
 * The baseline does not sit on the path — it is offset off it by `dy`, and the
 * caps rise above that. Both terms are proportional to the font size, so the
 * pair collapses into one measured number: probed at 1440, 834 and 390, the gap
 * from the lettering circle to the cap top is 1.134em at every one of them
 * (64.28/56.7, 63.66/56.13, 30.33/26.25).
 *
 * This is why the inset has to know the font size. With it fixed, every change
 * of rendered size moved the lettering off the rim margin above.
 */
export const ARCH_TEXT_RIDE_EM = 1.134;

/**
 * Angular half-span of the lettering path, in radians.
 *
 * Fixed rather than grown with progress, because the reference's is: its path
 * measures the same arc at every frame of the rise and only the *run* along it
 * lengthens, by word spacing. The path only has to be long enough to carry the
 * widest run; `ARCH_TEXT_FILL` is what decides how much of it is used.
 */
export const ARCH_TEXT_SPAN = 1.25;

/**
 * Fraction of the lettering path a run may occupy.
 *
 * With the span above this caps the run at 1.113 radians of arc either side of
 * the apex — 63.8°, which is where the reference's own compact line wraps to
 * (2.224 radians of total arc at 390×844). It is the hard limit in the fit: a
 * line that would need more arc than this is rendered smaller instead.
 */
export const ARCH_TEXT_FILL = 0.89;

/**
 * How much wider the rendered line is than the arc its baseline runs on, in `em`.
 *
 * Half a glyph hangs past the run at each end, and the end glyphs are rotated
 * far enough out of upright to project wider still. Measured at 1440: 1.18em
 * where the line sits at rest and 1.37em at its widest wrap. Without this term
 * the fit lands on the baseline chord and the painted line is 4 points of
 * coverage wider than it was asked for.
 */
export const ARCH_GLYPH_OVERHANG_EM = 1.3;

/**
 * Fraction of the dome's width the line covers at rest, before the words have
 * spread. The reference measures 0.34 at 1440 — ours stays wider than that,
 * because at the same coverage the face would have to be set at 32px.
 */
export const ARCH_TEXT_COVERAGE_REST = 0.43;

/**
 * Fraction of the dome's width the fully spread line may cover. Measured on the
 * reference at the closed dome (730px of 1440).
 */
export const ARCH_TEXT_COVERAGE_OPEN = 0.5;

/**
 * How much of the spread is already open before the rise starts. The reference
 * begins at 0.078em of word spacing rather than at none.
 */
export const ARCH_SPREAD_REST = 0.05;

/**
 * Inset used until the client has measured the face, as a fraction of the
 * radius: what `ARCH_CAP_GAP` and `ARCH_TEXT_RIDE_EM` come to at the desktop
 * tier. The server cannot know either the rendered token size or the copy's
 * width in the face that will load, so the first paint holds the pose the
 * desktop stage measured and the fit refines it.
 */
export const ARCH_TEXT_INSET_FALLBACK = 0.174;

/** Word gaps in a line — the joints the spread opens. */
export function archWordGaps(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return Math.max(0, words.length - 1);
}

/** What the copy costs to set, independent of the size it is set at. */
export interface ArchTextMetrics {
  /** Natural width of the copy per `em` of font size, word gaps closed. */
  emWidth: number;
  /** Word gaps the spread has to open. */
  gaps: number;
  /** Rendered size of the `--arch-curve` token, in px. */
  tokenSize: number;
  /** Rendered size of the `--arch-curve-min` token, in px. */
  minSize: number;
}

/** How far inside the dome's edge the lettering path sits. */
export function archTextInset(geometry: ArchGeometry, fontSize: number): number {
  const gap = geometry.ry * ARCH_CAP_GAP + Math.max(0, fontSize) * ARCH_TEXT_RIDE_EM;
  /* The lettering circle has to stay a circle, however large the type. */
  return Math.min(geometry.ry * 0.8, gap);
}

/** Radius of the circle the lettering runs on. */
export function archTextRadius(geometry: ArchGeometry, inset: number): number {
  return Math.max(1, geometry.rx - inset);
}

/**
 * The arc the lettering runs along — a concentric inset of the panel curve,
 * spanning `ARCH_TEXT_SPAN` either side of the apex.
 */
export function archTextPath(geometry: ArchGeometry, inset: number): string {
  const { cx, floorY, height } = geometry;
  const textR = archTextRadius(geometry, inset);
  /*
   * Same centre as the visible circle slice: the apex sits `height` above the
   * floor on the outer radius, so the centre is `rx` below the apex.
   */
  const centerY = floorY - height + geometry.rx;
  const leftX = cx - textR * Math.sin(ARCH_TEXT_SPAN);
  const rightX = cx + textR * Math.sin(ARCH_TEXT_SPAN);
  const y = centerY - textR * Math.cos(ARCH_TEXT_SPAN);
  return `M ${round(leftX)} ${round(y)} A ${round(textR)} ${round(textR)} 0 0 1 ${round(rightX)} ${round(y)}`;
}

/**
 * Width a run of `length` paints, set on a circle of `radius` at `fontSize`:
 * the chord its ends are apart, plus the glyphs that hang past them.
 */
export function archRunWidth(length: number, radius: number, fontSize: number): number {
  const half = length / (2 * Math.max(1, radius));
  if (half >= Math.PI / 2) {
    /* Past the equator the run has wrapped under itself — no width to report. */
    return Number.POSITIVE_INFINITY;
  }
  return 2 * radius * Math.sin(half) + fontSize * ARCH_GLYPH_OVERHANG_EM;
}

/** Length of a run that paints `width` wide on a circle of `radius`. */
export function archRunLengthForWidth(
  width: number,
  radius: number,
  fontSize: number,
): number {
  const ratio = (width - fontSize * ARCH_GLYPH_OVERHANG_EM) / (2 * Math.max(1, radius));
  if (ratio >= 1) {
    return Number.POSITIVE_INFINITY;
  }
  return ratio <= 0 ? 0 : 2 * radius * Math.asin(ratio);
}

/** Largest size at or below `token` the predicate still holds at. */
function largestSize(token: number, holds: (size: number) => boolean): number {
  if (holds(token)) {
    return token;
  }
  let lo = 0;
  let hi = token;
  /* Both predicates are monotone in the size, so bisection is exact enough. */
  for (let index = 0; index < 40; index += 1) {
    const mid = (lo + hi) / 2;
    if (holds(mid)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return lo;
}

/**
 * The size the curved heading is set at, in px.
 *
 * Derived from the arc rather than taken from the scale, which is the whole of
 * P1-2. The tier the CSS asks for is an aspiration: a line of arbitrary clone
 * copy set at it either wraps most of the way around the dome or runs off the
 * end of the path, and which of the two depends on the face — at the same
 * rendered size Bodoni Moda needs 1.7× the width per character of the
 * reference's condensed Didone, so no constant on the scale can answer for both.
 *
 * Three bounds, in order of authority:
 *
 * 1. **The arc.** The run may not need more than `ARCH_TEXT_FILL` of the path.
 *    Hard — this is what F5 guaranteed by squeezing the tracking instead, and
 *    squeezing is what took the tracking negative on a narrow stage.
 * 2. **Coverage.** The line at rest covers `ARCH_TEXT_COVERAGE_REST` of the
 *    dome's width. Honoured while the type stays on the scale, which on a wide
 *    dome it does and on a narrow one it cannot: every bound here is
 *    scale-invariant, so on its own this rule would put a 390px stage at 13px.
 * 3. **The scale.** Never above the tier asked for, never below the smallest
 *    tier the display face still reads as a heading at — except where bound 1
 *    says the arc has no room for it, which outranks reading well.
 *
 * `FIT_FLOOR` is where even that stops: a line long enough to need less than a
 * third of its tier is not a heading at any size, and setting it to the arc is
 * the better answer than shrinking it further. That is the one case
 * `ArchTextRun.forcedLength` is still for.
 */
export function archCurveSize(geometry: ArchGeometry, metrics: ArchTextMetrics): number {
  const { emWidth, tokenSize, minSize } = metrics;
  if (!(emWidth > 0) || !(tokenSize > 0)) {
    return Math.max(0, tokenSize);
  }

  const radiusAt = (size: number) => archTextRadius(geometry, archTextInset(geometry, size));

  const forArc = largestSize(
    tokenSize,
    (size) => size * emWidth <= ARCH_TEXT_FILL * 2 * ARCH_TEXT_SPAN * radiusAt(size),
  );
  const forCoverage = largestSize(
    tokenSize,
    (size) =>
      archRunWidth(size * emWidth, radiusAt(size), size) <=
      ARCH_TEXT_COVERAGE_REST * 2 * geometry.rx,
  );

  const floor = Math.min(Math.max(0, minSize), tokenSize);
  return Math.max(
    FIT_FLOOR * tokenSize,
    Math.min(tokenSize, forArc, Math.max(forCoverage, floor)),
  );
}

/** How far through its spread the line is. */
export function archSpreadRamp(progress: number): number {
  const t = clampProgress(progress);
  const eased = t * t * (3 - 2 * t);
  return ARCH_SPREAD_REST + (1 - ARCH_SPREAD_REST) * eased;
}

/** Everything about the lettering that follows from the copy and the dome. */
export interface ArchTextRun {
  /** Rendered size, in px. Null until the face has been measured. */
  fontSize: number | null;
  inset: number;
  textRadius: number;
  /** Width the copy wants at `fontSize`, word gaps closed. */
  naturalLength: number;
  /** Width it is set to at this progress. Never below the natural width. */
  runLength: number;
  /** Space added between words to reach `runLength`, in `em`. */
  wordSpacingEm: number;
  /**
   * Length the run is forced to, or null when it is left at its own width.
   *
   * Set only where the copy overruns the path even at the smallest size the
   * scale offers, because forcing a length is what takes the tracking negative:
   * `lengthAdjust="spacing"` distributes the shortfall across every gap, letters
   * included. A clipped heading is worse than a tight one, so the guarantee
   * stays — it just no longer fires on ordinary copy.
   */
  forcedLength: number | null;
}

/**
 * The lettering, from the copy's own metrics and the dome it is sitting on.
 *
 * `metrics` is null before the client has measured the face, which is the only
 * state the server can render: it holds the desktop pose and sets the run to the
 * path, exactly as this did at every width before the fit existed.
 *
 * `spread` is the content's multiplier on how far the words open — 1 takes them
 * to the coverage cap by the end of the rise, 0 leaves them at their own width.
 */
export function archTextRun(
  geometry: ArchGeometry,
  metrics: ArchTextMetrics | null,
  progress = ARCH_STATIC_PROGRESS,
  spread = 1,
): ArchTextRun {
  if (!metrics || !(metrics.emWidth > 0) || !(metrics.tokenSize > 0)) {
    const inset = Math.max(24, geometry.ry * ARCH_TEXT_INSET_FALLBACK);
    const textRadius = archTextRadius(geometry, inset);
    const path = 2 * ARCH_TEXT_SPAN * textRadius;
    return {
      fontSize: null,
      inset,
      textRadius,
      naturalLength: 0,
      runLength: ARCH_TEXT_FILL * path,
      wordSpacingEm: 0,
      forcedLength: round(ARCH_TEXT_FILL * path),
    };
  }

  const fontSize = archCurveSize(geometry, metrics);
  const inset = archTextInset(geometry, fontSize);
  const textRadius = archTextRadius(geometry, inset);
  const path = 2 * ARCH_TEXT_SPAN * textRadius;
  const naturalLength = fontSize * metrics.emWidth;

  /*
   * Where the spread is allowed to reach: the narrower of the coverage cap and
   * the path, and never behind the copy's own width — pulling the words closer
   * than they set is the squeeze, not a spread.
   */
  const open = Math.max(
    naturalLength,
    Math.min(
      archRunLengthForWidth(ARCH_TEXT_COVERAGE_OPEN * 2 * geometry.rx, textRadius, fontSize),
      ARCH_TEXT_FILL * path,
    ),
  );
  const amount = Number.isFinite(spread) ? Math.min(1, Math.max(0, spread)) : 1;
  const runLength = naturalLength + (open - naturalLength) * archSpreadRamp(progress) * amount;

  return {
    fontSize,
    inset,
    textRadius,
    naturalLength,
    runLength,
    wordSpacingEm:
      metrics.gaps > 0 ? (runLength - naturalLength) / (metrics.gaps * fontSize) : 0,
    forcedLength:
      naturalLength > ARCH_TEXT_FILL * path ? round(ARCH_TEXT_FILL * path) : null,
  };
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
  const clearsLettering = apexY + inset * 2.2;
  return Math.max(clearsLettering, stageHeight * 0.52);
}

/** Lettering arrives once the bump is large enough to carry it. */
export function curvedTextOpacity(progress: number): number {
  return ramp(progress, 0.08, 0.28);
}

/** Mark, rule and tagline arrive once the arc is nearly closed. */
export function interiorOpacity(progress: number): number {
  return ramp(progress, 0.72, 0.88);
}

/** True once the arc has grown over the hero CTA. */
export function hidesHeroChrome(progress: number): boolean {
  return clampProgress(progress) >= 0.5;
}

/**
 * Fraction of the stage the fixed chrome occupies at the top. What the seal and
 * the links are actually sitting on is decided inside this band, not at the
 * middle of the stage.
 */
export const ARCH_CHROME_BAND = 0.16;

/**
 * How far in from each side of the stage the fixed chrome sits, as a fraction of
 * the stage width. The seal and the links hold the gutters, not the very edge, so
 * the dome does not have to reach x=0 to be what they are sitting on.
 */
export const ARCH_CHROME_INSET = 0.04;

/**
 * Contrast for the fixed chrome over the rise.
 *
 * The question is whether the dome has reached the corners of the chrome band,
 * not whether its apex has entered it. Those diverge because the dome is a slice
 * of a circle: at the moment the apex touches the top of the stage, the band is
 * dome across the middle and still photograph at both ends, which is exactly
 * where the links and the seal are. Measured on the reference at the top of its
 * rise — apex at the stage top, 1440×900 — the corners are still photograph and
 * its chrome stays in its over-media treatment throughout.
 *
 * So on a landscape stage this correctly never flips: the radius is half the
 * width, so the dome cannot be full width anywhere near the band. A stage taller
 * than roughly three times its width does flip, which is the case the branch is
 * for.
 */
export function archNavTone(geometry: ArchGeometry, stage: ArchStage): "on-media" | "on-color" {
  const band = Math.max(1, stage.height) * ARCH_CHROME_BAND;
  const reach = (stage.width / 2) * (1 - ARCH_CHROME_INSET);
  return archHalfWidthAt(geometry, band) >= reach ? "on-color" : "on-media";
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
