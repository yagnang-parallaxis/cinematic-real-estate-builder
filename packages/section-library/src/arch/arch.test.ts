import { describe, expect, it } from "vitest";

import {
  ARCH_CAP_GAP,
  ARCH_H_EASE,
  ARCH_H_FROM,
  ARCH_H_TO,
  ARCH_SCROLL_VH,
  ARCH_SETTLE,
  ARCH_SPREAD_REST,
  ARCH_STATIC_PROGRESS,
  ARCH_GLYPH_OVERHANG_EM,
  ARCH_TEXT_COVERAGE_OPEN,
  ARCH_TEXT_COVERAGE_REST,
  ARCH_TEXT_FILL,
  ARCH_TEXT_INSET_FALLBACK,
  ARCH_TEXT_RIDE_EM,
  ARCH_TEXT_SPAN,
  archCurveSize,
  archFullRadius,
  archGeometry,
  archHalfWidthAt,
  archInteriorTop,
  archNavTone,
  archPath,
  archRunWidth,
  archRunLengthForWidth,
  archSegmentHalfWidth,
  archSpreadRamp,
  archTextInset,
  archTextPath,
  archTextRun,
  archWordGaps,
  clampProgress,
  curvedTextOpacity,
  hidesHeroChrome,
  interiorOpacity,
  pinProgress,
  settleProgress,
} from "./logic";

const STAGE = { width: 1440, height: 900 };

describe("clampProgress", () => {
  it("passes a value already inside the range", () => {
    expect(clampProgress(0.42)).toBe(0.42);
  });

  it("clamps either end", () => {
    expect(clampProgress(-3)).toBe(0);
    expect(clampProgress(9)).toBe(1);
  });

  it("falls back to the start for a non-finite value", () => {
    expect(clampProgress(Number.NaN)).toBe(0);
  });
});

describe("pinProgress", () => {
  const viewport = 900;

  it("is nothing before the section reaches the top of the viewport", () => {
    expect(pinProgress({ top: 900, height: 1980 }, viewport)).toBe(0);
    expect(pinProgress({ top: 0, height: 1980 }, viewport)).toBe(0);
  });

  it("is complete once the section has given up its whole range", () => {
    expect(pinProgress({ top: -1080, height: 1980 }, viewport)).toBe(1);
    expect(pinProgress({ top: -5000, height: 1980 }, viewport)).toBe(1);
  });

  it("reads the midpoint of the range", () => {
    expect(pinProgress({ top: -540, height: 1980 }, viewport)).toBeCloseTo(0.5, 5);
  });

  it("has no range to scrub when the section is no taller than the viewport", () => {
    expect(pinProgress({ top: 10, height: 900 }, viewport)).toBe(0);
    expect(pinProgress({ top: 0, height: 900 }, viewport)).toBe(1);
    expect(pinProgress({ top: -1, height: 600 }, viewport)).toBe(1);
  });
});

describe("archSegmentHalfWidth", () => {
  it("starts from nothing, as the reference's dome does", () => {
    const r = archFullRadius(STAGE);
    expect(archSegmentHalfWidth(r, STAGE.height * ARCH_H_FROM) * 2).toBe(0);
  });

  it("spans the full stage once the visible height reaches the radius", () => {
    const r = archFullRadius(STAGE);
    expect(archSegmentHalfWidth(r, r) * 2).toBeCloseTo(STAGE.width, 5);
  });

  /*
   * The widths the reference was measured at, so the shape family is pinned to
   * something outside this file: at 1440×900 its dome is a circle of radius 720
   * and these are the widths it painted at the stage floor as its apex rose.
   *
   * Within 2.5px rather than exactly, because the probe reads the lowest row it
   * samples — a little above the true floor — so each measurement is a shade
   * narrower than the floor chord it stands for.
   */
  it("reproduces the reference's measured widths as the apex rises", () => {
    const measured: [visibleHeight: number, widthAtFloor: number][] = [
      [100, 730.4],
      [300, 1168.9],
      [500, 1370.8],
      [700, 1439.4],
    ];
    for (const [height, width] of measured) {
      const modelled = archSegmentHalfWidth(archFullRadius(STAGE), height) * 2;
      expect(Math.abs(modelled - width)).toBeLessThan(2.5);
    }
  });
});

