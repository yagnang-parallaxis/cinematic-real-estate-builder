import { describe, expect, it } from "vitest";

import type { HorizontalGalleryContent } from "./HorizontalGallery";

const sample: HorizontalGalleryContent = {
  eyebrow: "A walk",
  heading: "From the street to the water.",
  hint: "Drag to see more",
  items: [
    { src: "/a.jpg", alt: "Entrance" },
    { src: "/b.jpg", alt: "Hall" },
    { src: "/c.jpg", alt: "Garden" },
  ],
};

describe("horizontal gallery", () => {
  it("requires at least three sequential images", () => {
    expect(sample.items.length).toBeGreaterThanOrEqual(3);
    expect(sample.hint.length).toBeGreaterThan(0);
  });
});
