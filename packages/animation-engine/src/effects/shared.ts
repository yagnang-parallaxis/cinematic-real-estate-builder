import type {
  Direction,
  MotionDescriptor,
  ResolvedAnimation,
  ResolvedAnimationConfig,
} from "../core/types";
import { withInstantState, withShortFade } from "../reduced-motion/policy";

export function fadeDescriptor(
  resolved: ResolvedAnimation,
  from: Record<string, number>,
  to: Record<string, number>,
): Extract<MotionDescriptor, { kind: "fade" }> {
  return {
    kind: "fade",
    duration: resolved.config.duration,
    delay: resolved.config.delay,
    easing: resolved.config.easing,
    trigger: resolved.config.trigger,
    threshold: resolved.config.threshold,
    stagger: resolved.config.stagger,
    from,
    to,
  };
}

export function opacityOnlyReducedMotion(config: ResolvedAnimationConfig): ResolvedAnimationConfig {
  return withShortFade({
    ...config,
    enabled: true,
  });
}

export function disableReducedMotion(config: ResolvedAnimationConfig): ResolvedAnimationConfig {
  return withInstantState(config);
}

export function clipPathForDirection(direction: Direction = "up"): string {
  switch (direction) {
    case "left":
      return "inset(0 100% 0 0)";
    case "right":
      return "inset(0 0 0 100%)";
    case "down":
    case "bottom":
      return "inset(0 0 100% 0)";
    case "center":
      return "inset(50% 50% 50% 50%)";
    case "up":
    case "top":
    default:
      return "inset(100% 0 0 0)";
  }
}

export function offsetForDirection(
  direction: Direction | undefined,
  distance: number,
): Record<string, number> {
  switch (direction) {
    case "left":
      return { x: -distance, opacity: 0 };
    case "right":
      return { x: distance, opacity: 0 };
    case "down":
    case "bottom":
      return { y: -distance, opacity: 0 };
    case "up":
    case "top":
    default:
      return { y: distance, opacity: 0 };
  }
}
