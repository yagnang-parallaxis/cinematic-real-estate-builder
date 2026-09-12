import { describe, expect, it } from "vitest";

import { clampTypes } from "./logic";
import type { ResidenceType, ResidenceTypesContent } from "./types";

const types: ResidenceType[] = [
  {
    id: "garden",
    name: "Garden residence",
    bedrooms: "3",
    areaRange: "128 – 148 m²",
    description: "A private basement and direct access to the shared garden.",
    imageSrc: "https://images.example.com/garden-type.jpg",
    cta: { label: "Explore garden residences", href: "/residences?type=garden" },
  },
  {
    id: "harbor",
    name: "Harbor residence",
    bedrooms: "2",
    areaRange: "97 – 104 m²",
    description: "Step onto a terrace that opens straight onto the water.",
    imageSrc: "https://images.example.com/harbor-type.jpg",
    cta: { label: "Explore harbor residences", href: "/residences?type=harbor" },
  },
];

const sample: ResidenceTypesContent = {
  eyebrow: "Residences",
  types,
};

describe("residence types content", () => {
  it("requires an eyebrow and at least one type", () => {
    expect(sample.eyebrow.length).toBeGreaterThan(0);
    expect(sample.types.length).toBeGreaterThan(0);
  });

  it("gives every type a name, bedrooms, area, description, image, and action", () => {
    for (const type of sample.types) {
      expect(type.name.length).toBeGreaterThan(0);
      expect(type.bedrooms.length).toBeGreaterThan(0);
      expect(type.areaRange.length).toBeGreaterThan(0);
      expect(type.description.length).toBeGreaterThan(0);
      expect(type.imageSrc.length).toBeGreaterThan(0);
      expect(type.cta.href.length).toBeGreaterThan(0);
    }
  });
});

describe("clampTypes", () => {
  it("leaves a short list unchanged", () => {
    expect(clampTypes(types)).toEqual(types);
  });

  it("keeps at most six types", () => {
    const extra: ResidenceType[] = Array.from({ length: 8 }, (_, index) => ({
      id: `type-${index}`,
      name: `Type ${index}`,
      bedrooms: "2",
      areaRange: "90 m²",
      description: "A residence type.",
      imageSrc: "https://images.example.com/type.jpg",
      cta: { label: "Explore", href: "/residences" },
    }));
    expect(clampTypes(extra)).toHaveLength(6);
  });
});
