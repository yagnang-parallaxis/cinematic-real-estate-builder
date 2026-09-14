import type { LocationPoint } from "./types";

export interface PanFrame {
  stageTop: number;
  stageHeight: number;
  viewportHeight: number;
  scrollY: number;
}

/** The row only stays readable across one desktop screen up to six waypoints. */
export const MAX_POINTS = 6;

export const CLOUD_LANE_COUNT = 3;
export const MAX_CLOUD_LANES = 4;
/** Enough shapes that one list is wider than the viewport and can tile. */
export const CLOUD_SHAPES_PER_LANE = 4;

const CLOUD_BASE_DURATION_S = 83;
const CLOUD_DURATION_STEP_S = 47;
const CLOUD_PHASE_STEP = 0.37;
const CLOUD_TOP_START = 6;
const CLOUD_TOP_STEP = 22;
const CLOUD_TOP_MAX = 78;
const CLOUD_OPACITY_START = 0.34;
const CLOUD_OPACITY_STEP = 0.07;
const CLOUD_OPACITY_MIN = 0.08;
const CLOUD_SCALE_STEP = 0.22;

export interface CloudLane {
  index: number;
  /** Drift period of one full loop. */
  durationSeconds: number;
  /** Negative offset that starts each lane part-way through its own loop. */
  delaySeconds: number;
  direction: "left" | "right";
  /** Vertical position inside the photograph, in percent of its height. */
  topPercent: number;
  opacity: number;
  scale: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Trim the written labels and cap the list, so content that grows past what the
 * desktop row can hold degrades by dropping trailing entries rather than
 * crowding. Entries without a label are dropped.
 */
export function normalizePoints(points: LocationPoint[], max = MAX_POINTS): LocationPoint[] {
  const limit = clamp(Math.trunc(max), 1, MAX_POINTS);
  const kept: LocationPoint[] = [];

  for (const point of points) {
    const label = point.label.trim();
    if (!label) {
      continue;
    }
    kept.push({ ...point, label, travelTime: point.travelTime.trim() });
    if (kept.length === limit) {
      break;
    }
  }

  return kept;
}

/**
 * Derive one cloud lane from its index. The base period and the step are
 * coprime, which keeps the lanes from sharing a period or an integer ratio of
 * one — the three rates never resolve into a single visible rhythm.
 */
export function cloudLane(index: number): CloudLane {
  const lane = Math.max(0, Math.trunc(index));
  const durationSeconds = CLOUD_BASE_DURATION_S + lane * CLOUD_DURATION_STEP_S;
  const phase = (lane * CLOUD_PHASE_STEP) % 1;

  return {
    index: lane,
    durationSeconds,
    delaySeconds: -round2(durationSeconds * phase),
    direction: lane % 2 === 0 ? "left" : "right",
    topPercent: clamp(CLOUD_TOP_START + lane * CLOUD_TOP_STEP, 0, CLOUD_TOP_MAX),
    opacity: round2(
      clamp(
        CLOUD_OPACITY_START - lane * CLOUD_OPACITY_STEP,
        CLOUD_OPACITY_MIN,
        CLOUD_OPACITY_START,
      ),
    ),
    scale: round2(1 + lane * CLOUD_SCALE_STEP),
  };
}

export function cloudLanes(count = CLOUD_LANE_COUNT): CloudLane[] {
  const lanes = clamp(Math.trunc(count), 1, MAX_CLOUD_LANES);
  return Array.from({ length: lanes }, (_, index) => cloudLane(index));
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

/**
 * How far the aerial has been walked: 0 shows the sky, 1 the shore.
 */
export function panProgress({ stageTop, stageHeight, viewportHeight, scrollY }: PanFrame): number {
  const range = stageHeight - viewportHeight;
  if (range <= 0) {
    return 0;
  }

  return clamp01((scrollY - stageTop) / range);
}