describe("archHalfWidthAt", () => {
  it("is nothing above the apex", () => {
    const g = archGeometry(0.5, STAGE);
    const apexY = g.floorY - g.height;
    expect(archHalfWidthAt(g, apexY - 1)).toBe(0);
  });

  it("is the full radius below the circle's centre, where the sides are vertical", () => {
    const g = archGeometry(1, STAGE);
    expect(archHalfWidthAt(g, STAGE.height)).toBeCloseTo(g.rx, 5);
  });

  it("agrees with the segment width at the stage floor while the apex is above the centre", () => {
    const g = archGeometry(0.4, STAGE);
    expect(archHalfWidthAt(g, g.floorY)).toBeCloseTo(archSegmentHalfWidth(g.rx, g.height), 5);
  });
});

describe("archGeometry", () => {
  it("springs from the bottom centre of the stage", () => {
    const g = archGeometry(0.5, STAGE);
    expect(g.cx).toBe(720);
    expect(g.floorY).toBe(900);
  });

  it("starts from nothing, so the dome arrives with travel behind it", () => {
    const g = archGeometry(0, STAGE);
    const fullR = archFullRadius(STAGE);
    expect(g.extended).toBe(false);
    expect(g.rx).toBeCloseTo(fullR, 5);
    expect(g.ry).toBeCloseTo(fullR, 5);
    expect(g.height).toBe(0);
    expect(archSegmentHalfWidth(g.rx, g.height) * 2).toBe(0);
  });

  it("keeps the radius at half the stage width for the whole rise", () => {
    const fullR = archFullRadius(STAGE);
    for (let p = 0; p <= 1.0001; p += 0.05) {
      const g = archGeometry(p, STAGE);
      expect(g.rx).toBeCloseTo(fullR, 5);
      expect(g.ry).toBeCloseTo(fullR, 5);
    }
  });

  it("finishes with the apex at the top of the stage, over straight sides", () => {
    const g = archGeometry(1, STAGE);
    expect(ARCH_H_TO).toBe(1);
    expect(g.height).toBeCloseTo(STAGE.height * ARCH_H_TO, 5);
    expect(g.floorY - g.height).toBeCloseTo(0, 5);
    /* Past the circle's own centre, so the sides below it are vertical. */
    expect(g.extended).toBe(true);
    expect(archHalfWidthAt(g, STAGE.height) * 2).toBeCloseTo(STAGE.width, 5);
  });

  it("grows straight sides only once the apex passes the circle's centre", () => {
    const fullR = archFullRadius(STAGE);
    const before = archGeometry((fullR - 1) / STAGE.height, STAGE);
    const after = archGeometry((fullR + 1) / STAGE.height, STAGE);
    expect(before.extended).toBe(false);
    expect(after.extended).toBe(true);
  });

  it("keeps the apex on the stage rather than flattening off-screen", () => {
    const g = archGeometry(1, STAGE);
    const apexY = g.floorY - g.height;
    expect(g.height).toBeLessThanOrEqual(STAGE.height);
    expect(apexY).toBeGreaterThanOrEqual(0);
  });

  it("grows without ever going backwards", () => {
    let lastH = -1;
    for (let p = 0; p <= 1.0001; p += 0.1) {
      const g = archGeometry(p, STAGE);
      expect(g.height).toBeGreaterThanOrEqual(lastH);
      lastH = g.height;
    }
  });

  /*
   * The reference's dome translates at scroll speed, so its apex covers equal
   * distance for equal scroll. Any ease here would be an invention.
   */
  it("rises linearly, as a translation at scroll speed does", () => {
    expect(ARCH_H_EASE).toBe(1);
    for (const p of [0.25, 0.5, 0.75]) {
      expect(archGeometry(p, STAGE).height).toBeCloseTo(STAGE.height * p, 5);
    }
  });

  it("puts the whole rise into one viewport of scroll, and holds for the rest", () => {
    const scrubVh = ARCH_SCROLL_VH - 100;
    expect(ARCH_SETTLE * scrubVh).toBeCloseTo(100, 5);
    expect(scrubVh - 100).toBeGreaterThan(0);
  });

  it("clamps a progress value outside the range", () => {
    expect(archGeometry(-1, STAGE)).toEqual(archGeometry(0, STAGE));
    expect(archGeometry(4, STAGE)).toEqual(archGeometry(1, STAGE));
  });
});

