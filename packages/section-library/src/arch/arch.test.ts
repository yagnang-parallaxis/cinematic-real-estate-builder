import { describe, expect, it } from "vitest";

import {
  ARCH_H_EASE,
  ARCH_H_FROM,
  ARCH_H_TO,
  ARCH_CARRY_S,
  ARCH_HANDOFF,
  ARCH_SCROLL_VH,
  ARCH_SETTLE,
  ARCH_STATIC_PROGRESS,
  archFullRadius,
  archGeometry,
  archInteriorTop,
  archPath,
  archSegmentHalfWidth,
  archTextInset,
  archTextPath,
  capOpacity,
  clampProgress,
  coversStage,
  curvedTextOpacity,
  archNavTone,
  hidesHeroChrome,
  curvedWordSpacingEm,
  interiorOpacity,
  pinProgress,
  settleProgress,
  shouldHandoff,
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
  it("gives a padded opening bump around 45% of the stage width", () => {
    const r = archFullRadius(STAGE);
    const h = STAGE.height * ARCH_H_FROM;
    const width = archSegmentHalfWidth(r, h) * 2;
    expect(width / STAGE.width).toBeGreaterThan(0.4);
    expect(width / STAGE.width).toBeLessThan(0.55);
  });

  it("spans the full stage once the visible height reaches the radius", () => {
    const r = archFullRadius(STAGE);
    expect(archSegmentHalfWidth(r, r) * 2).toBeCloseTo(STAGE.width, 5);
  });
});

