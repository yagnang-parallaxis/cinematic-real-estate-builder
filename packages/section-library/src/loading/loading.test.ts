import { describe, expect, it } from "vitest";

import {
  clampHoldMs,
  DEFAULT_HOLD_MS,
  MAX_HOLD_MS,
  MIN_HOLD_MS,
  taglineLines,
  wordmarkLines,
} from "./logic";
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

describe("clampHoldMs", () => {
  it("keeps a sensible hold", () => {
    expect(clampHoldMs(2000)).toBe(2000);
  });

  it("clamps a hold too short to read, or long enough to be a wait", () => {
    expect(clampHoldMs(120)).toBe(MIN_HOLD_MS);
    expect(clampHoldMs(60000)).toBe(MAX_HOLD_MS);
    expect(clampHoldMs(0)).toBe(MIN_HOLD_MS);
    expect(clampHoldMs(-500)).toBe(MIN_HOLD_MS);
  });

  it("falls back to the default when unset or unusable", () => {
    expect(clampHoldMs()).toBe(DEFAULT_HOLD_MS);
    expect(clampHoldMs(Number.NaN)).toBe(DEFAULT_HOLD_MS);
  });

  it("rounds to whole milliseconds", () => {
    expect(clampHoldMs(1800.6)).toBe(1801);
  });
});

describe("wordmarkLines", () => {
  it("returns the authored wordmark, a line at a time", () => {
    expect(wordmarkLines(sample)).toEqual(["Aurelia", "Residences"]);
  });

  it("falls back to the brand when no wordmark is authored", () => {
    expect(wordmarkLines({ brand: "Aurelia" })).toEqual(["Aurelia"]);
  });

  it("trims each line and drops the blank ones", () => {
    expect(wordmarkLines({ brand: "Aurelia", wordmark: ["  Aurelia  ", "   "] })).toEqual([
      "Aurelia",
    ]);
  });

  it("falls back to the brand when every authored line is blank", () => {
    expect(wordmarkLines({ brand: "Aurelia", wordmark: ["  ", ""] })).toEqual(["Aurelia"]);
  });

  it("has nothing to show when there is no brand either", () => {
    expect(wordmarkLines({ brand: "   " })).toEqual([]);
  });
});

describe("taglineLines", () => {
  it("splits the tagline on its authored line breaks", () => {
    expect(taglineLines(sample.tagline)).toEqual(["Eighteen residences", "above a quiet harbor."]);
  });

  it("drops blank lines rather than rendering an empty one", () => {
    expect(taglineLines("One\n\n  \nTwo")).toEqual(["One", "Two"]);
  });

  it("has nothing for an absent or empty tagline", () => {
    expect(taglineLines()).toEqual([]);
    expect(taglineLines("")).toEqual([]);
    expect(taglineLines("   \n  ")).toEqual([]);
  });
});
