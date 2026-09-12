import { describe, expect, it } from "vitest";

import type { StoryContent } from "./Storytelling";

const sample: StoryContent = {
  eyebrow: "The plot",
  heading: "A house that keeps the weather in the rooms.",
  imageSrc: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
  imageAlt: "A double-height living room with timber, stone, and a tall window.",
  beats: [
    { title: "The inlet first", body: "Rooms turn toward the water." },
    { title: "One tide", body: "Eighteen residences share one material language." },
  ],
};

describe("storytelling", () => {
  it("requires persistent media and at least two narrative beats", () => {
    expect(sample.imageAlt.length).toBeGreaterThan(0);
    expect(sample.heading.length).toBeGreaterThan(0);
    expect(sample.beats.length).toBeGreaterThanOrEqual(2);
  });
});