describe("archGeometry", () => {
  it("springs from the bottom centre of the stage", () => {
    const g = archGeometry(0.5, STAGE);
    expect(g.cx).toBe(720);
    expect(g.floorY).toBe(900);
  });

  it("starts as a padded slice of the full-width circle", () => {
    const g = archGeometry(0, STAGE);
    const fullR = archFullRadius(STAGE);
    expect(g.extended).toBe(false);
    expect(g.rx).toBeCloseTo(fullR, 5);
    expect(g.ry).toBeCloseTo(fullR, 5);
    expect(g.height).toBeCloseTo(STAGE.height * ARCH_H_FROM, 5);
    expect(g.height).toBeLessThan(fullR);
    const width = archSegmentHalfWidth(g.rx, g.height) * 2;
    expect(width).toBeLessThan(STAGE.width * 0.55);
    expect(width).toBeGreaterThan(STAGE.width * 0.4);
  });

  it("keeps the full-width radius while the slice grows into a semicircle", () => {
    const fullR = archFullRadius(STAGE);
    for (let p = 0; p < 0.4; p += 0.05) {
      const g = archGeometry(p, STAGE);
      if (!g.extended) {
        expect(g.rx).toBeCloseTo(fullR, 5);
      }
    }
  });

  it("finishes as a full-width circular arc, never a straight-sided plate", () => {
    const g = archGeometry(1, STAGE);
    const fullR = archFullRadius(STAGE);
    expect(g.extended).toBe(false);
    expect(g.rx).toBeCloseTo(fullR, 5);
    expect(g.height).toBeCloseTo(fullR, 5);
    expect(g.height).toBeLessThanOrEqual(fullR);
    const width = archSegmentHalfWidth(g.rx, g.height) * 2;
    expect(width).toBeCloseTo(STAGE.width, 5);
  });

  it("keeps the apex on the stage so the closed arch does not flatten off-screen", () => {
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

  it("eases the rise so early growth is assertive", () => {
    expect(ARCH_H_EASE).toBeLessThan(1);
    const early = archGeometry(0.25, STAGE);
    const hFrom = STAGE.height * ARCH_H_FROM;
    const hTo = Math.min(archFullRadius(STAGE), STAGE.height * ARCH_H_TO);
    const linear = hFrom + 0.25 * (hTo - hFrom);
    expect(early.height).toBeGreaterThan(linear);
  });

  it("clamps a progress value outside the range", () => {
    expect(archGeometry(-1, STAGE)).toEqual(archGeometry(0, STAGE));
    expect(archGeometry(4, STAGE)).toEqual(archGeometry(1, STAGE));
  });
});

describe("archPath", () => {
  it("draws a closed circular segment while rising", () => {
    const path = archPath(archGeometry(0, STAGE));
    expect(path).toMatch(/^M -?[\d.]+ 900 A [\d.]+ [\d.]+ 0 0 1 -?[\d.]+ 900 Z$/);
  });

  it("keeps side padding on the opening bump", () => {
    const g = archGeometry(0, STAGE);
    const path = archPath(g);
    const [, startX, , , , , , , , endX] = path.split(" ");
    expect(Number(startX)).toBeGreaterThan(STAGE.width * 0.2);
    expect(Number(endX)).toBeLessThan(STAGE.width * 0.8);
  });

  it("stays a circular segment at the end of the rise", () => {
    const g = archGeometry(1, STAGE);
    expect(g.extended).toBe(false);
    const path = archPath(g);
    expect(path).not.toContain(" L ");
    expect(path).toMatch(/^M -?[\d.]+ 900 A [\d.]+ [\d.]+ 0 0 1 -?[\d.]+ 900 Z$/);
  });
});

describe("archTextPath", () => {
  it("is left to right over the top, so the lettering reads upright", () => {
    const g = archGeometry(0.55, STAGE);
    const parts = archTextPath(g, 40, 0.55).split(" ");
    expect(Number(parts[1])).toBeLessThan(Number(parts[parts.length - 1]));
    expect(archTextPath(g, 40, 0.55)).toContain(" 0 0 1 ");
  });

  it("is left open, since it carries lettering rather than a fill", () => {
    expect(archTextPath(archGeometry(0.55, STAGE), 40, 0.55)).not.toContain("Z");
  });

  it("widens its span as progress rises so words have room to spread", () => {
    const g = archGeometry(0.7, STAGE);
    const earlyLeft = Number(archTextPath(g, 40, 0.1).split(" ")[1]);
    const lateLeft = Number(archTextPath(g, 40, 0.9).split(" ")[1]);
    expect(lateLeft).toBeLessThan(earlyLeft);
  });
});

describe("curvedWordSpacingEm", () => {
  it("opens up as progress rises", () => {
    expect(curvedWordSpacingEm(0)).toBeLessThan(curvedWordSpacingEm(0.5));
    expect(curvedWordSpacingEm(0.5)).toBeLessThan(curvedWordSpacingEm(1));
  });

  it("scales with the amount multiplier", () => {
    expect(curvedWordSpacingEm(1, 2)).toBeCloseTo(curvedWordSpacingEm(1, 1) * 2, 5);
    expect(curvedWordSpacingEm(1, 0)).toBe(0);
  });
});

describe("archTextInset", () => {
  it("keeps a modest inner margin so type sits near the rim on the blue", () => {
    const inset = archTextInset(archGeometry(1, STAGE), STAGE);
    expect(inset).toBeGreaterThanOrEqual(40);
    expect(inset).toBeCloseTo(90, 5);
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
  const inset = archTextInset(archGeometry(1, STAGE), STAGE);

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

describe("capOpacity", () => {
  it("stays out of the way while the arch is still reading as an arch", () => {
    expect(capOpacity(0)).toBe(0);
    expect(capOpacity(0.82)).toBe(0);
  });

  it("closes the corners by the time the panel is full", () => {
    expect(capOpacity(0.895)).toBeCloseTo(0.5, 5);
    expect(capOpacity(0.97)).toBe(1);
  });
});

describe("settleProgress", () => {
  it("finishes the rise at the handoff, so the closed arch does not sit in a long hold", () => {
    expect(ARCH_SETTLE).toBe(ARCH_HANDOFF);
    expect(ARCH_SETTLE).toBeGreaterThan(0.5);
    expect(ARCH_SETTLE).toBeLessThan(1);
    expect(settleProgress(0)).toBe(0);
    expect(settleProgress(ARCH_SETTLE / 2)).toBeCloseTo(0.5, 5);
    expect(settleProgress(ARCH_SETTLE)).toBe(1);
    expect(settleProgress(1)).toBe(1);
  });
});

describe("shouldHandoff", () => {
  it("waits until 90% of the arc, then hands off to Boutique Concept", () => {
    expect(ARCH_HANDOFF).toBe(0.9);
    expect(shouldHandoff(0)).toBe(false);
    expect(shouldHandoff(0.89)).toBe(false);
    expect(shouldHandoff(0.9)).toBe(true);
    expect(shouldHandoff(1)).toBe(true);
  });
});

describe("ARCH_SCROLL_VH", () => {
  it("gives the rise about a viewport of scrub so opening is not rushed", () => {
    expect(ARCH_SCROLL_VH).toBeGreaterThanOrEqual(190);
    expect(ARCH_SCROLL_VH).toBeLessThanOrEqual(220);
  });
});

describe("ARCH_CARRY_S", () => {
  it("eases into Boutique Concept slowly instead of snapping", () => {
    expect(ARCH_CARRY_S).toBeGreaterThanOrEqual(2.4);
    expect(ARCH_CARRY_S).toBeLessThanOrEqual(3.2);
  });
});

describe("coversStage", () => {
  it("never treats the rise as a full plate", () => {
    expect(coversStage(0)).toBe(false);
    expect(coversStage(0.92)).toBe(false);
    expect(coversStage(1)).toBe(false);
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
  it("keeps the seal white on the photograph, then black on the tide", () => {
    expect(archNavTone(0.2)).toBe("on-media");
    expect(archNavTone(0.55)).toBe("on-color");
    expect(archNavTone(1)).toBe("on-color");
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