describe("archPath", () => {
  it("draws a closed circular segment while the apex is above the centre", () => {
    const path = archPath(archGeometry(0.3, STAGE));
    expect(path).toMatch(/^M -?[\d.]+ 900 A [\d.]+ [\d.]+ 0 0 1 -?[\d.]+ 900 Z$/);
  });

  it("keeps side padding on the opening bump", () => {
    const g = archGeometry(0.1, STAGE);
    const path = archPath(g);
    const [, startX, , , , , , , , endX] = path.split(" ");
    expect(Number(startX)).toBeGreaterThan(STAGE.width * 0.2);
    expect(Number(endX)).toBeLessThan(STAGE.width * 0.8);
  });

  it("closes over the stage with straight sides at the end of the rise", () => {
    const g = archGeometry(1, STAGE);
    expect(g.extended).toBe(true);
    const path = archPath(g);
    /* The semicircular cap, then down each side to the floor. */
    expect(path).toContain(" L ");
    expect(path).toContain(`A ${g.rx} ${g.ry} 0 0 1`);
    expect(path.endsWith("Z")).toBe(true);
  });

  /* The two branches have to agree where they meet, or the shape jumps. */
  it("is continuous where the segment becomes a straight-sided arch", () => {
    const fullR = archFullRadius(STAGE);
    const before = archPath(archGeometry((fullR - 0.001) / STAGE.height, STAGE));
    const after = archPath(archGeometry((fullR + 0.001) / STAGE.height, STAGE));
    const leftEdge = (path: string) => Number((path.match(/-?[\d.]+/g) ?? [])[0]);
    expect(leftEdge(after)).toBeCloseTo(leftEdge(before), 1);
  });
});

describe("archTextPath", () => {
  it("is left to right over the top, so the lettering reads upright", () => {
    const g = archGeometry(0.55, STAGE);
    const parts = archTextPath(g, 40).split(" ");
    expect(Number(parts[1])).toBeLessThan(Number(parts[parts.length - 1]));
    expect(archTextPath(g, 40)).toContain(" 0 0 1 ");
  });

  it("is left open, since it carries lettering rather than a fill", () => {
    expect(archTextPath(archGeometry(0.55, STAGE), 40)).not.toContain("Z");
  });

  /*
   * The reference's lettering path measures the same arc at every frame of the
   * rise; what lengthens is the run along it. Ours used to grow the path and set
   * the run to it, which is what made the run's length a function of the dome
   * rather than of the copy.
   */
  it("spans the same arc at every frame, as the reference's does", () => {
    const early = archTextPath(archGeometry(0.2, STAGE), 40);
    const late = archTextPath(archGeometry(0.9, STAGE), 40);
    const span = (path: string) => {
      const numbers = (path.match(/-?[\d.]+/g) ?? []).map(Number);
      return numbers[numbers.length - 2]! - numbers[0]!;
    };
    expect(span(late)).toBeCloseTo(span(early), 5);
  });
});

describe("archWordGaps", () => {
  it("counts the joints the spread has to open", () => {
    expect(archWordGaps("Three reasons to return")).toBe(3);
    expect(archWordGaps("  Arrival  ")).toBe(0);
    expect(archWordGaps("")).toBe(0);
  });
});

