import { describe, expect, it } from "vitest";

import { playAnimation, resolveAnimation, type AnimationRuntime } from "../index";

function createMockRuntime() {
  const calls: Array<{ target: object; descriptor: unknown }> = [];

  const runtime: AnimationRuntime = {
    play(target, descriptor) {
      calls.push({ target, descriptor });
      return {
        kill() {
          return undefined;
        },
      };
    },
  };

  return { runtime, calls };
}

describe("playAnimation", () => {
  it("sends a motion descriptor to the runtime instead of letting callers write GSAP", () => {
    const { runtime, calls } = createMockRuntime();
    const target = { id: "hero-image" };
    const resolved = resolveAnimation({
      type: "imageReveal",
      config: { duration: 1.2, direction: "left" },
    });

    playAnimation(target, resolved, runtime);

    expect(calls).toHaveLength(1);
    expect(calls[0]?.target).toBe(target);
    expect(calls[0]?.descriptor).toMatchObject({
      kind: "reveal",
      direction: "left",
      duration: 1.2,
    });
  });

  it("does not call the runtime for disabled animations", () => {
    const { runtime, calls } = createMockRuntime();
    const resolved = resolveAnimation({ type: "none" });

    const handle = playAnimation({ id: "idle" }, resolved, runtime);

    expect(calls).toHaveLength(0);
    expect(handle.kill).toBeTypeOf("function");
  });
});
