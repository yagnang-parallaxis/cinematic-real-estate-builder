import { describe, expect, it } from "vitest";

import type { GalleryContent } from "./Gallery";

const sample: GalleryContent = {
  eyebrow: "Gallery",
  heading: "Rooms and the light they keep.",
  hint: "Drag to see more",
  items: [
    { src: "/a.jpg", alt: "Living room" },
    { src: "/b.jpg", alt: "Kitchen" },
  ],
};

describe("gallery", () => {
  it("requires at least two images with alt text", () => {
    expect(sample.items.length).toBeGreaterThanOrEqual(2);
    expect(sample.items.every((item) => item.alt.length > 0)).toBe(true);
  });
});
