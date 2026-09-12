import type { AnimationFamily, EasingName, ProfileName } from "../core/types";

export interface ProfileFamilyDefaults {
  duration: number;
  easing: EasingName;
  intensity: number;
  distance: number;
}

export interface AnimationProfile {
  name: ProfileName;
  families: Record<AnimationFamily, ProfileFamilyDefaults>;
}

const cinematic: AnimationProfile = {
  name: "cinematic",
  families: {
    "one-time": { duration: 0.9, easing: "easeOut", intensity: 1, distance: 32 },
    continuous: { duration: 1, easing: "linear", intensity: 1, distance: 48 },
    interaction: { duration: 0.45, easing: "easeOut", intensity: 1, distance: 16 },
    navigation: { duration: 0.55, easing: "easeInOut", intensity: 1, distance: 24 },
  },
};

const subtle: AnimationProfile = {
  name: "subtle",
  families: {
    "one-time": { duration: 0.55, easing: "easeOut", intensity: 0.7, distance: 20 },
    continuous: { duration: 1, easing: "linear", intensity: 0.6, distance: 28 },
    interaction: { duration: 0.3, easing: "easeOut", intensity: 0.7, distance: 10 },
    navigation: { duration: 0.4, easing: "easeInOut", intensity: 0.7, distance: 16 },
  },
};

const minimal: AnimationProfile = {
  name: "minimal",
  families: {
    "one-time": { duration: 0.35, easing: "standard", intensity: 0.4, distance: 12 },
    continuous: { duration: 1, easing: "linear", intensity: 0.35, distance: 16 },
    interaction: { duration: 0.2, easing: "standard", intensity: 0.4, distance: 8 },
    navigation: { duration: 0.25, easing: "easeInOut", intensity: 0.4, distance: 10 },
  },
};

export const animationPresets: Record<ProfileName, AnimationProfile> = {
  cinematic,
  subtle,
  minimal,
};

export function getAnimationProfile(name: ProfileName = "cinematic"): AnimationProfile {
  return animationPresets[name];
}
