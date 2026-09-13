import type { AnimationConfig, AnimationType, Breakpoint, ProfileName } from "./types";

/**
 * Identity for an Animated effect. Inline `config={{ ... }}` objects are new
 * every render; comparing this key keeps one-time reveals from replaying.
 */
export function animationEffectKey(
  type: AnimationType,
  config: AnimationConfig | undefined,
  profile?: ProfileName,
  breakpoint?: Breakpoint,
  reducedMotion?: boolean,
): string {
  return [
    type,
    profile ?? "",
    breakpoint ?? "",
    reducedMotion === true ? "1" : "0",
    config?.duration ?? "",
    config?.delay ?? "",
    config?.stagger ?? "",
    config?.easing ?? "",
    config?.trigger ?? "",
    config?.direction ?? "",
    config?.distance ?? "",
    config?.intensity ?? "",
    config?.threshold ?? "",
    config?.scrollBehavior ?? "",
    config?.enabled ?? "",
    config?.from ?? "",
    config?.to ?? "",
    JSON.stringify(config?.responsive ?? null),
  ].join("|");
}
