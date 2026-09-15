import { describe, expect, it } from "vitest";

import {
  brandLeaveProgress,
  clampHotspots,
  heroFocusPercent,
  heroIntroReady,
  heroNavTone,
  heroRunwaySvh,
  lockupChars,
  magneticOffset,
  resolveHeroMedia,
} from "./logic";
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

describe("lockupChars", () => {
  it("splits a lockup line into glyphs so they can arrive one at a time", () => {
    expect(lockupChars("Residences")).toEqual([..."Residences"]);
  });

  it("keeps a space as its own glyph", () => {
    expect(lockupChars("A B")).toEqual(["A", " ", "B"]);
  });

  it("is empty when the line is empty", () => {
    expect(lockupChars("")).toEqual([]);
  });
});

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

describe("heroRunwaySvh", () => {
  const framing = { subject: 0.55, land: { desktop: 0.99, compact: 0.77 } };

  it("lands the subject where the author asked on each breakpoint", () => {
    /* subject × runway is the subject's distance down the section. */
    expect((0.55 * heroRunwaySvh(framing, "desktop")) / 100).toBeCloseTo(0.99, 2);
    expect((0.55 * heroRunwaySvh(framing, "compact")) / 100).toBeCloseTo(0.77, 2);
  });

  it("shortens the travel when the subject sits low in the photograph", () => {
    const low = heroRunwaySvh({ subject: 0.8, land: { desktop: 0.9 } }, "desktop");
    const high = heroRunwaySvh({ subject: 0.4, land: { desktop: 0.9 } }, "desktop");
    expect(low).toBeLessThan(high);
  });

  it("keeps the three stations viable however the framing is authored", () => {
    expect(heroRunwaySvh({ subject: 1, land: { desktop: 0.05 } }, "desktop")).toBe(120);
    expect(heroRunwaySvh({ subject: 0.05, land: { desktop: 1 } }, "desktop")).toBe(220);
    expect(heroRunwaySvh({ subject: 0 }, "desktop")).toBe(220);
  });

  it("falls back to the authored default when a photograph says nothing", () => {
    expect(heroRunwaySvh(undefined, "desktop")).toBe(180);
    expect(heroRunwaySvh(undefined, "compact")).toBe(140);
    expect(heroRunwaySvh({ subject: Number.NaN }, "compact")).toBe(140);
  });
});

describe("heroFocusPercent", () => {
  it("keeps the authored column of the crop", () => {
    expect(heroFocusPercent({ focus: { compact: 0.72 } }, "compact")).toBe(72);
  });

  it("centers the crop when nothing is authored", () => {
    expect(heroFocusPercent(undefined, "desktop")).toBe(50);
    expect(heroFocusPercent({ focus: { desktop: 0.3 } }, "compact")).toBe(50);
  });
});

describe("heroNavTone", () => {
  it("scrims the chrome by day and lets it breathe by night", () => {
    expect(heroNavTone("day")).toBe("on-media");
    expect(heroNavTone("night")).toBe("on-media-night");
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

describe("heroIntroReady", () => {
  it("holds the lockup until the opening gate is spent", () => {
    expect(heroIntroReady(true)).toBe(false);
    expect(heroIntroReady(false)).toBe(true);
  });
});
