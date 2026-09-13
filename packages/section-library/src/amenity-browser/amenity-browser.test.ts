import { describe, expect, it } from "vitest";

import {
  activeIndexFromProgress,
  arrowStep,
  clamp01,
  formatIndexLabel,
  indicatorFrame,
  panelDomId,
  pinProgress,
  pinTravel,
  progressForIndex,
  rovingIndex,
  scrollYForIndex,
  tabDomId,
} from "./logic";

const RANGE = { areaTop: 1000, areaHeight: 5000, viewportHeight: 1000 };
const COUNT = 5;

describe("clamp01", () => {
  it("passes values inside the range through", () => {
    expect(clamp01(0.37)).toBe(0.37);
  });

  it("clamps both ends", () => {
    expect(clamp01(-4)).toBe(0);
    expect(clamp01(0)).toBe(0);
    expect(clamp01(1)).toBe(1);
    expect(clamp01(9)).toBe(1);
  });

  it("treats an unmeasurable value as the start", () => {
    expect(clamp01(Number.NaN)).toBe(0);
    expect(clamp01(Number.POSITIVE_INFINITY)).toBe(1);
    expect(clamp01(Number.NEGATIVE_INFINITY)).toBe(0);
  });
});

describe("pinTravel", () => {
  it("is the area height less one viewport", () => {
    expect(pinTravel(5000, 1000)).toBe(4000);
  });

  it("is zero when the area is no taller than the viewport", () => {
    expect(pinTravel(800, 1000)).toBe(0);
    expect(pinTravel(1000, 1000)).toBe(0);
  });
});

describe("pinProgress", () => {
  it("is zero above and at the top of the pinned range", () => {
    expect(pinProgress({ ...RANGE, scrollY: 0 })).toBe(0);
    expect(pinProgress({ ...RANGE, scrollY: 1000 })).toBe(0);
  });

  it("is one at and past the end of the pinned range", () => {
    expect(pinProgress({ ...RANGE, scrollY: 5000 })).toBe(1);
    expect(pinProgress({ ...RANGE, scrollY: 40000 })).toBe(1);
  });

  it("reads linearly between the two", () => {
    expect(pinProgress({ ...RANGE, scrollY: 2000 })).toBeCloseTo(0.25, 10);
    expect(pinProgress({ ...RANGE, scrollY: 3000 })).toBeCloseTo(0.5, 10);
  });

  it("is zero when there is no travel to read", () => {
    expect(pinProgress({ areaTop: 0, areaHeight: 900, viewportHeight: 900, scrollY: 400 })).toBe(0);
  });
});

describe("activeIndexFromProgress", () => {
  it("selects the first panel at the start and the last at the end", () => {
    expect(activeIndexFromProgress(0, COUNT)).toBe(0);
    expect(activeIndexFromProgress(1, COUNT)).toBe(COUNT - 1);
  });

  it("gives every panel an equal band, with the boundary going to the band above", () => {
    expect(activeIndexFromProgress(0.199, COUNT)).toBe(0);
    expect(activeIndexFromProgress(0.2, COUNT)).toBe(1);
    expect(activeIndexFromProgress(0.399, COUNT)).toBe(1);
    expect(activeIndexFromProgress(0.4, COUNT)).toBe(2);
    expect(activeIndexFromProgress(0.799, COUNT)).toBe(3);
    expect(activeIndexFromProgress(0.8, COUNT)).toBe(4);
  });

  it("clamps progress that falls outside the range", () => {
    expect(activeIndexFromProgress(-2, COUNT)).toBe(0);
    expect(activeIndexFromProgress(6, COUNT)).toBe(COUNT - 1);
  });

  it("stays on the first index for degenerate counts", () => {
    expect(activeIndexFromProgress(0.5, 1)).toBe(0);
    expect(activeIndexFromProgress(0.5, 0)).toBe(0);
  });
});

