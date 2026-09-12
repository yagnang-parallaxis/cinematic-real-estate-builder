import type { EffectDefinition } from "../../core/types";
import { disableReducedMotion } from "../shared";

function createStickyEffect(type: "stickyStorytelling" | "pinnedSection"): EffectDefinition {
  return {
    type,
    family: "continuous",
    category: "scroll-driven",
    continuous: true,
    defaults: {
      trigger: "on-scroll-progress",
      scrollBehavior: "pin",
      delay: 0,
      stagger: 0,
      threshold: 0,
      distance: 1.5,
      enabled: true,
    },
    responsive: {
      mobile: { enabled: false },
    },
    applyReducedMotion: disableReducedMotion,
    describe(resolved) {
      if (!resolved.enabled) {
        return { kind: "none" };
      }

      return {
        kind: "pin",
        distance: resolved.config.distance,
      };
    },
  };
}

export const stickyEffects: EffectDefinition[] = [
  createStickyEffect("stickyStorytelling"),
  createStickyEffect("pinnedSection"),
];
