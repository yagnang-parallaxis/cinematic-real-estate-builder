import { describe, expect, it } from "vitest";

import {
  cloudLane,
  cloudLanes,
  CLOUD_LANE_COUNT,
  MAX_CLOUD_LANES,
  MAX_POINTS,
  normalizePoints,
} from "./logic";
import type { LocationPoint } from "./types";

const points: LocationPoint[] = [
  { id: "quay", label: "The quay", travelTime: "8 min on foot" },
  { id: "ferry", label: "Ferry terminal", travelTime: "4 min" },
  { id: "old-town", label: "Old town", travelTime: "12 min" },
];

describe("normalizePoints", () => {
  it("keeps a short list in its authored order", () => {
    expect(normalizePoints(points).map((point) => point.id)).toEqual(["quay", "ferry", "old-town"]);
  });

  it("trims written labels and travel times", () => {
    const [point] = normalizePoints([
      { id: "market", label: "  Fish market ", travelTime: "  7 min " },
    ]);
    expect(point).toEqual({ id: "market", label: "Fish market", travelTime: "7 min" });
  });

  it("drops entries with no label left after trimming", () => {
    const kept = normalizePoints([...points, { id: "blank", label: "   ", travelTime: "9 min" }]);
    expect(kept).toHaveLength(points.length);
  });

  it("caps the list at the row limit", () => {
    const many = Array.from({ length: 10 }, (_, index) => ({
      id: `point-${index}`,
      label: `Point ${index}`,
      travelTime: `${index} min`,
    }));
    expect(normalizePoints(many)).toHaveLength(MAX_POINTS);
  });

  it("clamps a requested cap into range", () => {
    expect(normalizePoints(points, 0)).toHaveLength(1);
    expect(normalizePoints(points, 2)).toHaveLength(2);
    expect(normalizePoints(points, 99)).toHaveLength(points.length);
  });

  it("leaves the input array untouched", () => {
    const input: LocationPoint[] = [{ id: "quay", label: " The quay ", travelTime: " 8 min " }];
    normalizePoints(input);
    expect(input[0]).toEqual({ id: "quay", label: " The quay ", travelTime: " 8 min " });
  });
});

describe("cloudLane", () => {
  it("is deterministic for a given index", () => {
    expect(cloudLane(1)).toEqual(cloudLane(1));
  });

  it("alternates direction so neighbouring lanes never drift together", () => {
    expect(cloudLane(0).direction).toBe("left");
    expect(cloudLane(1).direction).toBe("right");
    expect(cloudLane(2).direction).toBe("left");
  });

  it("pushes each lane lower, larger, and fainter", () => {
    const [first, second, third] = [cloudLane(0), cloudLane(1), cloudLane(2)];
    expect(second.topPercent).toBeGreaterThan(first.topPercent);
    expect(third.topPercent).toBeGreaterThan(second.topPercent);
    expect(second.opacity).toBeLessThan(first.opacity);
    expect(third.scale).toBeGreaterThan(second.scale);
  });

  it("keeps the offset and opacity inside legible bounds at any index", () => {
    const deep = cloudLane(40);
    expect(deep.topPercent).toBeLessThanOrEqual(78);
    expect(deep.opacity).toBeGreaterThanOrEqual(0.08);
  });

  it("treats a negative or fractional index as the first lane", () => {
    expect(cloudLane(-3)).toEqual(cloudLane(0));
    expect(cloudLane(1.8)).toEqual(cloudLane(1));
  });
});

describe("cloudLanes", () => {
  it("returns three lanes by default", () => {
    expect(cloudLanes()).toHaveLength(CLOUD_LANE_COUNT);
  });

  it("clamps the requested count", () => {
    expect(cloudLanes(0)).toHaveLength(1);
    expect(cloudLanes(12)).toHaveLength(MAX_CLOUD_LANES);
  });

  it("gives every lane its own period", () => {
    const durations = cloudLanes().map((lane) => lane.durationSeconds);
    expect(new Set(durations).size).toBe(durations.length);
  });

  it("never lets one period be a whole multiple of another", () => {
    const durations = cloudLanes(MAX_CLOUD_LANES).map((lane) => lane.durationSeconds);
    for (const shorter of durations) {
      for (const longer of durations) {
        if (shorter === longer) {
          continue;
        }
        expect(Math.max(shorter, longer) % Math.min(shorter, longer)).not.toBe(0);
      }
    }
  });

  it("starts each lane part-way through its own loop", () => {
    for (const lane of cloudLanes()) {
      expect(lane.delaySeconds).toBeLessThanOrEqual(0);
      expect(Math.abs(lane.delaySeconds)).toBeLessThan(lane.durationSeconds);
    }
    const delays = cloudLanes().map((lane) => lane.delaySeconds);
    expect(new Set(delays).size).toBe(delays.length);
  });

  it("stacks the lanes at distinct vertical offsets", () => {
    const offsets = cloudLanes().map((lane) => lane.topPercent);
    expect(new Set(offsets).size).toBe(offsets.length);
  });
});
