import { describe, expect, it } from "vitest";

import {
  clampRotationMs,
  cycleWordIndex,
  DEFAULT_ROTATION_MS,
  formatCounter,
  MAX_INTERIOR_IMAGES,
  MAX_ROTATION_MS,
  MIN_ROTATION_MS,
  nextImageIndex,
  normaliseImages,
  previousImageIndex,
  splitGallery,
  wrapIndex,
} from "./logic";
import type { InteriorImage } from "./types";

function image(id: string, overrides: Partial<InteriorImage> = {}): InteriorImage {
  return {
    id,
    src: `https://images.example.com/${id}.jpg`,
    alt: `The ${id}.`,
    caption: `A caption for the ${id}.`,
    room: id,
    ...overrides,
  };
}

describe("wrapIndex", () => {
  it("leaves an in-range index alone", () => {
    expect(wrapIndex(3, 7)).toBe(3);
  });

  it("wraps past the end and before the start", () => {
    expect(wrapIndex(7, 7)).toBe(0);
    expect(wrapIndex(9, 7)).toBe(2);
    expect(wrapIndex(-1, 7)).toBe(6);
    expect(wrapIndex(-8, 7)).toBe(6);
  });

  it("falls back to zero for an empty list or a non-finite index", () => {
    expect(wrapIndex(2, 0)).toBe(0);
    expect(wrapIndex(Number.NaN, 7)).toBe(0);
  });
});

describe("lightbox paging", () => {
  it("steps forward and backward inside the list", () => {
    expect(nextImageIndex(2, 7)).toBe(3);
    expect(previousImageIndex(2, 7)).toBe(1);
  });

  it("wraps from the last image to the first", () => {
    expect(nextImageIndex(6, 7)).toBe(0);
  });

  it("wraps from the first image to the last", () => {
    expect(previousImageIndex(0, 7)).toBe(6);
  });

  it("stays put on a single image", () => {
    expect(nextImageIndex(0, 1)).toBe(0);
    expect(previousImageIndex(0, 1)).toBe(0);
  });

  it("returns a full cycle in each direction", () => {
    const forward: number[] = [];
    let index = 0;
    for (let step = 0; step < 4; step += 1) {
      index = nextImageIndex(index, 3);
      forward.push(index);
    }
    expect(forward).toEqual([1, 2, 0, 1]);

    const backward: number[] = [];
    index = 0;
    for (let step = 0; step < 4; step += 1) {
      index = previousImageIndex(index, 3);
      backward.push(index);
    }
    expect(backward).toEqual([2, 1, 0, 2]);
  });
});

describe("formatCounter", () => {
  it("zero pads both halves to two digits", () => {
    expect(formatCounter(2, 7)).toBe("03 / 07");
    expect(formatCounter(0, 7)).toBe("01 / 07");
    expect(formatCounter(6, 7)).toBe("07 / 07");
  });

  it("widens the padding once the total reaches three digits", () => {
    expect(formatCounter(4, 120)).toBe("005 / 120");
  });

  it("wraps an out-of-range index rather than printing it", () => {
    expect(formatCounter(7, 7)).toBe("01 / 07");
    expect(formatCounter(-1, 7)).toBe("07 / 07");
  });

  it("reads as empty when there is nothing to count", () => {
    expect(formatCounter(0, 0)).toBe("00 / 00");
  });
});

describe("cycleWordIndex", () => {
  it("advances through the list and wraps at the end", () => {
    expect(cycleWordIndex(0, 3)).toBe(1);
    expect(cycleWordIndex(1, 3)).toBe(2);
    expect(cycleWordIndex(2, 3)).toBe(0);
  });

  it("holds on a list of one word or none", () => {
    expect(cycleWordIndex(0, 1)).toBe(0);
    expect(cycleWordIndex(3, 0)).toBe(0);
  });
});

describe("clampRotationMs", () => {
  it("keeps a sensible interval", () => {
    expect(clampRotationMs(3000)).toBe(3000);
  });

  it("clamps intervals that are too quick to read or too slow to notice", () => {
    expect(clampRotationMs(200)).toBe(MIN_ROTATION_MS);
    expect(clampRotationMs(90000)).toBe(MAX_ROTATION_MS);
  });

  it("falls back to the default when unset or unusable", () => {
    expect(clampRotationMs()).toBe(DEFAULT_ROTATION_MS);
    expect(clampRotationMs(Number.NaN)).toBe(DEFAULT_ROTATION_MS);
  });
});

describe("normaliseImages", () => {
  it("leaves a valid list unchanged", () => {
    const images = [image("living"), image("kitchen")];
    expect(normaliseImages(images)).toEqual(images);
  });

  it("drops entries with no id or no source", () => {
    const images = [
      image("living"),
      image("", { src: "https://x/y.jpg" }),
      image("bath", { src: "  " }),
    ];
    expect(normaliseImages(images).map((entry) => entry.id)).toEqual(["living"]);
  });

  it("keeps the first of a repeated id", () => {
    const images = [image("living"), image("living", { room: "Second" })];
    const kept = normaliseImages(images);
    expect(kept).toHaveLength(1);
    expect(kept[0]?.room).toBe("living");
  });

  it("caps the list at the gallery maximum", () => {
    const images = Array.from({ length: 14 }, (_, index) => image(`shot-${index}`));
    expect(normaliseImages(images)).toHaveLength(MAX_INTERIOR_IMAGES);
    expect(normaliseImages(images, 3).map((entry) => entry.id)).toEqual([
      "shot-0",
      "shot-1",
      "shot-2",
    ]);
  });

  it("returns nothing when the cap is zero or negative", () => {
    expect(normaliseImages([image("living")], 0)).toEqual([]);
    expect(normaliseImages([image("living")], -2)).toEqual([]);
  });
});

describe("splitGallery", () => {
  it("puts the first image forward and the rest in the thumbnail row", () => {
    const images = [image("living"), image("kitchen"), image("bath")];
    const split = splitGallery(images);
    expect(split.primary?.id).toBe("living");
    expect(split.secondary.map((entry) => entry.id)).toEqual(["kitchen", "bath"]);
  });

  it("has no primary image for an empty list", () => {
    expect(splitGallery([])).toEqual({ primary: null, secondary: [] });
  });
});
