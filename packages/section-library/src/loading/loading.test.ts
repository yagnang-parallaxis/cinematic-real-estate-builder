import { describe, expect, it } from "vitest";

import {
  BOOT_ATTR,
  BOOT_GRACE_MS,
  BOOT_SEEN_KEY,
  BOOT_SEEN_VALUE,
  BOOT_SIGNALS,
  bootForcedFromSearch,
  bootOpened,
  bootProgress,
  bootReleased,
  bootSeenBootstrapScript,
  clampHoldMs,
  DEFAULT_HOLD_MS,
  isBootSeen,
  markBootSeen,
  MAX_HOLD_MS,
  MIN_HOLD_MS,
  shouldRunBoot,
  shouldSkipBoot,
  shouldUncover,
  taglineLines,
  wordmarkLines,
  type BootSignal,
} from "./logic";
import type { LoadingContent } from "./types";

const sample: LoadingContent = {
  brand: "Aurelia",
  wordmark: ["Aurelia", "Residences"],
  place: "Harbor",
  leftCaption: "North",
  rightCaption: "Coast",
  tagline: "Eighteen residences\nabove a quiet harbor.",
  progressStyle: "bar",
  maxDurationMs: 2000,
};

describe("loading content", () => {
  it("requires a brand and a maximum duration", () => {
    expect(sample.brand.length).toBeGreaterThan(0);
    expect(sample.maxDurationMs).toBeGreaterThan(0);
  });
});

describe("clampHoldMs", () => {
  it("keeps a sensible hold", () => {
    expect(clampHoldMs(2000)).toBe(2000);
  });

  it("clamps a hold too short to read, or long enough to be a wait", () => {
    expect(clampHoldMs(120)).toBe(MIN_HOLD_MS);
    expect(clampHoldMs(60000)).toBe(MAX_HOLD_MS);
    expect(clampHoldMs(0)).toBe(MIN_HOLD_MS);
    expect(clampHoldMs(-500)).toBe(MIN_HOLD_MS);
  });

  it("falls back to the default when unset or unusable", () => {
    expect(clampHoldMs()).toBe(DEFAULT_HOLD_MS);
    expect(clampHoldMs(Number.NaN)).toBe(DEFAULT_HOLD_MS);
  });

  it("rounds to whole milliseconds", () => {
    expect(clampHoldMs(1800.6)).toBe(1801);
  });
});

const ALL: BootSignal[] = [...BOOT_SIGNALS];

describe("bootProgress", () => {
  it("starts at nothing and never exceeds full", () => {
    expect(bootProgress({ elapsedMs: 0, floorMs: 2000, ready: [] })).toBe(0);
    expect(bootProgress({ elapsedMs: 99999, floorMs: 2000, ready: ALL })).toBe(1);
  });

  it("advances on elapsed time even when nothing has arrived yet", () => {
    const early = bootProgress({ elapsedMs: 400, floorMs: 2000, ready: [] });
    const later = bootProgress({ elapsedMs: 1200, floorMs: 2000, ready: [] });
    expect(early).toBeGreaterThan(0);
    expect(later).toBeGreaterThan(early);
    /* Time alone must not fill the rule, or the rule reports nothing real. */
    expect(later).toBeLessThan(1);
  });

  it("jumps forward as real signals land", () => {
    const bare = bootProgress({ elapsedMs: 600, floorMs: 2000, ready: [] });
    const some = bootProgress({ elapsedMs: 600, floorMs: 2000, ready: ["fonts"] });
    const all = bootProgress({ elapsedMs: 600, floorMs: 2000, ready: ALL });
    expect(some).toBeGreaterThan(bare);
    expect(all).toBeGreaterThan(some);
  });

  it("reads a set of signals the same as a list", () => {
    const asList = bootProgress({ elapsedMs: 600, floorMs: 2000, ready: ["fonts", "load"] });
    const asSet = bootProgress({
      elapsedMs: 600,
      floorMs: 2000,
      ready: new Set<BootSignal>(["fonts", "load"]),
    });
    expect(asSet).toBe(asList);
  });

  it("survives a zero floor rather than dividing by it", () => {
    expect(bootProgress({ elapsedMs: 10, floorMs: 0, ready: ALL })).toBe(1);
  });
});

