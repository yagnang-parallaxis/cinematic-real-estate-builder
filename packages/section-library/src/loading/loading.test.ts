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
  it("requires a hard timeout so the page cannot stay blocked", () => {
    expect(sample.maxDurationMs).toBeGreaterThan(0);
    expect(sample.progressStyle).toBe("bar");
  });

  it("carries a centered lockup rather than a single brand line", () => {
    expect(sample.wordmark).toHaveLength(2);
    expect(sample.leftCaption).toBeTruthy();
    expect(sample.rightCaption).toBeTruthy();
    expect(sample.place).toBeTruthy();
  });
});

describe("loaderProgress", () => {
  it("stays at 0 before time has passed", () => {
    expect(loaderProgress(0, 2000)).toBe(0);
  });

  it("clamps the ratio between 0 and 1", () => {
    expect(loaderProgress(-50, 2000)).toBe(0);
    expect(loaderProgress(1000, 2000)).toBe(0.5);
    expect(loaderProgress(4000, 2000)).toBe(1);
  });

  it("returns 0 when the timeout is missing", () => {
    expect(loaderProgress(400, 0)).toBe(0);
  });
});

describe("shouldHoldLoader", () => {
  it("holds the overlay while progress is incomplete", () => {
    expect(shouldHoldLoader(800, 2000, false)).toBe(true);
  });

  it("releases the overlay once the timeout has elapsed", () => {
    expect(shouldHoldLoader(2000, 2000, false)).toBe(false);
  });

  it("stays visible when the preview pin is on", () => {
    expect(shouldHoldLoader(4000, 2000, true)).toBe(true);
  });
});
