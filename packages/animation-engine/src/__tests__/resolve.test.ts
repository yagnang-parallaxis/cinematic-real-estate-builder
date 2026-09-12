import { describe, expect, it } from "vitest";

import { describeAnimation, resolveAnimation } from "../index";

describe("resolveAnimation", () => {
  it("lets instance config override primitive and profile defaults", () => {
    const resolved = resolveAnimation({
      type: "imageReveal",
      config: { duration: 1.2, direction: "left" },
      profile: "cinematic",
    });

    expect(resolved.type).toBe("imageReveal");
    expect(resolved.config.duration).toBe(1.2);
    expect(resolved.config.direction).toBe("left");
    expect(resolved.enabled).toBe(true);
  });

  it("uses cinematic durations that are longer than minimal", () => {
    const cinematic = resolveAnimation({ type: "fade", profile: "cinematic" });
    const minimal = resolveAnimation({ type: "fade", profile: "minimal" });

    expect(cinematic.config.duration).toBeGreaterThan(minimal.config.duration);
  });

  it("resolves none as a disabled animation", () => {
    const resolved = resolveAnimation({ type: "none" });

    expect(resolved.enabled).toBe(false);
    expect(describeAnimation(resolved).kind).toBe("none");
  });
});

describe("describeAnimation", () => {
  it("describes imageReveal as a directional clip wipe, not a raw tween recipe", () => {
    const resolved = resolveAnimation({
      type: "imageReveal",
      config: { duration: 1.2, direction: "left" },
    });

    expect(describeAnimation(resolved)).toMatchObject({
      kind: "reveal",
      direction: "left",
      duration: 1.2,
    });
  });
});
