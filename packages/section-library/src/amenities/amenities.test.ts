import { describe, expect, it } from "vitest";

import { clampScenes } from "./logic";
import type { AmenitiesContent, AmenityScene } from "./types";

const scenes: AmenityScene[] = [
  {
    id: "garden",
    caption: "A garden of its own",
    imageSrc: "https://images.example.com/garden.jpg",
    hotspots: [
      { id: "old-tree", label: "Built around what was already there", description: "The plan was drawn after the tree.", x: 40, y: 60 },
    ],
  },
  {
    id: "pool",
    caption: "Where evenings gather",
    imageSrc: "https://images.example.com/pool.jpg",
  },
  {
    id: "living",
    caption: "Light, kept for the mornings",
    imageSrc: "https://images.example.com/living.jpg",
  },
];

const sample: AmenitiesContent = {
  eyebrow: "A life, considered",
  heading: "Every day, somewhere to be.",
  scenes,
};

describe("amenities content", () => {
  it("requires an eyebrow, a heading, and at least one scene", () => {
    expect(sample.eyebrow.length).toBeGreaterThan(0);
    expect(sample.heading.length).toBeGreaterThan(0);
    expect(sample.scenes.length).toBeGreaterThan(0);
  });

  it("gives every scene a caption and a background image", () => {
    for (const scene of sample.scenes) {
      expect(scene.caption.length).toBeGreaterThan(0);
      expect(scene.imageSrc.length).toBeGreaterThan(0);
    }
  });
});

describe("clampScenes", () => {
  it("leaves a short list unchanged", () => {
    expect(clampScenes(scenes)).toEqual(scenes);
  });

  it("keeps at most six scenes", () => {
    const extra: AmenityScene[] = Array.from({ length: 9 }, (_, index) => ({
      id: `scene-${index}`,
      caption: `Scene ${index}`,
      imageSrc: "https://images.example.com/scene.jpg",
    }));
    expect(clampScenes(extra)).toHaveLength(6);
  });
});
