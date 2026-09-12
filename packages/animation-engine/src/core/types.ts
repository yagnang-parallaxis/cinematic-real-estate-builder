export const ANIMATION_TYPES = [
  "none",
  "fade",
  "fadeUp",
  "fadeDown",
  "slide",
  "scale",
  "imageZoom",
  "imageReveal",
  "clipPathReveal",
  "textReveal",
  "wordReveal",
  "characterReveal",
  "parallax",
  "horizontalScroll",
  "stickyStorytelling",
  "pinnedSection",
  "carousel",
  "marquee",
  "counter",
  "menuReveal",
  "pageTransition",
] as const;

export type AnimationType = (typeof ANIMATION_TYPES)[number];

export type ProfileName = "cinematic" | "subtle" | "minimal";
export type Breakpoint = "desktop" | "tablet" | "mobile";
export type AnimationFamily = "one-time" | "continuous" | "interaction" | "navigation";
export type AnimationCategory = "reveal" | "text" | "media" | "scroll-driven" | "loop" | "chrome";
export type EasingName =
  "standard" | "easeOut" | "easeIn" | "easeInOut" | "softSpring" | "snap" | "linear";
export type Trigger =
  | "on-load"
  | "on-scroll-enter"
  | "on-scroll-progress"
  | "on-click"
  | "on-hover"
  | "on-route-change"
  | "on-data-change";
export type Direction = "up" | "down" | "left" | "right" | "center" | "top" | "bottom";
export type ScrollBehavior = "play-once" | "scrub" | "pin";

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  stagger?: number;
  easing?: EasingName;
  trigger?: Trigger;
  direction?: Direction;
  distance?: number;
  intensity?: number;
  threshold?: number;
  scrollBehavior?: ScrollBehavior;
  enabled?: boolean;
  from?: number;
  to?: number;
  responsive?: Partial<Record<Exclude<Breakpoint, "desktop">, Partial<AnimationConfig>>>;
}

export interface ResolvedAnimationConfig {
  duration: number;
  delay: number;
  stagger: number;
  easing: EasingName;
  trigger: Trigger;
  direction?: Direction;
  distance: number;
  intensity: number;
  threshold: number;
  scrollBehavior: ScrollBehavior;
  enabled: boolean;
  from?: number;
  to?: number;
}

export interface ResolveAnimationInput {
  type: AnimationType;
  config?: AnimationConfig;
  profile?: ProfileName;
  breakpoint?: Breakpoint;
  reducedMotion?: boolean;
}

export interface ResolvedAnimation {
  type: AnimationType;
  enabled: boolean;
  config: ResolvedAnimationConfig;
  reducedMotion: boolean;
  breakpoint: Breakpoint;
  profile: ProfileName;
}

export interface AnimationMeta {
  type: AnimationType;
  family: AnimationFamily;
  continuous: boolean;
  category: AnimationCategory;
}

export type MotionDescriptor =
  | { kind: "none" }
  | {
      kind: "fade";
      duration: number;
      delay: number;
      easing: EasingName;
      trigger: Trigger;
      threshold: number;
      from: Record<string, number>;
      to: Record<string, number>;
      stagger?: number;
    }
  | {
      kind: "reveal";
      duration: number;
      delay: number;
      easing: EasingName;
      trigger: Trigger;
      threshold: number;
      direction: Direction;
      from: Record<string, number | string>;
      to: Record<string, number | string>;
    }
  | {
      kind: "scrub";
      intensity: number;
      direction?: Direction;
    }
  | {
      kind: "pin";
      distance: number;
    }
  | {
      kind: "counter";
      duration: number;
      easing: EasingName;
      from: number;
      to: number;
    }
  | {
      kind: "split-text";
      unit: "word" | "character";
      duration: number;
      delay: number;
      stagger: number;
      easing: EasingName;
      trigger: Trigger;
      threshold: number;
    }
  | {
      kind: "loop";
      duration: number;
      direction?: Direction;
    };

export interface AnimationHandle {
  kill(): void;
}

export interface AnimationRuntime {
  play(target: object, descriptor: MotionDescriptor): AnimationHandle;
}

export interface EffectDefinition {
  type: Exclude<AnimationType, "none">;
  family: AnimationFamily;
  category: AnimationCategory;
  continuous: boolean;
  defaults: Partial<ResolvedAnimationConfig> & {
    trigger: Trigger;
    scrollBehavior: ScrollBehavior;
  };
  responsive?: Partial<Record<Breakpoint, Partial<AnimationConfig>>>;
  responsiveLock?: Partial<Record<Breakpoint, Partial<AnimationConfig>>>;
  applyReducedMotion: (config: ResolvedAnimationConfig) => ResolvedAnimationConfig;
  describe: (resolved: ResolvedAnimation) => MotionDescriptor;
}
