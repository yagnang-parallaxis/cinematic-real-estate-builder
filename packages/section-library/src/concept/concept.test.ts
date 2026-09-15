import { describe, expect, it } from "vitest";

import {
  CONCEPT_FLORAL_SLOTS,
  activePanelIndex,
  clamp01,
  clampIndex,
  floralAccentsForPanel,
  decorativeMediaShouldPlay,
  formatCount,
  labelAlign,
  labelPlacement,
  panelEntryProgress,
  pinnedScrollSpan,
  pinProgress,
  revealedWaypointCount,
  smoothApproach,
  stripIndex,
  textClearsViewportEdge,
  toPercent,
  trackTranslation,
} from "./logic";

const frame = {
  areaTop: 2000,
  areaHeight: 3800,
  viewportHeight: 1000,
  scrollY: 2000,
};

describe("clamp01", () => {
  it("holds the 0 and 1 boundaries", () => {
    expect(clamp01(-3)).toBe(0);
    expect(clamp01(0)).toBe(0);
    expect(clamp01(0.42)).toBe(0.42);
    expect(clamp01(1)).toBe(1);
    expect(clamp01(4)).toBe(1);
  });

  it("treats a non-finite value as no progress", () => {
    expect(clamp01(Number.NaN)).toBe(0);
    expect(clamp01(Number.POSITIVE_INFINITY)).toBe(1);
    expect(clamp01(Number.NEGATIVE_INFINITY)).toBe(0);
  });
});

describe("pinProgress", () => {
  it("is 0 the moment the screen pins", () => {
    expect(pinProgress(frame)).toBe(0);
  });

  it("is 0 before the area reaches the top of the viewport", () => {
    expect(pinProgress({ ...frame, scrollY: 0 })).toBe(0);
    expect(pinProgress({ ...frame, scrollY: 1999 })).toBe(0);
  });

  it("is 1 once the area's bottom edge reaches the viewport bottom", () => {
    expect(pinProgress({ ...frame, scrollY: 4800 })).toBe(1);
  });

  it("stays clamped past the end of the area", () => {
    expect(pinProgress({ ...frame, scrollY: 9000 })).toBe(1);
  });

  it("reads the midpoint of the pinned range", () => {
    expect(pinProgress({ ...frame, scrollY: 3400 })).toBeCloseTo(0.5);
  });

  it("is 0 when the area is no taller than the viewport", () => {
    expect(pinProgress({ ...frame, areaHeight: 1000, scrollY: 3000 })).toBe(0);
    expect(pinProgress({ ...frame, areaHeight: 400, scrollY: 3000 })).toBe(0);
  });
});

describe("trackTranslation", () => {
  const metrics = { trackWidth: 5760, viewportWidth: 1440 };

  it("does not move at the start of the range", () => {
    expect(trackTranslation(0, metrics)).toBe(0);
  });

  it("lands the last panel exactly on the screen at the end", () => {
    expect(trackTranslation(1, metrics)).toBe(-4320);
  });

  it("is linear across the range", () => {
    expect(trackTranslation(0.25, metrics)).toBe(-1080);
    expect(trackTranslation(0.5, metrics)).toBe(-2160);
  });

  it("clamps progress outside 0–1", () => {
    expect(trackTranslation(-1, metrics)).toBe(0);
    expect(trackTranslation(2, metrics)).toBe(-4320);
  });

  it("stays put when the track is not wider than the screen", () => {
    expect(trackTranslation(1, { trackWidth: 1200, viewportWidth: 1440 })).toBe(0);
  });
});

describe("activePanelIndex", () => {
  it("starts on the first panel and ends on the last", () => {
    expect(activePanelIndex(0, 4)).toBe(0);
    expect(activePanelIndex(1, 4)).toBe(3);
  });

  it("switches at the halfway point between two stops", () => {
    expect(activePanelIndex(0.16, 4)).toBe(0);
    expect(activePanelIndex(0.17, 4)).toBe(1);
    expect(activePanelIndex(0.5, 4)).toBe(2);
    expect(activePanelIndex(0.84, 4)).toBe(3);
  });

  it("clamps progress outside 0–1", () => {
    expect(activePanelIndex(-2, 4)).toBe(0);
    expect(activePanelIndex(9, 4)).toBe(3);
  });

  it("stays on the only panel when there is nothing to traverse", () => {
    expect(activePanelIndex(0.7, 1)).toBe(0);
    expect(activePanelIndex(0.7, 0)).toBe(0);
  });
});

