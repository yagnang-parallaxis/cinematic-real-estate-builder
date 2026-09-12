import { describe, expect, it } from "vitest";

import {
  clampBeats,
  formatSlideLabel,
  nextIndex,
  prevIndex,
  slideProgress,
  swipeStep,
  wrapIndex,
} from "./logic";
import type { StoryBeat, StoryContent } from "./types";

const beats: StoryBeat[] = [
  {
    title: "The inlet first",
    body: "Rooms turn toward the water.",
    imageSrc: "https://images.example.com/inlet.jpg",
    imageAlt: "A living room facing still water.",
  },
  {
    title: "Eighteen residences, one tide",
    body: "Each home shares one material language.",
    imageSrc: "https://images.example.com/tide.jpg",
    imageAlt: "A street of houses rather than a tower.",
  },
  {
    title: "Quiet at the street",
    body: "The garden is kept for the people who live here.",
    imageSrc: "https://images.example.com/street.jpg",
    imageAlt: "A timber wall with a single opening.",
  },
];

const sample: StoryContent = {
  leftCaption: "North",
  rightCaption: "Coast",
  tagline: "A house to live in — and come back to.",
  heading: "Three reasons to return",
  headingLines: ["Three reasons", "to return"],
  caption: "Designed as a street of houses, not a stack of flats.",
  beats,
};

describe("story content", () => {
  it("requires flanking captions, a tagline, a heading, and at least two beats", () => {
    expect(sample.leftCaption.length).toBeGreaterThan(0);
    expect(sample.rightCaption.length).toBeGreaterThan(0);
    expect(sample.tagline.length).toBeGreaterThan(0);
    expect(sample.heading.length).toBeGreaterThan(0);
    expect(sample.beats.length).toBeGreaterThanOrEqual(2);
  });

  it("gives every beat its own title, body, and media", () => {
    for (const beat of sample.beats) {
      expect(beat.title.length).toBeGreaterThan(0);
      expect(beat.body.length).toBeGreaterThan(0);
      expect(beat.imageAlt.length).toBeGreaterThan(0);
    }
  });
});

describe("clampBeats", () => {
  it("keeps at most eight beats", () => {
    const extra: StoryBeat[] = Array.from({ length: 10 }, (_, index) => ({
      title: `Beat ${index}`,
      body: "Rooms turn toward the water.",
      imageSrc: "https://images.example.com/inlet.jpg",
      imageAlt: "A living room facing still water.",
    }));
    expect(clampBeats(extra)).toHaveLength(8);
  });

  it("leaves a short list unchanged", () => {
    expect(clampBeats(beats)).toEqual(beats);
  });
});

describe("wrapIndex", () => {
  it("wraps past the last slide back to the first", () => {
    expect(wrapIndex(3, 3)).toBe(0);
  });

  it("wraps before the first slide to the last", () => {
    expect(wrapIndex(-1, 3)).toBe(2);
  });

  it("returns 0 when there are no slides", () => {
    expect(wrapIndex(2, 0)).toBe(0);
  });
});

describe("nextIndex / prevIndex", () => {
  it("advances and wraps at the end", () => {
    expect(nextIndex(0, 3)).toBe(1);
    expect(nextIndex(2, 3)).toBe(0);
  });

  it("retreats and wraps at the start", () => {
    expect(prevIndex(2, 3)).toBe(1);
    expect(prevIndex(0, 3)).toBe(2);
  });
});

describe("formatSlideLabel", () => {
  it("pads the zero-based index to two digits", () => {
    expect(formatSlideLabel(0)).toBe("00");
    expect(formatSlideLabel(1)).toBe("01");
    expect(formatSlideLabel(9)).toBe("09");
  });
});

describe("slideProgress", () => {
  it("fills by the revealed slide, not the zero-based index", () => {
    expect(slideProgress(0, 3)).toBeCloseTo(100 / 3);
    expect(slideProgress(2, 3)).toBe(100);
  });

  it("is 0 when the list is empty", () => {
    expect(slideProgress(0, 0)).toBe(0);
  });
});

describe("swipeStep", () => {
  it("treats a left swipe as next", () => {
    expect(swipeStep(-80)).toBe(1);
  });

  it("treats a right swipe as previous", () => {
    expect(swipeStep(80)).toBe(-1);
  });

  it("ignores a short drag", () => {
    expect(swipeStep(12)).toBe(0);
  });
});