describe("archTextInset", () => {
  /*
   * The margin the reference holds from the apex to the top of the caps: 61px
   * against a 720 radius, at every frame of its rise. It is the part of the
   * inset that belongs to the dome; the rest belongs to the font size, which is
   * why a fixed inset moved the lettering off the rim whenever the size changed.
   */
  it("holds the reference's cap margin whatever size the line is set at", () => {
    const g = archGeometry(1, STAGE);
    const radius = archFullRadius(STAGE);
    for (const fontSize of [26, 38, 47.6, 56.7]) {
      const capGap = archTextInset(g, fontSize) - fontSize * ARCH_TEXT_RIDE_EM;
      expect(capGap).toBeCloseTo(radius * ARCH_CAP_GAP, 5);
      expect(capGap).toBeCloseTo(61, 1);
    }
  });

  it("holds it through the rise, since the lettering circle is concentric", () => {
    for (const p of [0.3, 0.6, 1]) {
      expect(archTextInset(archGeometry(p, STAGE), 47.6)).toBeCloseTo(
        archTextInset(archGeometry(1, STAGE), 47.6),
        5,
      );
    }
  });

  it("scales with the stage, so a compact dome gets a proportional margin", () => {
    const compact = archGeometry(1, { width: 390, height: 844 });
    expect(archTextInset(compact, 23.5) - 23.5 * ARCH_TEXT_RIDE_EM).toBeLessThan(
      archTextInset(archGeometry(1, STAGE), 23.5) - 23.5 * ARCH_TEXT_RIDE_EM,
    );
  });

  it("leaves a lettering circle behind however large the type", () => {
    const g = archGeometry(1, { width: 320, height: 640 });
    expect(archTextInset(g, 400)).toBeLessThan(g.ry);
  });
});

describe("entry ramps", () => {
  it("holds the lettering back until there is curve to carry it", () => {
    expect(curvedTextOpacity(0)).toBe(0);
    expect(curvedTextOpacity(0.08)).toBe(0);
    expect(curvedTextOpacity(0.18)).toBeCloseTo(0.5, 5);
    expect(curvedTextOpacity(0.28)).toBe(1);
  });

  it("holds the interior back until the arc is nearly closed", () => {
    expect(interiorOpacity(0.7)).toBe(0);
    expect(interiorOpacity(0.8)).toBeCloseTo(0.5, 5);
    expect(interiorOpacity(0.88)).toBe(1);
  });
});

describe("archInteriorTop", () => {
  const inset = archTextInset(archGeometry(1, STAGE), 47.6);

  it("clears the lettering while the dome is only part way up", () => {
    const g = archGeometry(ARCH_STATIC_PROGRESS, STAGE);
    const apexY = g.floorY - g.height;
    expect(archInteriorTop(g, inset, STAGE.height)).toBeGreaterThan(apexY);
  });

  it("sits just under the lettering once the panel has closed", () => {
    const top = archInteriorTop(archGeometry(1, STAGE), inset, STAGE.height);
    expect(top).toBeGreaterThan(STAGE.height * 0.48);
    expect(top).toBeLessThan(STAGE.height * 0.58);
  });
});

describe("settleProgress", () => {
  it("finishes the rise before the scrub ends, so the closed arch holds", () => {
    expect(ARCH_SETTLE).toBeGreaterThan(0.5);
    expect(ARCH_SETTLE).toBeLessThan(1);
    expect(settleProgress(0)).toBe(0);
    expect(settleProgress(ARCH_SETTLE / 2)).toBeCloseTo(0.5, 5);
    expect(settleProgress(ARCH_SETTLE)).toBe(1);
    expect(settleProgress(1)).toBe(1);
  });

  /*
   * The pairing is what makes the apex travel at the reference's rate: one
   * viewport of scroll for one viewport of rise. Asserted together, because
   * changing either alone silently changes the rate.
   */
  it("moves the apex one stage height per stage height of scroll", () => {
    const stageHeight = STAGE.height;
    const scrub = ((ARCH_SCROLL_VH - 100) / 100) * stageHeight;
    for (const travelled of [0, 225, 450, 675, 900]) {
      const geometry = archGeometry(settleProgress(travelled / scrub), STAGE);
      expect(geometry.height).toBeCloseTo(travelled, 5);
    }
  });

  it("holds the closed dome for the rest of the scrub", () => {
    const scrub = ((ARCH_SCROLL_VH - 100) / 100) * STAGE.height;
    expect(scrub - STAGE.height).toBeCloseTo(450, 5);
    expect(archGeometry(settleProgress(1), STAGE).height).toBeCloseTo(STAGE.height, 5);
  });
});