describe("shouldUncover", () => {
  it("holds the floor even when the page is ready immediately", () => {
    expect(shouldUncover({ elapsedMs: 100, floorMs: 2000, ready: ALL })).toBe(false);
    expect(shouldUncover({ elapsedMs: 2000, floorMs: 2000, ready: ALL })).toBe(true);
  });

  it("keeps waiting past the floor while something is still missing", () => {
    expect(shouldUncover({ elapsedMs: 2400, floorMs: 2000, ready: ["fonts", "media"] })).toBe(false);
  });

  it("leaves anyway once the grace window is spent, so nobody is stranded", () => {
    expect(shouldUncover({ elapsedMs: 2000 + BOOT_GRACE_MS - 1, floorMs: 2000, ready: [] })).toBe(
      false,
    );
    expect(shouldUncover({ elapsedMs: 2000 + BOOT_GRACE_MS, floorMs: 2000, ready: [] })).toBe(true);
  });

  it("gives the grace window room to matter", () => {
    expect(BOOT_GRACE_MS).toBeGreaterThanOrEqual(2000);
    expect(BOOT_GRACE_MS).toBeLessThanOrEqual(8000);
  });
});

describe("wordmarkLines", () => {
  it("returns the authored wordmark, a line at a time", () => {
    expect(wordmarkLines(sample)).toEqual(["Aurelia", "Residences"]);
  });

  it("falls back to the brand when no wordmark is authored", () => {
    expect(wordmarkLines({ brand: "Aurelia" })).toEqual(["Aurelia"]);
  });

  it("trims each line and drops the blank ones", () => {
    expect(wordmarkLines({ brand: "Aurelia", wordmark: ["  Aurelia  ", "   "] })).toEqual([
      "Aurelia",
    ]);
  });

  it("falls back to the brand when every authored line is blank", () => {
    expect(wordmarkLines({ brand: "Aurelia", wordmark: ["  ", ""] })).toEqual(["Aurelia"]);
  });

  it("has nothing to show when there is no brand either", () => {
    expect(wordmarkLines({ brand: "   " })).toEqual([]);
  });
});

describe("taglineLines", () => {
  it("splits the tagline on its authored line breaks", () => {
    expect(taglineLines(sample.tagline)).toEqual(["Eighteen residences", "above a quiet harbor."]);
  });

  it("drops blank lines rather than rendering an empty one", () => {
    expect(taglineLines("One\n\n  \nTwo")).toEqual(["One", "Two"]);
  });

  it("has nothing for an absent or empty tagline", () => {
    expect(taglineLines()).toEqual([]);
    expect(taglineLines("")).toEqual([]);
    expect(taglineLines("   \n  ")).toEqual([]);
  });
});

function memoryStore(initial: Record<string, string> = {}): Storage {
  const data = { ...initial };
  return {
    get length() {
      return Object.keys(data).length;
    },
    clear() {
      for (const key of Object.keys(data)) {
        delete data[key];
      }
    },
    getItem(key: string) {
      return Object.hasOwn(data, key) ? (data[key] ?? null) : null;
    },
    key(index: number) {
      return Object.keys(data)[index] ?? null;
    },
    removeItem(key: string) {
      delete data[key];
    },
    setItem(key: string, value: string) {
      data[key] = value;
    },
  };
}