describe("panelEntryProgress", () => {
  it("has the first panel already in place", () => {
    expect(panelEntryProgress(0, 4, 0)).toBe(1);
    expect(panelEntryProgress(0.5, 4, 0)).toBe(1);
  });

  it("runs 0 to 1 across the step before a panel settles", () => {
    expect(panelEntryProgress(0, 4, 2)).toBe(0);
    expect(panelEntryProgress(1 / 3, 4, 2)).toBe(0);
    expect(panelEntryProgress(0.5, 4, 2)).toBeCloseTo(0.5);
    expect(panelEntryProgress(2 / 3, 4, 2)).toBeCloseTo(1);
  });

  it("stays at 1 once the panel has passed", () => {
    expect(panelEntryProgress(0.9, 4, 2)).toBe(1);
    expect(panelEntryProgress(1, 4, 2)).toBe(1);
  });

  it("reaches 1 for the last panel only at the end of the range", () => {
    expect(panelEntryProgress(0.99, 4, 3)).toBeCloseTo(0.97);
    expect(panelEntryProgress(1, 4, 3)).toBe(1);
  });

  it("treats a single panel as always in place", () => {
    expect(panelEntryProgress(0, 1, 0)).toBe(1);
  });
});

describe("revealedWaypointCount", () => {
  it("reveals nothing before the panel starts arriving", () => {
    expect(revealedWaypointCount(0, 6)).toBe(0);
  });

  it("reveals one waypoint at a time", () => {
    expect(revealedWaypointCount(0.1, 6)).toBe(1);
    expect(revealedWaypointCount(0.3, 6)).toBe(3);
    expect(revealedWaypointCount(0.5, 6)).toBe(4);
  });

  it("has every waypoint out before the panel finishes settling", () => {
    expect(revealedWaypointCount(0.85, 6)).toBe(6);
    expect(revealedWaypointCount(1, 6)).toBe(6);
  });

  it("never exceeds the waypoint count", () => {
    expect(revealedWaypointCount(2, 6)).toBe(6);
  });

  it("reveals everything at once when the span is empty", () => {
    expect(revealedWaypointCount(0, 6, 0)).toBe(6);
  });

  it("is 0 when there are no waypoints", () => {
    expect(revealedWaypointCount(0.5, 0)).toBe(0);
  });
});

describe("pinnedScrollSpan", () => {
  it("gives the four-panel traverse close to three viewport heights", () => {
    expect(pinnedScrollSpan(4)).toBeCloseTo(2.8);
  });

  it("keeps a floor so a short section still reads as pinned", () => {
    expect(pinnedScrollSpan(1)).toBe(1.5);
    expect(pinnedScrollSpan(0)).toBe(1.5);
  });
});

describe("smoothApproach", () => {
  it("moves a fixed fraction of the way toward the target", () => {
    expect(smoothApproach(0, 1, 0.25)).toBe(0.25);
    expect(smoothApproach(0.5, 0, 0.5)).toBe(0.25);
  });

  it("snaps to the target once the remaining gap is imperceptible", () => {
    expect(smoothApproach(0.99999, 1, 0.5)).toBe(1);
  });

  it("jumps straight to the target at full strength", () => {
    expect(smoothApproach(0, 1, 1)).toBe(1);
    expect(smoothApproach(0.3, 0.9, 1.4)).toBe(0.9);
  });

  it("holds still at zero strength", () => {
    expect(smoothApproach(0.3, 1, 0)).toBe(0.3);
    expect(smoothApproach(0.3, 1, -1)).toBe(0.3);
  });
});

describe("clampIndex", () => {
  it("keeps an index inside the panel range", () => {
    expect(clampIndex(-1, 4)).toBe(0);
    expect(clampIndex(2, 4)).toBe(2);
    expect(clampIndex(4, 4)).toBe(3);
  });

  it("is 0 when there are no panels", () => {
    expect(clampIndex(2, 0)).toBe(0);
  });
});

