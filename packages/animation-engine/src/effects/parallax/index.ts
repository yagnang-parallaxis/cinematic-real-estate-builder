import type { EffectDefinition } from "../../core/types";
import { disableReducedMotion } from "../shared";

export const parallaxEffect: EffectDefinition = {
  type: "parallax",
  family: "continuous",
  category: "scroll-driven",
  continuous: true,
  defaults: {
    trigger: "on-scroll-progress",
    scrollBehavior: "scrub",
    direction: "up",
    delay: 0,
    stagger: 0,
    threshold: 0,
    intensity: 1,
    enabled: true,
  },
  responsive: {
    tablet: { intensity: 0.6 },
    mobile: { enabled: false },
  },
  applyReducedMotion: disableReducedMotion,
  describe(resolved) {
    if (!resolved.enabled) {
      return { kind: "none" };
    }

    return {
      kind: "scrub",
      intensity: resolved.config.intensity,
      direction: resolved.config.direction,
    };
  },
};
