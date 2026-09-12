import { describe, expect, it } from "vitest";

import type { ResidencesContent } from "./Residences";

const sample: ResidencesContent = {
  eyebrow: "Residences",
  heading: "Eighteen homes, three plans.",
  empty: "No residences match.",
  residences: [
    {
      id: "a1",
      name: "A1",
      type: "Harbor",
      bedrooms: 2,
      area: "128 m²",
      status: "Available",
      imageSrc: "/a.jpg",
      imageAlt: "Harbor plan",
    },
    {
      id: "b1",
      name: "B1",
      type: "Garden",
      bedrooms: 3,
      area: "164 m²",
      status: "Reserved",
      imageSrc: "/b.jpg",
      imageAlt: "Garden plan",
    },
  ],
};

describe("residences", () => {
  it("exposes status in text and requires a schematic image", () => {
    expect(sample.residences.every((item) => item.status.length > 0)).toBe(true);
    expect(sample.residences.every((item) => item.imageAlt.length > 0)).toBe(true);
  });
});