describe("ARCH_SCROLL_VH", () => {
  it("leaves a viewport for the rise and a hold after it", () => {
    expect(ARCH_SCROLL_VH).toBeGreaterThan(200);
    expect(ARCH_SCROLL_VH).toBeLessThanOrEqual(280);
  });
});

describe("hidesHeroChrome", () => {
  it("leaves the CTA visible while the bump is still small", () => {
    expect(hidesHeroChrome(0)).toBe(false);
    expect(hidesHeroChrome(0.3)).toBe(false);
  });

  it("hides the foot chrome once the arc covers the lower stage", () => {
    expect(hidesHeroChrome(0.55)).toBe(true);
    expect(hidesHeroChrome(1)).toBe(true);
  });
});

describe("archNavTone", () => {
  it("keeps the chrome on the photograph for the whole rise on a landscape stage", () => {
    /*
     * The radius is half the width, so even with the apex at the top of the stage
     * the band is dome across its middle and photograph at both ends — which is
     * where the seal and the links are. Measured on the reference at that exact
     * frame: its corners are still photograph and its chrome does not flip.
     */
    for (const progress of [0, 0.2, 0.55, 0.9, 1]) {
      expect(archNavTone(archGeometry(progress, STAGE), STAGE)).toBe("on-media");
    }
  });

  it("turns to paper ink once the dome reaches the corners of the band", () => {
    /* Tall and narrow enough that a half-width radius does cover the band. */
    const tower = { width: 360, height: 1400 };
    expect(archNavTone(archGeometry(0, tower), tower)).toBe("on-media");
    expect(archNavTone(archGeometry(1, tower), tower)).toBe("on-color");
  });
});

describe("the static composition", () => {
  it("sits part way up, so both the dome and the photograph read", () => {
    expect(ARCH_STATIC_PROGRESS).toBeGreaterThan(0.3);
    expect(ARCH_STATIC_PROGRESS).toBeLessThan(0.7);
  });

  it("shows its lettering", () => {
    expect(curvedTextOpacity(ARCH_STATIC_PROGRESS)).toBe(1);
  });
});

/*
 * Measured off the live page at 1440×900 (`scripts/.arch-metrics`): Bodoni Moda
 * at the h3 tracking sets "Three reasons to return" in 14.368em. The number is
 * the whole reason this sizing exists — the reference's condensed Didone sets a
 * *longer* line in 8.39em, so the same tier is two different lines in the two
 * faces, and only one of them fits the dome at the reference's proportions.
 */
const COPY = { emWidth: 14.368, gaps: 3 };
/** Per-character cost of the same face, for copy no one has measured yet. */
const EM_PER_CHAR = 0.62;

/** The two tiers `arch.css` asks for, at a given viewport width. */
function tiers(width: number): { tokenSize: number; minSize: number } {
  const desktop = width >= 992;
  const unit = width / 100 / (desktop ? 16 : 4.16);
  return { tokenSize: (desktop ? 63 : 28) * unit, minSize: 28 * unit };
}

function fitAt(width: number, height: number, emWidth = COPY.emWidth) {
  const stage = { width, height };
  const geometry = archGeometry(1, stage);
  const metrics = { ...COPY, emWidth, ...tiers(width) };
  return { stage, geometry, metrics, run: archTextRun(geometry, metrics, 1) };
}

