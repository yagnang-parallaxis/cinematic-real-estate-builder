import { describe, expect, it } from "vitest";

import {
  CURTAIN_HOLD_MS,
  CURTAIN_OPEN_AT,
  CURTAIN_PLAY_MS,
  CURTAIN_RUN_COMPACT_SVH,
  CURTAIN_RUN_SVH,
  CURTAIN_STATIC_PROGRESS,
  curtainArchPath,
  curtainFrameOut,
  curtainGrowth,
  curtainLockupOut,
  curtainNavTone,
  curtainOpening,
  curtainPlatePath,
  curtainPlayProgress,
  curtainRingOffset,
  curtainRingOpacity,
  curtainRunSvh,
  curtainSpent,
  curtainTaglineOut,
  curtainWindow,
} from "./curtain";

const STAGE = { width: 1440, height: 900 };
const COMPACT = { width: 390, height: 844 };

describe("curtainRunSvh", () => {
  it("gives a pointer screen two viewports and a phone less", () => {
    expect(curtainRunSvh("desktop")).toBe(CURTAIN_RUN_SVH);
    expect(curtainRunSvh("compact")).toBe(CURTAIN_RUN_COMPACT_SVH);
    expect(curtainRunSvh("compact")).toBeLessThan(curtainRunSvh("desktop"));
  });
});

describe("curtainGrowth / curtainOpening", () => {
  it("splits the pin into a rise and a shoulder phase", () => {
    expect(curtainGrowth(0)).toBe(0);
    expect(curtainGrowth(CURTAIN_OPEN_AT)).toBe(1);
    expect(curtainGrowth(1)).toBe(1);

    expect(curtainOpening(0)).toBe(0);
    expect(curtainOpening(CURTAIN_OPEN_AT)).toBe(0);
    expect(curtainOpening(1)).toBe(1);
  });

  it("clamps rather than extrapolating outside the pin", () => {
    expect(curtainGrowth(-3)).toBe(0);
    expect(curtainOpening(4)).toBe(1);
    expect(curtainGrowth(Number.NaN)).toBe(0);
  });
});

describe("curtainWindow", () => {
  it("has nothing cut out of the plate before the pin starts", () => {
    const start = curtainWindow(0, STAGE);
    expect(start.width).toBe(0);
    expect(start.height).toBe(0);
    expect(start.top).toBe(STAGE.height);
  });

  it("opens as a doorway — taller than it is wide — standing on the floor", () => {
    const early = curtainWindow(0.2, STAGE);
    expect(early.height).toBeGreaterThan(early.width);
    expect(early.width).toBeLessThan(STAGE.width * 0.1);
    expect(early.side).toBeGreaterThan(0);
    /* Standing on the floor: apex plus height accounts for the whole stage. */
    expect(early.top + early.height).toBeCloseTo(STAGE.height, 5);
  });

  it("is still well short of the stage edges half way through the pin", () => {
    /*
     * The reference doorway is under half the stage width deep into its rise.
     * A rise that is already near full bleed at the midpoint spends the rest of
     * the pin with nothing left to reveal.
     */
    const mid = curtainWindow(0.5, STAGE);
    expect(mid.width).toBeLessThan(STAGE.width * 0.45);
  });

  it("is full bleed with no cap left at the end of the pin", () => {
    const end = curtainWindow(1, STAGE);
    expect(end.side).toBe(0);
    expect(end.top).toBe(0);
    expect(end.width).toBeCloseTo(STAGE.width, 5);
    expect(end.height).toBeCloseTo(STAGE.height, 5);
    expect(end.radius).toBeCloseTo(0, 5);
  });

  it("grows monotonically and never overruns the stage", () => {
    let previous = -1;
    for (let step = 0; step <= 20; step += 1) {
      const win = curtainWindow(step / 20, STAGE);
      expect(win.width).toBeGreaterThanOrEqual(previous);
      expect(win.width).toBeLessThanOrEqual(STAGE.width + 0.001);
      expect(win.height).toBeLessThanOrEqual(STAGE.height + 0.001);
      previous = win.width;
    }
  });

  it("keeps a true semicircular cap while the arch is rising", () => {
    const mid = curtainWindow(0.4, STAGE);
    expect(mid.radius).toBeCloseTo(mid.width / 2, 5);
  });

  it("caps the radius on a stage too short to carry it", () => {
    const squat = curtainWindow(0.5, { width: 1600, height: 90 });
    expect(squat.radius).toBeLessThanOrEqual(squat.height + 0.001);
  });

  it("holds the shape at a narrow viewport too", () => {
    const end = curtainWindow(1, COMPACT);
    expect(end.side).toBe(0);
    expect(end.radius).toBeCloseTo(0, 5);
  });
});

describe("curtainArchPath", () => {
  it("opens at the stage floor so the plate can close it", () => {
    const path = curtainArchPath(curtainWindow(0.3, STAGE), STAGE);
    expect(path.startsWith("M ")).toBe(true);
    expect(path).toContain(` ${STAGE.height}`);
    expect(path).toContain(" A ");
  });

  it("drops the arc rather than drawing a zero radius", () => {
    const path = curtainArchPath(curtainWindow(1, STAGE), STAGE);
    expect(path).not.toContain(" A ");
  });

  it("offsets outward without letting the cap exceed the half width", () => {
    const win = curtainWindow(0.35, STAGE);
    const offset = curtainRingOffset(win, STAGE);
    const ring = curtainArchPath(win, STAGE, offset);
    /* The outline starts further left than the hole it surrounds. */
    const holeLeft = Number(curtainArchPath(win, STAGE).split(" ")[1]);
    expect(Number(ring.split(" ")[1])).toBeLessThan(holeLeft);
  });
});

