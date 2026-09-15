import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Decorative layers that sit under the fixed chrome destroy nav contrast.
 * The convention lives in motion.css so a section cannot add a spray without
 * inheriting the inset — unless it opts out and declares a nav scrim.
 */
describe("chrome-safe decoration", () => {
  const motion = readFileSync(join(__dirname, "motion.css"), "utf8");
  const styles = readFileSync(join(__dirname, "styles.css"), "utf8");

  it("insets top-corner decoration by the chrome band unless it opts out", () => {
    expect(motion).toMatch(/\.decor-safe:not\(\.decor-bleed\)\[data-corner="top-left"\]/);
    expect(motion).toContain("top: var(--gutter-top)");
  });

  it("gives the rail a scrim when a section opts decoration into the band", () => {
    expect(styles).toContain(".nav-chrome[data-nav-scrim]");
    expect(styles).toContain("text-shadow");
  });
});
