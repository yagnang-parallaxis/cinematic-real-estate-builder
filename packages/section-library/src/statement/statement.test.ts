import { describe, expect, it } from "vitest";

import { clampFigures, clampStatementLines, hasAccents, headingClass, isOverMedia } from "./logic";
import type { StatementContent } from "./types";

const base: StatementContent = {
  id: "sample",
  variant: "callout",
  tone: "light",
  lines: ["One", "Two"],
};

describe("clampStatementLines", () => {
  it("trims each line and drops the empty ones", () => {
    expect(clampStatementLines(["  a  ", "", "   ", "b"])).toEqual(["a", "b"]);
  });

  it("keeps at most four lines", () => {
    expect(clampStatementLines(["a", "b", "c", "d", "e"])).toEqual(["a", "b", "c", "d"]);
  });

  it("honours an explicit maximum", () => {
    expect(clampStatementLines(["a", "b", "c"], 2)).toEqual(["a", "b"]);
  });
});

describe("clampFigures", () => {
  it("returns an empty list when there are no figures", () => {
    expect(clampFigures(undefined)).toEqual([]);
  });

  it("drops figures missing a value or a label", () => {
    expect(
      clampFigures([
        { value: "18", label: "Residences" },
        { value: " ", label: "Nothing" },
        { value: "4", label: "  " },
      ]),
    ).toEqual([{ value: "18", label: "Residences" }]);
  });

  it("caps the row at four columns", () => {
    const many = Array.from({ length: 6 }, (_, index) => ({
      value: String(index),
      label: `label-${index}`,
    }));
    expect(clampFigures(many)).toHaveLength(4);
  });
});

describe("isOverMedia", () => {
  it("is true only for the panorama variant", () => {
    expect(isOverMedia("panorama")).toBe(true);
    expect(isOverMedia("callout")).toBe(false);
    expect(isOverMedia("figures")).toBe(false);
  });
});

describe("headingClass", () => {
  it("steps the heading tier down as the variant carries more content", () => {
    expect(headingClass("panorama")).toBe("t-display");
    expect(headingClass("callout")).toBe("t-h2");
    expect(headingClass("figures")).toBe("t-h3");
  });
});

describe("hasAccents", () => {
  it("is true for a callout that supplies at least one accent image", () => {
    expect(hasAccents({ ...base, imageSrc: "a.jpg" })).toBe(true);
    expect(hasAccents({ ...base, secondaryImageSrc: "b.jpg" })).toBe(true);
  });

  it("is false for a callout with no imagery", () => {
    expect(hasAccents(base)).toBe(false);
  });

  it("is false for other variants even when images are present", () => {
    expect(hasAccents({ ...base, variant: "panorama", imageSrc: "a.jpg" })).toBe(false);
  });
});
