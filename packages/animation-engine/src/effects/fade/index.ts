import type { EffectDefinition, ResolvedAnimation } from "../../core/types";
import { fadeDescriptor, offsetForDirection, opacityOnlyReducedMotion } from "../shared";

function createFadeEffect(
  type: "fade" | "fadeUp" | "fadeDown" | "slide",
  direction?: "up" | "down" | "left",
): EffectDefinition {
  return {
    type,
    family: "one-time",
    category: "reveal",
    continuous: false,
    defaults: {
      trigger: "on-scroll-enter",
      scrollBehavior: "play-once",
      direction,
      delay: 0,
      stagger: 0,
      threshold: 0.2,
      enabled: true,
    },
    responsiveLock:
      type === "slide"
        ? {
            mobile: { direction: "up" },
          }
        : undefined,
    applyReducedMotion: opacityOnlyReducedMotion,
    describe(resolved: ResolvedAnimation) {
      if (resolved.reducedMotion || type === "fade") {
        return fadeDescriptor(resolved, { opacity: 0 }, { opacity: 1 });
      }

      return fadeDescriptor(
        resolved,
        offsetForDirection(
          resolved.config.direction ?? direction ?? "up",
          resolved.config.distance,
        ),
        { x: 0, y: 0, opacity: 1 },
      );
    },
  };
}

export const fadeEffects: EffectDefinition[] = [
  createFadeEffect("fade"),
  createFadeEffect("fadeUp", "up"),
  createFadeEffect("fadeDown", "down"),
  createFadeEffect("slide", "left"),
];
