import type { ResolvedAnimationConfig } from "../core/types";

export const REDUCED_MOTION_FADE_DURATION = 0.15;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function withShortFade(config: ResolvedAnimationConfig): ResolvedAnimationConfig {
  return {
    ...config,
    duration: Math.min(config.duration, REDUCED_MOTION_FADE_DURATION),
    distance: 0,
    intensity: 0,
    stagger: 0,
  };
}

export function withInstantState(config: ResolvedAnimationConfig): ResolvedAnimationConfig {
  return {
    ...config,
    duration: 0,
    delay: 0,
    distance: 0,
    intensity: 0,
    stagger: 0,
    enabled: false,
  };
}
