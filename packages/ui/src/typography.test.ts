import { describe, expect, it } from "vitest";

import { fontFamilies, typeRoles, typeScale } from "./typography";

describe("global typography tokens", () => {
  it("covers every design-system text role", () => {
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
    ]);
  });

  it("pairs a display serif with a body sans", () => {
    expect(fontFamilies.display).toBe("Cormorant Garamond");
    expect(fontFamilies.body).toBe("Outfit");
  });

  it("defines scale metadata for every role", () => {
    for (const role of typeRoles) {
      expect(typeScale[role].weight).toBeGreaterThan(0);
      expect(typeScale[role].font).toMatch(/display|body/);
    }
  });
});
