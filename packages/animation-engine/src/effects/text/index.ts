import type { EffectDefinition } from "../../core/types";
import { fadeDescriptor, opacityOnlyReducedMotion } from "../shared";

export const textRevealEffect: EffectDefinition = {
  type: "textReveal",
  family: "one-time",
  category: "text",
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

    return fadeDescriptor(
      resolved,
      { opacity: 0, y: resolved.config.distance },
      { opacity: 1, y: 0 },
    );
  },
};

export const wordRevealEffect: EffectDefinition = {
  type: "wordReveal",
  family: "one-time",
  category: "text",
  continuous: false,
  defaults: {
    trigger: "on-scroll-enter",
    scrollBehavior: "play-once",
    delay: 0,
    stagger: 0.05,
    threshold: 0.2,
    enabled: true,
  },
  applyReducedMotion: opacityOnlyReducedMotion,
  describe(resolved) {
    if (resolved.reducedMotion) {
      return fadeDescriptor(resolved, { opacity: 0 }, { opacity: 1 });
    }

    return {
      kind: "split-text",
      unit: "word",
      duration: resolved.config.duration,
      delay: resolved.config.delay,
      stagger: resolved.config.stagger,
      easing: resolved.config.easing,
      trigger: resolved.config.trigger,
      threshold: resolved.config.threshold,
    };
  },
};

export const characterRevealEffect: EffectDefinition = {
  type: "characterReveal",
  family: "one-time",
  category: "text",
  continuous: false,
  defaults: {
    trigger: "on-scroll-enter",
    scrollBehavior: "play-once",
    delay: 0,
    stagger: 0.02,
    threshold: 0.2,
    enabled: true,
  },
  applyReducedMotion: opacityOnlyReducedMotion,
  describe(resolved) {
    if (resolved.reducedMotion) {
      return fadeDescriptor(resolved, { opacity: 0 }, { opacity: 1 });
    }

    return {
      kind: "split-text",
      unit: "character",
      duration: resolved.config.duration,
      delay: resolved.config.delay,
      stagger: resolved.config.stagger,
      easing: resolved.config.easing,
      trigger: resolved.config.trigger,
      threshold: resolved.config.threshold,
    };
  },
};

export const counterEffect: EffectDefinition = {
  type: "counter",
  family: "one-time",
  category: "text",
  continuous: false,
  defaults: {
    trigger: "on-scroll-enter",
    scrollBehavior: "play-once",
    delay: 0,
    stagger: 0,
    threshold: 0.2,
    from: 0,
    to: 0,
    enabled: true,
  },
  applyReducedMotion: (config) => ({
    ...config,
    duration: 0,
    delay: 0,
    from: config.to ?? 0,
    to: config.to ?? 0,
    enabled: true,
  }),
  describe(resolved) {
    const end = resolved.config.to ?? 0;

    return {
      kind: "counter",
      duration: resolved.config.duration,
      easing: resolved.config.easing,
      from: resolved.reducedMotion ? end : (resolved.config.from ?? 0),
      to: end,
    };
  },
};

export const textEffects: EffectDefinition[] = [
  textRevealEffect,
  wordRevealEffect,
  characterRevealEffect,
  counterEffect,
];