describe("boot session", () => {
  it("uses a session-scoped key so a new tab sees the plate again", () => {
    expect(BOOT_SEEN_KEY).toBe("cinematic:boot-seen");
    expect(BOOT_SEEN_VALUE).toBe("1");
  });

  it("is unseen until a successful uncover writes the mark", () => {
    const storage = memoryStore();
    expect(isBootSeen(storage)).toBe(false);
    markBootSeen(storage);
    expect(isBootSeen(storage)).toBe(true);
    expect(storage.getItem(BOOT_SEEN_KEY)).toBe(BOOT_SEEN_VALUE);
  });

  it("treats blocked storage as unseen rather than throwing", () => {
    const blocked: Storage = {
      get length() {
        return 0;
      },
      clear() {
        throw new Error("blocked");
      },
      getItem() {
        throw new Error("blocked");
      },
      key() {
        throw new Error("blocked");
      },
      removeItem() {
        throw new Error("blocked");
      },
      setItem() {
        throw new Error("blocked");
      },
    };

    expect(isBootSeen(blocked)).toBe(false);
    expect(() => markBootSeen(blocked)).not.toThrow();
  });

  it("runs the plate on a first visit, and not again in the same session", () => {
    expect(shouldRunBoot({ seen: false, force: false })).toBe(true);
    expect(shouldRunBoot({ seen: true, force: false })).toBe(false);
  });

  it("still runs when forced, even after the session has already seen it", () => {
    expect(shouldRunBoot({ seen: true, force: true })).toBe(true);
    expect(shouldRunBoot({ seen: false, force: true })).toBe(true);
  });

  it("does not skip when storage cannot be read, so first paint still covers", () => {
    expect(shouldSkipBoot()).toBe(false);
    expect(shouldSkipBoot(true)).toBe(false);
  });
});

describe("bootForcedFromSearch", () => {
  it("forces on ?loader=1, so capture and replay can run the gate again", () => {
    expect(bootForcedFromSearch("?loader=1")).toBe(true);
    expect(bootForcedFromSearch("?clone=aurelia&loader=1")).toBe(true);
  });

  it("forces on ?preview=1, so the builder iframe can still play the boot", () => {
    expect(bootForcedFromSearch("?preview=1")).toBe(true);
    expect(bootForcedFromSearch("?clone=aurelia&preview=1")).toBe(true);
  });

  it("does not treat a neighbouring param as a force", () => {
    expect(bootForcedFromSearch("")).toBe(false);
    expect(bootForcedFromSearch("?clone=aurelia")).toBe(false);
    expect(bootForcedFromSearch("?loader=10")).toBe(false);
    expect(bootForcedFromSearch("?preview=true")).toBe(false);
  });
});

describe("bootSeenBootstrapScript", () => {
  it("reads the same key the uncover writes, before the plate can paint", () => {
    const script = bootSeenBootstrapScript();
    expect(script).toContain(BOOT_SEEN_KEY);
    expect(script).toContain(BOOT_SEEN_VALUE);
    expect(script).toContain(BOOT_ATTR);
    expect(script).toContain("open");
    expect(script).toContain("veil");
    expect(script).toContain("sessionStorage");
  });

  it("leaves the plate alone when loader or preview asked to run it", () => {
    const script = bootSeenBootstrapScript();
    expect(script).toContain("loader=1");
    expect(script).toContain("preview=1");
  });

  it("does not veil a first visit that did not land on the homepage", () => {
    const script = bootSeenBootstrapScript();
    expect(script).toContain("pathname");
  });
});

function phaseRoot(phase: string | null): Element {
  return {
    getAttribute(name: string) {
      return name === BOOT_ATTR ? phase : null;
    },
  } as Element;
}

describe("boot phases", () => {
  it("treats a missing or open root as already uncovered", () => {
    expect(bootOpened(null)).toBe(true);
    expect(bootOpened(phaseRoot("open"))).toBe(true);
    expect(bootOpened(phaseRoot("gate"))).toBe(true);
  });

  it("holds the first screen closed while the veil is up", () => {
    expect(bootOpened(phaseRoot("veil"))).toBe(false);
  });

  it("releases the page only once the gate has left, not when the plate fades", () => {
    expect(bootReleased(phaseRoot("veil"))).toBe(false);
    expect(bootReleased(phaseRoot("gate"))).toBe(false);
    expect(bootReleased(phaseRoot("open"))).toBe(true);
    expect(bootReleased(null)).toBe(true);
  });
});
