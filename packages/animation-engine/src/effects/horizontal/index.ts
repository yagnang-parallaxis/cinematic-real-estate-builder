import type { EffectDefinition } from "../../core/types";
import { disableReducedMotion, fadeDescriptor, opacityOnlyReducedMotion } from "../shared";

export const horizontalScrollEffect: EffectDefinition = {
  type: "horizontalScroll",
  family: "continuous",
  category: "scroll-driven",
  continuous: true,
  defaults: {
    trigger: "on-scroll-progress",
    scrollBehavior: "scrub",
    direction: "left",
    delay: 0,
    stagger: 0,
    threshold: 0,
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
      kind: "scrub",
      intensity: resolved.config.intensity,
      direction: resolved.config.direction,
    };
  },
};

export const carouselEffect: EffectDefinition = {
  type: "carousel",
  family: "interaction",
  category: "loop",
  continuous: false,
  defaults: {
    trigger: "on-click",
    scrollBehavior: "play-once",
    direction: "left",
    delay: 0,
    stagger: 0,
    threshold: 0,
    enabled: true,
  },
  applyReducedMotion: opacityOnlyReducedMotion,
  describe(resolved) {
    return fadeDescriptor(
      resolved,
      { opacity: 0, x: resolved.reducedMotion ? 0 : resolved.config.distance },
      { opacity: 1, x: 0 },
    );
  },
};

export const marqueeEffect: EffectDefinition = {
  type: "marquee",
  family: "continuous",
  category: "loop",
  continuous: true,
  defaults: {
    trigger: "on-scroll-enter",
    scrollBehavior: "play-once",
    direction: "left",
    delay: 0,
    stagger: 0,
    threshold: 0,
    duration: 20,
    enabled: true,
  },
  applyReducedMotion: disableReducedMotion,
  describe(resolved) {
    if (!resolved.enabled) {
      return { kind: "none" };
    }

    return {
      kind: "loop",
      duration: resolved.config.duration,
      direction: resolved.config.direction,
    };
  },
};

export const horizontalEffects: EffectDefinition[] = [
  horizontalScrollEffect,
  carouselEffect,
  marqueeEffect,
];
