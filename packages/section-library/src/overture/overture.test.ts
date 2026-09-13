import { describe, expect, it } from "vitest";

import { archRadius, clampLines } from "./logic";

describe("archRadius", () => {
  it("uses half the column width as the shoulder radius", () => {
    expect(archRadius(40)).toBe("20vw 20vw 0 0");
  });

  it("clamps an over-wide column so the arch cannot invert", () => {
    expect(archRadius(180)).toBe("50vw 50vw 0 0");
  });

  it("clamps a hairline column to a usable minimum", () => {
    expect(archRadius(0)).toBe("5vw 5vw 0 0");
  });
});

describe("clampLines", () => {
  it("trims lines and drops the empty ones", () => {
    expect(clampLines([" a ", "", "b"])).toEqual(["a", "b"]);
  });

  it("keeps at most three lines", () => {
    expect(clampLines(["a", "b", "c", "d"])).toEqual(["a", "b", "c"]);
  });
});
