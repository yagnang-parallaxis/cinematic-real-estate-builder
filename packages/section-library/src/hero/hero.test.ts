import { describe, expect, it } from "vitest";

import { brandLeaveProgress, clampHotspots, magneticOffset, resolveHeroMedia } from "./logic";
import type { HeroContent } from "./types";

const sample: HeroContent = {
  heading: "Aurelia Residences",
  headingLines: ["Aurelia", "Residences"],
  place: "Harbor",
  supportingBefore: "A house",
  supportingAfter: "above the water",
  dayLabel: "by day",
  nightLabel: "by night",
  cta: { label: "Select a residence", href: "#residences" },
  imageSrc: "https://images.unsplash.com/photo-day",
  imageAlt: "The house facing the inlet in afternoon light.",
  nightImageSrc: "https://images.unsplash.com/photo-night",
  nightImageAlt: "The same house after dusk.",
  hotspots: [
    {
      id: "stone",
      label: "Stone that lasts",
      description: "Limewashed stone and timber.",
      x: 50,
      y: 49,
    },
    {
      id: "light",
      label: "Light through the rooms",
      description: "Rooms turn toward the water.",
      x: 32,
      y: 47,
    },
    {
      id: "street",
      label: "The quiet street wall",
      description: "A single opening to the garden.",
      x: 77,
      y: 42,
    },
  ],
};

describe("hero content", () => {
  it("requires a heading, place, media, and a primary action", () => {
    expect(sample.heading.length).toBeGreaterThan(0);
    expect(sample.place.length).toBeGreaterThan(0);
    expect(sample.imageAlt.length).toBeGreaterThan(0);
    expect(sample.cta.href).toBe("#residences");
  });

  it("embeds the media toggle inside a split supporting sentence", () => {
    expect(sample.supportingBefore.length).toBeGreaterThan(0);
    expect(sample.supportingAfter.length).toBeGreaterThan(0);
    expect(sample.dayLabel).toBeTruthy();
    expect(sample.nightLabel).toBeTruthy();
  });
});

describe("resolveHeroMedia", () => {
  it("returns the day plate by default", () => {
    expect(resolveHeroMedia(sample, "day")).toEqual({
      src: sample.imageSrc,
      alt: sample.imageAlt,
    });
  });

  it("returns the night plate when that variant is selected", () => {
    expect(resolveHeroMedia(sample, "night")).toEqual({
      src: sample.nightImageSrc,
      alt: sample.nightImageAlt,
    });
  });

  it("falls back to the day plate when night media is missing", () => {
    const dayOnly = { ...sample, nightImageSrc: undefined, nightImageAlt: undefined };
    expect(resolveHeroMedia(dayOnly, "night")).toEqual({
      src: sample.imageSrc,
      alt: sample.imageAlt,
    });
  });
});

describe("clampHotspots", () => {
  it("keeps at most four annotations", () => {
    const extra = [
      ...sample.hotspots!,
      { id: "four", label: "Four", description: "Four.", x: 10, y: 10 },
      { id: "five", label: "Five", description: "Five.", x: 20, y: 20 },
    ];
    expect(clampHotspots(extra)).toHaveLength(4);
  });
});

describe("brandLeaveProgress", () => {
  it("is fully present at the top of the page", () => {
    expect(brandLeaveProgress(0, 800)).toBe(0);
  });

  it("is fully gone after a short first-viewport travel", () => {
    expect(brandLeaveProgress(800, 800)).toBe(1);
  });

  it("reverses as scroll returns toward the top", () => {
    const leaving = brandLeaveProgress(200, 800);
    const returning = brandLeaveProgress(80, 800);
    expect(leaving).toBeGreaterThan(0);
    expect(leaving).toBeLessThan(1);
    expect(returning).toBeLessThan(leaving);
  });
});

describe("magneticOffset", () => {
  const rect = { left: 0, top: 0, width: 200, height: 200, right: 200, bottom: 200 };

  it("pulls toward the cursor from the center", () => {
    const offset = magneticOffset(150, 100, rect, 0.25, 20);
    expect(offset.x).toBeGreaterThan(0);
    expect(offset.y).toBe(0);
  });

  it("clamps the pull to the maximum radius", () => {
    const offset = magneticOffset(400, 100, rect, 1, 12);
    expect(Math.hypot(offset.x, offset.y)).toBeLessThanOrEqual(12);
  });
});
