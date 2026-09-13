import { describe, expect, it } from "vitest";

import { hasVistaPlate, vistaCite } from "./logic";
import type { VistaContent } from "./types";

const sample: VistaContent = {
  quote:
    "Instead of corridors, walking paths connect the residences — making Aurelia feel closer to a group of private homes than a complex.",
  attribution: "Architecture Team",
  credit: "Aurelia Residences",
  imageSrc: "/hero/cam-05-alpha.webp",
  imageAlt: "A stone residence with flowering vines beside a still pool.",
};

describe("hasVistaPlate", () => {
  it("needs both the cutout and the sentence", () => {
    expect(hasVistaPlate(sample)).toBe(true);
    expect(hasVistaPlate({ ...sample, quote: "   " })).toBe(false);
    expect(hasVistaPlate({ ...sample, imageSrc: "" })).toBe(false);
  });
});

describe("vistaCite", () => {
  it("keeps the team line, then the house name when present", () => {
    expect(vistaCite(sample)).toEqual(["Architecture Team", "Aurelia Residences"]);
    expect(vistaCite({ attribution: "Architecture Team" })).toEqual(["Architecture Team"]);
  });
});
