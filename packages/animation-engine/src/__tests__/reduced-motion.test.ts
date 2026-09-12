import { describe, expect, it } from "vitest";

import { describeAnimation, resolveAnimation } from "../index";

describe("reduced motion", () => {
  it("wins over instance direction and duration for imageReveal", () => {
    const resolved = resolveAnimation({
      type: "imageReveal",
      config: { duration: 1.2, direction: "left" },
      reducedMotion: true,
    });

    expect(resolved.config.duration).toBeLessThanOrEqual(0.15);
    expect(describeAnimation(resolved)).toMatchObject({
      kind: "fade",
      from: { opacity: 0 },
      to: { opacity: 1 },
    });
  });

  it("disables parallax entirely", () => {
    const resolved = resolveAnimation({
      type: "parallax",
      reducedMotion: true,
    });

    expect(resolved.enabled).toBe(false);
    expect(describeAnimation(resolved).kind).toBe("none");
  });

  it("snaps counters to the final value", () => {
    const resolved = resolveAnimation({
      type: "counter",
      config: { duration: 1, from: 0, to: 25 },
      reducedMotion: true,
    });

    expect(describeAnimation(resolved)).toMatchObject({
      kind: "counter",
      duration: 0,
      from: 25,
      to: 25,
    });
  });
});
