import { describe, expect, it } from "vitest";

import { loaderProgress, shouldHoldLoader } from "./logic";
import type { LoadingContent } from "./types";

const sample: LoadingContent = {
  brand: "Aurelia",
  wordmark: ["Aurelia", "Residences"],
  place: "Harbor",
  leftCaption: "North",
  rightCaption: "Coast",
  tagline: "Eighteen residences\nabove a quiet harbor.",
  progressStyle: "bar",
  maxDurationMs: 2000,
};

describe("loading content", () => {
  it("requires a brand and a maximum duration", () => {
    expect(sample.brand.length).toBeGreaterThan(0);
    expect(sample.maxDurationMs).toBeGreaterThan(0);
  });
});

describe("loaderProgress", () => {
  it("moves from 0 to 1 across the configured duration", () => {
    expect(loaderProgress(0, 2000)).toBe(0);
    expect(loaderProgress(1000, 2000)).toBe(0.5);
    expect(loaderProgress(2000, 2000)).toBe(1);
  });

  it("clamps past the configured duration", () => {
    expect(loaderProgress(5000, 2000)).toBe(1);
  });

  it("returns 0 when there is no configured duration", () => {
    expect(loaderProgress(500, 0)).toBe(0);
  });
});

describe("shouldHoldLoader", () => {
  it("holds until the duration elapses", () => {
    expect(shouldHoldLoader(500, 2000, false)).toBe(true);
    expect(shouldHoldLoader(2000, 2000, false)).toBe(false);
  });

  it("holds indefinitely when forced visible, regardless of elapsed time", () => {
    expect(shouldHoldLoader(9999, 2000, true)).toBe(true);
  });
});