/** Widths the heading has to hold, from the narrowest phone to a wide desktop. */
const WIDTHS: [number, number][] = [
  [320, 640],
  [360, 780],
  [390, 844],
  [834, 1112],
  [991, 900],
  [992, 900],
  [1180, 820],
  [1440, 900],
  [1920, 1080],
];

describe("archCurveSize", () => {
  it("never renders above the tier the scale asked for", () => {
    for (const [width, height] of WIDTHS) {
      const { geometry, metrics } = fitAt(width, height);
      expect(archCurveSize(geometry, metrics)).toBeLessThanOrEqual(metrics.tokenSize + 1e-9);
    }
  });

  /*
   * The acceptance for P1-2. The reference's line covers 34% of its dome at rest
   * and 51% closed; ours covered 56–84% across the rise, because the size came
   * off the scale and the run came off the arc.
   */
  it("brings the desktop line inside the coverage the reference measures", () => {
    for (const [width, height] of [
      [992, 900],
      [1180, 820],
      [1440, 900],
      [1920, 1080],
    ] as [number, number][]) {
      const { geometry, run } = fitAt(width, height);
      const atRest = archTextRun(geometry, { ...COPY, ...tiers(width) }, 0);
      const coverage = (r: typeof run) =>
        archRunWidth(r.runLength, r.textRadius, r.fontSize!) / width;
      expect(
        archRunWidth(atRest.naturalLength, atRest.textRadius, atRest.fontSize!) / width,
      ).toBeCloseTo(ARCH_TEXT_COVERAGE_REST, 2);
      expect(coverage(run)).toBeCloseTo(ARCH_TEXT_COVERAGE_OPEN, 2);
      expect(coverage(run)).toBeLessThanOrEqual(0.55);
      expect(coverage(atRest)).toBeLessThan(coverage(run));
    }
  });

  it("holds the smallest tier on the scale where the arc has room for it", () => {
    for (const [width, height] of [
      [390, 844],
      [834, 1112],
    ] as [number, number][]) {
      const { geometry, metrics } = fitAt(width, height);
      /*
       * Coverage on its own would put a 390px dome at 13px: every bound in the
       * fit is scale-invariant, so the dome shrinks and the type with it, while
       * legibility does not scale. The floor is what stops that, and the arc
       * still outranks the floor.
       */
      expect(archCurveSize(geometry, metrics)).toBeGreaterThan(metrics.tokenSize * 0.85);
    }
  });
});

