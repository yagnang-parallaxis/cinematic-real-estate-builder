import { describe, expect, it } from "vitest";

import type { HeroContent } from "./types";

const sample: HeroContent = {
  heading: "Quiet rooms above the water.",
  place: "Harbor Line, North Coast",
  supporting: "Eighteen residences arranged around afternoon light.",
  cta: { label: "Book a visit", href: "#visit" },
  imageSrc: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  imageAlt: "A timber and stone house facing a still inlet at dusk.",
  scrollLabel: "Begin the walk",
};

describe("hero", () => {
  it("requires a heading, place, media, and a primary action", () => {
    expect(sample.heading.length).toBeGreaterThan(0);
    expect(sample.place.length).toBeGreaterThan(0);
    expect(sample.imageAlt.length).toBeGreaterThan(0);
    expect(sample.cta.href).toBe("#visit");
  });
});
