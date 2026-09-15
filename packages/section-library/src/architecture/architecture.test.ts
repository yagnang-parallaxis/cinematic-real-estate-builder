import { describe, expect, it } from "vitest";

import { headingLines, shouldShowCta } from "./logic";
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
  cta: { label: "Book a call", href: "#visit" },
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