describe("curtainPlatePath", () => {
  it("is the whole stage with the arch subtracted", () => {
    const plate = curtainPlatePath(curtainWindow(0.3, STAGE), STAGE);
    expect(plate.startsWith("M 0 0 H 1440 V 900 H 0 Z")).toBe(true);
    /* Two closed subpaths, so `evenodd` has something to subtract. */
    expect(plate.match(/Z/g)).toHaveLength(2);
  });
});

describe("curtainRingOffset", () => {
  it("never traces a gap wider than the doorway it surrounds", () => {
    const early = curtainWindow(0.15, STAGE);
    expect(curtainRingOffset(early, STAGE)).toBeLessThan(early.width);
  });

  it("settles on the stage gap once the arch can carry it", () => {
    const open = curtainWindow(0.7, STAGE);
    expect(curtainRingOffset(open, STAGE)).toBe(Math.round(STAGE.width * 0.026));
  });
});

describe("curtain fades", () => {
  it("brings the outline in after the doorway and takes it out with the shoulders", () => {
    expect(curtainRingOpacity(0)).toBe(0);
    expect(curtainRingOpacity(0.3)).toBe(1);
    expect(curtainRingOpacity(1)).toBe(0);
  });

  it("takes the wordmark out early and the plate's frame out late", () => {
    expect(curtainLockupOut(0)).toBe(0);
    expect(curtainLockupOut(0.36)).toBe(1);
    expect(curtainFrameOut(0.36)).toBe(0);
    expect(curtainFrameOut(1)).toBe(1);
    /* The wordmark must be gone before the captions start to go. */
    expect(curtainLockupOut(0.5)).toBeGreaterThan(curtainFrameOut(0.5));
  });

  it("takes the tagline out ahead of the wordmark it shares a centre line with", () => {
    expect(curtainTaglineOut(0)).toBe(0);
    expect(curtainTaglineOut(0.12)).toBeGreaterThan(curtainLockupOut(0.12));
    expect(curtainTaglineOut(0.22)).toBe(1);
  });

  it("has every fade complete by the end of the pin", () => {
    expect(curtainLockupOut(1)).toBe(1);
    expect(curtainTaglineOut(1)).toBe(1);
    expect(curtainFrameOut(1)).toBe(1);
  });
});

describe("curtainSpent", () => {
  it("is spent only once the arch is full bleed", () => {
    expect(curtainSpent(0.999)).toBe(false);
    expect(curtainSpent(1)).toBe(true);
  });
});

describe("curtainPlayProgress", () => {
  it("holds closed so the branded plate can be read, then opens on time not scroll", () => {
    expect(CURTAIN_HOLD_MS).toBeGreaterThanOrEqual(400);
    expect(CURTAIN_PLAY_MS).toBeGreaterThanOrEqual(2000);
    expect(curtainPlayProgress({ elapsedMs: 0 })).toBe(0);
    expect(curtainPlayProgress({ elapsedMs: CURTAIN_HOLD_MS - 1 })).toBe(0);
    expect(curtainPlayProgress({ elapsedMs: CURTAIN_HOLD_MS })).toBe(0);
  });

  it("reaches full bleed at the end of the play window", () => {
    expect(curtainPlayProgress({ elapsedMs: CURTAIN_HOLD_MS + CURTAIN_PLAY_MS })).toBe(1);
    expect(curtainPlayProgress({ elapsedMs: 99999 })).toBe(1);
  });

  it("moves through the rise in the middle of the play window", () => {
    const mid = curtainPlayProgress({
      elapsedMs: CURTAIN_HOLD_MS + CURTAIN_PLAY_MS / 2,
    });
    expect(mid).toBeGreaterThan(0.2);
    expect(mid).toBeLessThan(0.8);
  });

  it("clamps rather than extrapolating, and survives a zero window", () => {
    expect(curtainPlayProgress({ elapsedMs: -40 })).toBe(0);
    expect(curtainPlayProgress({ elapsedMs: Number.NaN })).toBe(0);
    expect(curtainPlayProgress({ elapsedMs: 50, holdMs: 0, playMs: 0 })).toBe(1);
  });

  it("under reduced motion skips the rise so the gate cannot linger as a screen", () => {
    expect(curtainPlayProgress({ elapsedMs: 0, calm: true })).toBe(1);
    expect(curtainPlayProgress({ elapsedMs: 10, calm: true })).toBe(1);
  });
});

describe("curtainNavTone", () => {
  it("reads against the plate until the arch reaches the chrome band", () => {
    expect(curtainNavTone(curtainWindow(0, STAGE), STAGE)).toBe("on-dark");
    expect(curtainNavTone(curtainWindow(0.6, STAGE), STAGE)).toBe("on-dark");
    expect(curtainNavTone(curtainWindow(1, STAGE), STAGE)).toBe("on-media");
  });

  it("flips before the arch is full bleed, so the chrome is never left behind", () => {
    const flip = [0.8, 0.85, 0.9, 0.95].map((p) =>
      curtainNavTone(curtainWindow(p, STAGE), STAGE),
    );
    expect(flip).toContain("on-media");
  });
});

describe("CURTAIN_STATIC_PROGRESS", () => {
  it("parks the arch open enough to read as a window, short of full bleed", () => {
    const parked = curtainWindow(CURTAIN_STATIC_PROGRESS, STAGE);
    expect(parked.width).toBeGreaterThan(STAGE.width * 0.4);
    expect(parked.width).toBeLessThan(STAGE.width);
    expect(parked.side).toBeGreaterThan(0);
    expect(parked.radius).toBeCloseTo(parked.width / 2, 5);
  });
});
