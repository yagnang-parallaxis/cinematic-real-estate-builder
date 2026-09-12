import { describe, expect, it } from "vitest";

import {
  compactTypeNumerators,
  desktopTypeNumerators,
  fontFamilies,
  typeRoles,
  typeScale,
  typeScaleRatio,
} from "./typography";

describe("global typography tokens", () => {
  it("covers every design-system text role including accent", () => {
    expect(typeRoles).toEqual([
      "display",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "lead",
      "body",
      "label",
      "caption",
      "accent",
    ]);
  });

  it("pairs a condensed didone, an extended grotesque, and a script accent", () => {
    expect(fontFamilies.display).toBe("Italiana");
    expect(fontFamilies.body).toBe("Archivo");
    expect(fontFamilies.accent).toBe("Great Vibes");
  });

  it("keeps every heading on the display face at book weight", () => {
    for (const role of ["display", "h1", "h2", "h3", "h4", "h5", "h6"] as const) {
      expect(typeScale[role].font).toBe("display");
      expect(typeScale[role].weight).toBe(400);
      expect(typeScale[role].transform).toBe("uppercase");
    }
    expect(typeScale.display.tracking).toBe("-0.024em");
    expect(typeScale.h3.tracking).toBe("-0.016em");
    expect(typeScale.h5.tracking).toBe("0em");
  });

  it("uses the reference label and body tracking", () => {
    expect(typeScale.label).toMatchObject({
      font: "body",
      weight: 700,
      tracking: "0.048em",
      transform: "uppercase",
    });
    expect(typeScale.body).toMatchObject({
      font: "body",
      weight: 400,
      tracking: "-0.024em",
    });
  });

  it("uses a 16 / 4.16 fluid scale ratio", () => {
    expect(typeScaleRatio.desktop).toBe(16);
    expect(typeScaleRatio.compact).toBe(4.16);
    expect(desktopTypeNumerators.display / typeScaleRatio.desktop).toBe(12);
    expect(compactTypeNumerators.display / typeScaleRatio.compact).toBeCloseTo(23.0769, 3);
  });
});
