import { describe, expect, it } from "vitest";

import { animationEffectKey } from "../core/effect-key";

describe("animationEffectKey", () => {
  it("treats inline config objects with the same values as one effect", () => {
    expect(animationEffectKey("fadeUp", { duration: 0.8, trigger: "on-load" })).toBe(
      animationEffectKey("fadeUp", { duration: 0.8, trigger: "on-load" }),
    );
  });

  it("changes when the motion actually changes", () => {
    expect(animationEffectKey("fadeUp", { duration: 0.8 })).not.toBe(
      animationEffectKey("fadeUp", { duration: 1.2 }),
    );
  });
});