describe("archTextRun", () => {
  it("never squeezes the tracking, which is what P1-2 was", () => {
    for (const [width, height] of WIDTHS) {
      for (const chars of [12, 23, 40]) {
        const { geometry, metrics } = fitAt(width, height, chars * EM_PER_CHAR);
        for (const progress of [0, 0.25, ARCH_STATIC_PROGRESS, 0.75, 1]) {
          const run = archTextRun(geometry, metrics, progress);
          expect(run.wordSpacingEm).toBeGreaterThanOrEqual(0);
          expect(run.runLength).toBeGreaterThanOrEqual(run.naturalLength - 1e-9);
        }
      }
    }
  });

  /*
   * `textLength` is the fit of last resort, and setting it is what took the
   * tracking negative — at 834 it forced a 905px line into 621px. It has to stay
   * for copy no size on the scale can absorb, and stay out of the way otherwise.
   */
  it("leaves the run at its own width for copy the fit can size", () => {
    for (const [width, height] of WIDTHS) {
      for (const chars of [12, 23, 40]) {
        const { run } = fitAt(width, height, chars * EM_PER_CHAR);
        expect(run.forcedLength).toBeNull();
      }
    }
  });

  it("still forces a length rather than clip copy nothing can size", () => {
    const { run } = fitAt(390, 844, 200 * EM_PER_CHAR);
    expect(run.forcedLength).not.toBeNull();
    expect(run.forcedLength!).toBeLessThan(run.naturalLength);
  });

  it("keeps the run inside the path at every width and length", () => {
    for (const [width, height] of WIDTHS) {
      for (const chars of [12, 23, 40]) {
        const { run } = fitAt(width, height, chars * EM_PER_CHAR);
        const path = 2 * ARCH_TEXT_SPAN * run.textRadius;
        expect(run.runLength).toBeLessThanOrEqual(ARCH_TEXT_FILL * path + 1e-9);
      }
    }
  });

  it("opens the words as the dome rises, and stops at the reference's coverage", () => {
    const { geometry, metrics } = fitAt(1440, 900);
    const early = archTextRun(geometry, metrics, 0.2);
    const late = archTextRun(geometry, metrics, 1);
    expect(late.wordSpacingEm).toBeGreaterThan(early.wordSpacingEm);
    expect(late.fontSize).toBe(early.fontSize);
    expect(archRunWidth(late.runLength, late.textRadius, late.fontSize!) / 1440).toBeCloseTo(
      ARCH_TEXT_COVERAGE_OPEN,
      2,
    );
  });

  it("holds the line at its own width when the content asks for no spread", () => {
    const { geometry, metrics } = fitAt(1440, 900);
    const run = archTextRun(geometry, metrics, 1, 0);
    expect(run.wordSpacingEm).toBe(0);
    expect(run.runLength).toBeCloseTo(run.naturalLength, 5);
  });

  it("holds a sane spread when the content's multiplier is nonsense", () => {
    const { geometry, metrics } = fitAt(1440, 900);
    expect(archTextRun(geometry, metrics, 1, Number.NaN).runLength).toBeCloseTo(
      archTextRun(geometry, metrics, 1, 1).runLength,
      5,
    );
    expect(archTextRun(geometry, metrics, 1, 99).runLength).toBeCloseTo(
      archTextRun(geometry, metrics, 1, 1).runLength,
      5,
    );
  });

  it("has nothing to spread on a single word", () => {
    const { geometry, metrics } = fitAt(1440, 900);
    expect(archTextRun(geometry, { ...metrics, gaps: 0 }, 1).wordSpacingEm).toBe(0);
  });

  /* The only pose the server can render: no face measured, so no size derived. */
  it("falls back to setting the run to the arc before the face is measured", () => {
    const run = archTextRun(archGeometry(1, STAGE), null, ARCH_STATIC_PROGRESS);
    expect(run.fontSize).toBeNull();
    expect(run.forcedLength).not.toBeNull();
    expect(run.inset).toBeCloseTo(archFullRadius(STAGE) * ARCH_TEXT_INSET_FALLBACK, 5);
  });

  it("stops the words short of the rim", () => {
    expect(ARCH_TEXT_FILL).toBeGreaterThan(0.8);
    expect(ARCH_TEXT_FILL).toBeLessThan(1);
  });
});

describe("archSpreadRamp", () => {
  it("opens up as progress rises, from the reference's own resting gap", () => {
    expect(archSpreadRamp(0)).toBeCloseTo(ARCH_SPREAD_REST, 5);
    expect(archSpreadRamp(0.5)).toBeGreaterThan(archSpreadRamp(0));
    expect(archSpreadRamp(1)).toBe(1);
  });
});

describe("archRunWidth", () => {
  it("is the run plus its overhanging glyphs on a flat enough arc", () => {
    expect(archRunWidth(10, 100000, 0)).toBeCloseTo(10, 3);
    expect(archRunWidth(10, 100000, 40)).toBeCloseTo(10 + 40 * ARCH_GLYPH_OVERHANG_EM, 3);
  });

  it("reports no width once the run has wrapped past the equator", () => {
    expect(archRunWidth(1000, 100, 20)).toBe(Number.POSITIVE_INFINITY);
  });

  it("inverts archRunLengthForWidth", () => {
    expect(archRunWidth(archRunLengthForWidth(400, 600, 40), 600, 40)).toBeCloseTo(400, 5);
  });
});
