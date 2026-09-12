import { describe, expect, it } from "vitest";

import { describeAnimation, resolveAnimation } from "../index";

describe("responsive defaults", () => {
  it("disables parallax on mobile unless explicitly enabled", () => {
    const resolved = resolveAnimation({
      type: "parallax",
      breakpoint: "mobile",
    });

    expect(resolved.enabled).toBe(false);
    expect(describeAnimation(resolved).kind).toBe("none");
  });

  it("keeps parallax enabled on mobile when the instance opts in", () => {
    const resolved = resolveAnimation({
      type: "parallax",
      breakpoint: "mobile",
      config: { enabled: true },
    });

    expect(resolved.enabled).toBe(true);
  });

  it("turns a horizontal slide into a vertical fade-up on mobile", () => {
    const resolved = resolveAnimation({
      type: "slide",
      breakpoint: "mobile",
      config: { direction: "left" },
    });

    expect(resolved.config.direction).toBe("up");
  });
});
