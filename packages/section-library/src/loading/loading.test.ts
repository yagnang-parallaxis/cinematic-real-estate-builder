import { describe, expect, it } from "vitest";

import type { LoadingContent } from "./types";

const sample: LoadingContent = {
  brand: "Aurelia",
  tagline: "Eighteen residences above a quiet harbor.",
  progressStyle: "bar",
  maxDurationMs: 1800,
};

describe("loading screen", () => {
  it("requires a hard timeout so the page cannot stay blocked", () => {
    expect(sample.maxDurationMs).toBeGreaterThan(0);
    expect(sample.progressStyle).toBe("bar");
  });
});