describe("stripIndex", () => {
  it("snaps to the nearest panel", () => {
    expect(stripIndex(0, 390, 4)).toBe(0);
    expect(stripIndex(200, 390, 4)).toBe(1);
    expect(stripIndex(780, 390, 4)).toBe(2);
  });

  it("clamps past the last panel and before the first", () => {
    expect(stripIndex(4000, 390, 4)).toBe(3);
    expect(stripIndex(-40, 390, 4)).toBe(0);
  });

  it("is 0 before the strip has been measured", () => {
    expect(stripIndex(300, 0, 4)).toBe(0);
    expect(stripIndex(300, 390, 0)).toBe(0);
  });
});

describe("labelPlacement", () => {
  it("alternates sides of the route", () => {
    expect(labelPlacement(0)).toBe("above");
    expect(labelPlacement(1)).toBe("below");
    expect(labelPlacement(4)).toBe("above");
  });
});

describe("labelAlign", () => {
  it("turns the end labels inward", () => {
    expect(labelAlign(62, 1200)).toBe("start");
    expect(labelAlign(1138, 1200)).toBe("end");
  });

  it("centres everything in between", () => {
    expect(labelAlign(452, 1200)).toBe("center");
    expect(labelAlign(900, 1200)).toBe("center");
  });

  it("centres when the plot has no width", () => {
    expect(labelAlign(452, 0)).toBe("center");
  });
});

describe("toPercent", () => {
  it("maps a user-space coordinate onto the plot", () => {
    expect(toPercent(600, 1200)).toBe(50);
    expect(toPercent(0, 1200)).toBe(0);
    expect(toPercent(420, 420)).toBe(100);
  });

  it("is 0 when the extent is unknown", () => {
    expect(toPercent(600, 0)).toBe(0);
  });
});

describe("formatCount", () => {
  it("pads the counter to two digits", () => {
    expect(formatCount(1)).toBe("01");
    expect(formatCount(4)).toBe("04");
    expect(formatCount(12)).toBe("12");
  });
});

describe("floralAccentsForPanel", () => {
  const floral = {
    introTopLeft: "/flowers/a.webm",
    introBottomRight: "/flowers/b.webm",
    betweenBottomRight: "/flowers/d.webm",
    routeTopRight: "/flowers/c.webm",
  };

  it("keeps a bush on each track join, plus the two hanging corners", () => {
    expect(CONCEPT_FLORAL_SLOTS).toHaveLength(4);
    expect(floralAccentsForPanel(floral, "intro")).toEqual([
      { place: "intro-top-left", corner: "top-left", src: "/flowers/a.webm" },
    ]);
    expect(floralAccentsForPanel(floral, "seam")).toEqual([
      { place: "intro-bottom-right", corner: "bottom-right", src: "/flowers/b.webm" },
      { place: "between-bottom-right", corner: "bottom-right", src: "/flowers/d.webm" },
    ]);
    expect(floralAccentsForPanel(floral, "route")).toEqual([
      { place: "route-top-right", corner: "top-right", src: "/flowers/c.webm" },
    ]);
  });

  it("leaves the between panel bare", () => {
    expect(floralAccentsForPanel(floral, "between")).toEqual([]);
  });

  it("omits a seat when that clip is not authored", () => {
    expect(floralAccentsForPanel({ introTopLeft: "/flowers/a.webm" }, "intro")).toEqual([
      { place: "intro-top-left", corner: "top-left", src: "/flowers/a.webm" },
    ]);
    expect(floralAccentsForPanel(undefined, "intro")).toEqual([]);
  });
});

describe("decorativeMediaShouldPlay", () => {
  it("plays only while the clip has a visible box", () => {
    expect(decorativeMediaShouldPlay(true, 0.4)).toBe(true);
    expect(decorativeMediaShouldPlay(true, 0)).toBe(false);
    expect(decorativeMediaShouldPlay(false, 0.9)).toBe(false);
  });
});

describe("textClearsViewportEdge", () => {
  it("rejects copy that meets either viewport edge", () => {
    expect(textClearsViewportEdge({ left: 0, right: 400 }, 1440, 208)).toBe(false);
    expect(textClearsViewportEdge({ left: 1200, right: 1440 }, 1440, 208)).toBe(false);
  });

  it("accepts copy that sits inside the chrome columns", () => {
    expect(textClearsViewportEdge({ left: 208, right: 1232 }, 1440, 208)).toBe(true);
    expect(textClearsViewportEdge({ left: 98, right: 292 }, 390, 98)).toBe(true);
  });
});
