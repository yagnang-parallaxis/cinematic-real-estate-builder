import type { EffectDefinition } from "../../core/types";
import { fadeDescriptor, opacityOnlyReducedMotion } from "../shared";

export const scaleEffect: EffectDefinition = {
  type: "scale",
  family: "one-time",
  category: "reveal",
  continuous: false,
  defaults: {
    trigger: "on-scroll-enter",
    scrollBehavior: "play-once",
    delay: 0,
    stagger: 0,
    threshold: 0.2,
    intensity: 0.92,
    enabled: true,
  },
  applyReducedMotion: opacityOnlyReducedMotion,
  describe(resolved) {
    if (resolved.reducedMotion) {
      return fadeDescriptor(resolved, { opacity: 0 }, { opacity: 1 });
    }

    return fadeDescriptor(
      resolved,
      { opacity: 0, scale: resolved.config.intensity },
      { opacity: 1, scale: 1 },
    );
  },
};
