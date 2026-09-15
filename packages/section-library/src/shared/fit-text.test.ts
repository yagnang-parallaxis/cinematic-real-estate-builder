import { describe, expect, it } from "vitest";

import { FIT_FLOOR, fitScale, quantiseScale } from "./fit-text";

describe("fitScale", () => {
  it("leaves a line that already fits at its full tier", () => {
    expect(fitScale(400, 900)).toBe(1);
  });

  it("never inflates a short line past its tier", () => {
    expect(fitScale(100, 900)).toBe(1);
  });

  it("scales an oversized line down to the measure", () => {
    expect(fitScale(1000, 500)).toBe(0.5);
  });

  it("stops at the floor rather than shrinking without limit", () => {
    expect(fitScale(10000, 100)).toBe(FIT_FLOOR);
  });

  it("honours a caller-supplied floor", () => {
    expect(fitScale(1000, 100, 0.5)).toBe(0.5);
  });

  it("holds at full size before anything has been measured", () => {
    expect(fitScale(0, 900)).toBe(1);
    expect(fitScale(400, 0)).toBe(1);
    expect(fitScale(Number.NaN, 900)).toBe(1);
  });
});

describe("quantiseScale", () => {
  it("rounds to a fixed step so a one-pixel resize does not rewrite the size", () => {
    expect(quantiseScale(0.6234)).toBe(0.625);
    expect(quantiseScale(0.6241)).toBe(0.625);
  });

  it("keeps the unscaled case exact", () => {
    expect(quantiseScale(1)).toBe(1);
  });
});
