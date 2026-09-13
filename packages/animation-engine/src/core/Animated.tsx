"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

import { detectBreakpoint } from "../responsive";
import { prefersReducedMotion } from "../reduced-motion";
import { animationEffectKey } from "./effect-key";
import { createGsapRuntime } from "./gsap-runtime";
import { playAnimation } from "./play";
import { resolveAnimation } from "./resolve";
import type {
  AnimationConfig,
  AnimationHandle,
  AnimationType,
  Breakpoint,
  ProfileName,
} from "./types";

interface AnimationContextValue {
  profile: ProfileName;
  breakpoint?: Breakpoint;
  reducedMotion?: boolean;
}

const AnimationContext = createContext<AnimationContextValue>({
  profile: "cinematic",
});

export function AnimationProvider({
  children,
  profile = "cinematic",
  breakpoint,
  reducedMotion,
}: {
  children: ReactNode;
  profile?: ProfileName;
  breakpoint?: Breakpoint;
  reducedMotion?: boolean;
}) {
  return (
    <AnimationContext.Provider value={{ profile, breakpoint, reducedMotion }}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimationContext(): AnimationContextValue {
  return useContext(AnimationContext);
}

export interface AnimatedProps {
  type: AnimationType;
  config?: AnimationConfig;
  profile?: ProfileName;
  breakpoint?: Breakpoint;
  reducedMotion?: boolean;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
  children: ReactNode;
}

export function Animated({
  type,
  config,
  profile,
  breakpoint,
  reducedMotion,
  className,
  style,
  as: Component = "div",
  children,
}: AnimatedProps) {
  const ref = useRef<HTMLElement | null>(null);
  const context = useAnimationContext();
  const resolvedProfile = profile ?? context.profile;
  const resolvedBreakpoint = breakpoint ?? context.breakpoint;
  const resolvedReduced = reducedMotion ?? context.reducedMotion;
  const effectKey = animationEffectKey(
    type,
    config,
    resolvedProfile,
    resolvedBreakpoint,
    resolvedReduced,
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    let cancelled = false;
    let handle: AnimationHandle = { kill() {} };
    const resolved = resolveAnimation({
      type,
      config,
      profile: resolvedProfile,
      breakpoint: resolvedBreakpoint ?? detectBreakpoint(),
      reducedMotion: resolvedReduced ?? prefersReducedMotion(),
    });

    void createGsapRuntime().then((runtime) => {
      if (cancelled) {
        return;
      }
      handle = playAnimation(element, resolved, runtime);
    });

    return () => {
      cancelled = true;
      handle.kill();
    };
    // effectKey is the value identity of type + config + motion context.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- config is compared by key
  }, [effectKey]);

  return (
    <Component ref={ref} className={className} style={style}>
      {children}
    </Component>
  );
}