describe("progressForIndex", () => {
  it("lands on the centre of each band", () => {
    expect(progressForIndex(0, COUNT)).toBeCloseTo(0.1, 10);
    expect(progressForIndex(4, COUNT)).toBeCloseTo(0.9, 10);
  });

  it("clamps an index outside the panel list", () => {
    expect(progressForIndex(-3, COUNT)).toBeCloseTo(0.1, 10);
    expect(progressForIndex(12, COUNT)).toBeCloseTo(0.9, 10);
    expect(progressForIndex(0, 0)).toBe(0);
  });
});

describe("scrollYForIndex", () => {
  it("round-trips back to the same index through the scroll math", () => {
    for (let index = 0; index < COUNT; index += 1) {
      const scrollY = scrollYForIndex(index, COUNT, RANGE);
      expect(activeIndexFromProgress(pinProgress({ ...RANGE, scrollY }), COUNT)).toBe(index);
    }
  });

  it("offsets from the top of the area by the band centre", () => {
    expect(scrollYForIndex(0, COUNT, RANGE)).toBe(1400);
    expect(scrollYForIndex(4, COUNT, RANGE)).toBe(4600);
  });

  it("returns the top of the area when there is no travel", () => {
    expect(scrollYForIndex(2, COUNT, { areaTop: 600, areaHeight: 700, viewportHeight: 900 })).toBe(
      600,
    );
  });
});

describe("rovingIndex", () => {
  it("steps within the list", () => {
    expect(rovingIndex(1, 1, COUNT)).toBe(2);
    expect(rovingIndex(3, -1, COUNT)).toBe(2);
  });

  it("wraps at both ends", () => {
    expect(rovingIndex(0, -1, COUNT)).toBe(COUNT - 1);
    expect(rovingIndex(COUNT - 1, 1, COUNT)).toBe(0);
  });

  it("wraps a step larger than the list", () => {
    expect(rovingIndex(0, 7, COUNT)).toBe(2);
    expect(rovingIndex(0, -7, COUNT)).toBe(3);
  });

  it("stays at zero with no panels", () => {
    expect(rovingIndex(2, 1, 0)).toBe(0);
  });
});

describe("arrowStep", () => {
  it("reads the vertical rail keys", () => {
    expect(arrowStep("ArrowUp", "vertical")).toBe(-1);
    expect(arrowStep("ArrowDown", "vertical")).toBe(1);
    expect(arrowStep("ArrowLeft", "vertical")).toBe(0);
  });

  it("reads the horizontal bar keys", () => {
    expect(arrowStep("ArrowLeft", "horizontal")).toBe(-1);
    expect(arrowStep("ArrowRight", "horizontal")).toBe(1);
    expect(arrowStep("ArrowDown", "horizontal")).toBe(0);
  });

  it("ignores anything else", () => {
    expect(arrowStep("Enter", "vertical")).toBe(0);
    expect(arrowStep("Tab", "horizontal")).toBe(0);
  });
});

describe("formatIndexLabel", () => {
  it("pads both halves to two digits", () => {
    expect(formatIndexLabel(0, COUNT)).toBe("01 / 05");
    expect(formatIndexLabel(4, COUNT)).toBe("05 / 05");
  });

  it("never counts past the total", () => {
    expect(formatIndexLabel(9, COUNT)).toBe("05 / 05");
  });
});

describe("indicatorFrame", () => {
  it("measures the tab against the rail", () => {
    const tab = { top: 240, left: 80, width: 160, height: 24 };
    const rail = { top: 200, left: 60, width: 400, height: 200 };
    expect(indicatorFrame(tab, rail)).toEqual({ x: 20, y: 40, width: 160, height: 24 });
  });

  it("adds the rail's own scroll so the indicator stays with the content", () => {
    const tab = { top: 240, left: 80, width: 160, height: 24 };
    const rail = { top: 200, left: 60, width: 400, height: 200 };
    expect(indicatorFrame(tab, rail, { x: 150, y: 0 })).toMatchObject({ x: 170, y: 40 });
  });
});

describe("dom ids", () => {
  it("pairs a tab with its panel", () => {
    expect(tabDomId("amenity-browser", "bath-house")).toBe("amenity-browser-tab-bath-house");
    expect(panelDomId("amenity-browser", "bath-house")).toBe("amenity-browser-panel-bath-house");
  });
});
