import { describe, expect, it } from "vitest";

import type { ArchitectureContent } from "./Architecture";

const sample: ArchitectureContent = {
  eyebrow: "Architecture",
  heading: "Stone that remembers the tide.",
  quote: "Every room should know where the water is.",
  attribution: "Lena Voss",
  credit: "Studio North",
  imageSrc: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",
};

describe("architecture", () => {
  it("is quote-led and requires a background image", () => {
    expect(sample.heading.length).toBeGreaterThan(0);
    expect(sample.quote.length).toBeGreaterThan(0);
    expect(sample.attribution.length).toBeGreaterThan(0);
    expect(sample.imageSrc.length).toBeGreaterThan(0);
  });
});
