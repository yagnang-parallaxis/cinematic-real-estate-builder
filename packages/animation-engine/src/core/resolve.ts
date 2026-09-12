import { getAnimationProfile } from "../presets";
import { getEffect } from "./registry";
import type {
  AnimationConfig,
  ResolveAnimationInput,
  ResolvedAnimation,
  ResolvedAnimationConfig,
} from "./types";

const BASE_CONFIG: ResolvedAnimationConfig = {
  duration: 0.6,
  delay: 0,
  stagger: 0,
  easing: "easeOut",
  trigger: "on-scroll-enter",
  distance: 24,
  intensity: 1,
  threshold: 0.2,
  scrollBehavior: "play-once",
  enabled: true,
};

function mergeConfig(
  base: ResolvedAnimationConfig,
  override?: Partial<AnimationConfig> | Partial<ResolvedAnimationConfig>,
): ResolvedAnimationConfig {
  if (!override) {
    return base;
  }

  const next = { ...base };

  (Object.keys(override) as Array<keyof AnimationConfig>).forEach((key) => {
    if (key === "responsive") {
      return;
    }

    const value = override[key];
    if (value !== undefined) {
      Object.assign(next, { [key]: value });
    }
  });

  return next;
}

export function resolveAnimation(input: ResolveAnimationInput): ResolvedAnimation {
  const profileName = input.profile ?? "cinematic";
  const breakpoint = input.breakpoint ?? "desktop";
  const reducedMotion = input.reducedMotion ?? false;

  if (input.type === "none") {
    return {
      type: "none",
      enabled: false,
      reducedMotion,
      breakpoint,
      profile: profileName,
      config: {
        ...BASE_CONFIG,
        enabled: false,
        duration: 0,
      },
    };
  }

  const effect = getEffect(input.type);

  if (!effect) {
    throw new Error(`Unknown animation type: ${input.type}`);
  }

  const profile = getAnimationProfile(profileName).families[effect.family];
  let config = mergeConfig(BASE_CONFIG, {
    ...effect.defaults,
    duration: profile.duration,
    easing: profile.easing,
    intensity: effect.defaults.intensity ?? profile.intensity,
    distance: effect.defaults.distance ?? profile.distance,
  });

  config = mergeConfig(config, effect.responsive?.[breakpoint]);
  config = mergeConfig(config, input.config);

  if (!input.config?.responsive?.[breakpoint === "desktop" ? "tablet" : breakpoint]) {
    config = mergeConfig(config, effect.responsiveLock?.[breakpoint]);
  } else {
    config = mergeConfig(
      config,
      input.config.responsive[breakpoint === "desktop" ? "tablet" : breakpoint],
    );
  }

  if (input.config?.responsive && breakpoint !== "desktop") {
    config = mergeConfig(config, input.config.responsive[breakpoint]);
  }

  if (reducedMotion) {
    config = effect.applyReducedMotion(config);
  }

  return {
    type: input.type,
    enabled: config.enabled,
    reducedMotion,
    breakpoint,
    profile: profileName,
    config,
  };
}

export function describeAnimation(resolved: ResolvedAnimation) {
  if (!resolved.enabled || resolved.type === "none") {
    return { kind: "none" as const };
  }

  const effect = getEffect(resolved.type);

  if (!effect) {
    return { kind: "none" as const };
  }

  return effect.describe(resolved);
}
