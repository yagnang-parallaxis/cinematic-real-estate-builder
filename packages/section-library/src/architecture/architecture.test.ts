import { describe, expect, it } from "vitest";

import { fitScale, headingLines, shouldShowCta } from "./logic";
import type { ArchitectureContent } from "./types";

const sample: ArchitectureContent = {
  eyebrow: "Architecture",
  heading: "Stone that remembers the tide.",
  quote:
    "We kept the rooms long and the openings few, so the house would feel like it had always been looking at the water.",
  attribution: "Lena Voss",
  credit: "Studio North",
  materials:
    "Dark timber, limewashed stone, and bronze that will dull in the salt air. Nothing that asks to stay new.",
  imageSrc: "https://images.example.com/architecture.jpg",
  cta: { label: "Book a visit", href: "#visit" },
};

describe("architecture content", () => {
  it("is quote-led and requires an attributed pull-quote plus a background image", () => {
    expect(sample.quote.length).toBeGreaterThan(0);
    expect(sample.attribution.length).toBeGreaterThan(0);
    expect(sample.imageSrc.length).toBeGreaterThan(0);
  });
});

describe("headingLines", () => {
  it("wraps a single heading string as one line", () => {
    expect(headingLines(sample)).toEqual(["Stone that remembers the tide."]);
  });

  it("uses explicit heading lines when provided, instead of the raw heading", () => {
    const withLines = { ...sample, headingLines: ["Stone that", "remembers the tide."] };
    expect(headingLines(withLines)).toEqual(["Stone that", "remembers the tide."]);
  });

  it("falls back to the heading when headingLines is empty", () => {
    const emptyLines = { ...sample, headingLines: [] };
    expect(headingLines(emptyLines)).toEqual(["Stone that remembers the tide."]);
  });
});

describe("fitScale", () => {
  it("keeps a short line at full scale", () => {
    expect(fitScale("Architecture")).toBe(1);
  });

  it("shrinks a long line proportionally to its length", () => {
    const long = "Stone that remembers the tide and the years that came before it.";
    const shorter = "Stone that remembers.";
    expect(fitScale(long)).toBeLessThan(fitScale(shorter));
    expect(fitScale(long)).toBeLessThan(1);
  });

  it("never shrinks past the minimum scale, however long the line", () => {
    const veryLong = "A".repeat(400);
    expect(fitScale(veryLong)).toBeGreaterThanOrEqual(0.55);
  });

  it("treats an empty or whitespace-only line as full scale", () => {
    expect(fitScale("")).toBe(1);
    expect(fitScale("   ")).toBe(1);
  });
});

describe("shouldShowCta", () => {
  it("hides the CTA when no action is configured, at any breakpoint", () => {
    expect(shouldShowCta(undefined, "desktop")).toBe(false);
    expect(shouldShowCta(undefined, "compact")).toBe(false);
  });

  it("shows the CTA only at the desktop breakpoint", () => {
    expect(shouldShowCta(sample.cta, "desktop")).toBe(true);
    expect(shouldShowCta(sample.cta, "compact")).toBe(false);
  });
});
