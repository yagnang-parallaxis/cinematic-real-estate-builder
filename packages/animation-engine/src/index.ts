export { Animated, AnimationProvider, useAnimationContext } from "./core/Animated";
export { playAnimation } from "./core/play";
export { getAnimationMeta, getEffect, listAnimationTypes } from "./core/registry";
export { describeAnimation, resolveAnimation } from "./core/resolve";
export type { AnimatedProps } from "./core/Animated";
export type {
  AnimationConfig,
  AnimationFamily,
  AnimationHandle,
  AnimationMeta,
  AnimationRuntime,
  AnimationType,
  Breakpoint,
  Direction,
  EasingName,
  MotionDescriptor,
  ProfileName,
  ResolveAnimationInput,
  ResolvedAnimation,
  Trigger,
} from "./core/types";
export { animationPresets, getAnimationProfile } from "./presets";
export { detectBreakpoint } from "./responsive";
export { prefersReducedMotion } from "./reduced-motion";
