import type { Direction, EffectDefinition, MotionDescriptor } from "../../core/types";
import { fadeDescriptor, clipPathForDirection, opacityOnlyReducedMotion } from "../shared";

function revealDescriptor(
  resolved: Parameters<EffectDefinition["describe"]>[0],
  direction: Direction,
): Extract<MotionDescriptor, { kind: "reveal" }> {
  return {
    kind: "reveal",
    duration: resolved.config.duration,
    delay: resolved.config.delay,
    easing: resolved.config.easing,
    trigger: resolved.config.trigger,
    threshold: resolved.config.threshold,
    direction,
    from: {
      clipPath: clipPathForDirection(direction),
      scale: 1.08,
    },
    to: {
      clipPath: "inset(0 0% 0 0)",
      scale: 1,
    },
  };
}

export const imageRevealEffect: EffectDefinition = {
  type: "imageReveal",
  family: "one-time",
  category: "media",
  continuous: false,
  defaults: {
    trigger: "on-scroll-enter",
    scrollBehavior: "play-once",
    direction: "up",
    delay: 0,
    stagger: 0,
    threshold: 0.2,
    enabled: true,
  },
  applyReducedMotion: opacityOnlyReducedMotion,
  describe(resolved) {
    if (resolved.reducedMotion) {
      return fadeDescriptor(resolved, { opacity: 0 }, { opacity: 1 });
    }

    return revealDescriptor(resolved, resolved.config.direction ?? "up");
  },
};

export const clipPathRevealEffect: EffectDefinition = {
  type: "clipPathReveal",
  family: "one-time",
  category: "reveal",
  continuous: false,
  defaults: {
    trigger: "on-scroll-enter",
    scrollBehavior: "play-once",
    direction: "up",
    delay: 0,
    stagger: 0,
    threshold: 0.2,
    enabled: true,
  },
  applyReducedMotion: opacityOnlyReducedMotion,
  describe(resolved) {
    if (resolved.reducedMotion) {
      return fadeDescriptor(resolved, { opacity: 0 }, { opacity: 1 });
    }

    return revealDescriptor(resolved, resolved.config.direction ?? "up");
  },
};

export const imageZoomEffect: EffectDefinition = {
  type: "imageZoom",
  family: "interaction",
  category: "media",
  continuous: false,
  defaults: {
    trigger: "on-hover",
    scrollBehavior: "play-once",
    delay: 0,
    stagger: 0,
    threshold: 0,
    intensity: 1.08,
    enabled: true,
  },
  responsive: {
    mobile: { trigger: "on-scroll-enter" },
  },
  applyReducedMotion: (config) => ({ ...config, enabled: false, intensity: 1 }),
  describe(resolved) {
    if (resolved.reducedMotion) {
      return { kind: "none" };
    }

    return fadeDescriptor(resolved, { scale: 1 }, { scale: resolved.config.intensity });
  },
};

export const menuRevealEffect: EffectDefinition = {
  type: "menuReveal",
  family: "interaction",
  category: "chrome",
  continuous: false,
  defaults: {
    trigger: "on-click",
    scrollBehavior: "play-once",
    direction: "right",
    delay: 0,
    stagger: 0.04,
    threshold: 0,
    enabled: true,
  },
  applyReducedMotion: opacityOnlyReducedMotion,
  describe(resolved) {
    if (resolved.reducedMotion) {
      return fadeDescriptor(resolved, { opacity: 0 }, { opacity: 1 });
    }

    return revealDescriptor(resolved, resolved.config.direction ?? "right");
  },
};

export const pageTransitionEffect: EffectDefinition = {
  type: "pageTransition",
  family: "navigation",
  category: "chrome",
  continuous: false,
  defaults: {
    trigger: "on-route-change",
    scrollBehavior: "play-once",
    direction: "up",
    delay: 0,
    stagger: 0,
    threshold: 0,
    enabled: true,
  },
  applyReducedMotion: opacityOnlyReducedMotion,
  describe(resolved) {
    if (resolved.reducedMotion) {
      return fadeDescriptor(resolved, { opacity: 0 }, { opacity: 1 });
    }

    return revealDescriptor(resolved, resolved.config.direction ?? "up");
  },
};

export const revealEffects: EffectDefinition[] = [
  imageRevealEffect,
  clipPathRevealEffect,
  imageZoomEffect,
  menuRevealEffect,
  pageTransitionEffect,
];
