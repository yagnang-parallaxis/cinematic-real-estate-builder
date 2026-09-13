"use client";

import { cn } from "@cinematic/ui";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

export type ParallaxRole =
  /** Background plate drifting against the scroll direction. */
  | "bed"
  /** Image inside a clipped frame, overscaled so the drift never shows an edge. */
  | "image"
  /** Foreground accent drifting with the scroll direction. */
  | "accent";

/** Percentages of the layer's own height; `image` must stay inside its overscan. */
const ROLE_SHIFT: Record<ParallaxRole, number> = {
  bed: -10,
  image: -7,
  accent: 7,
};

/**
 * Scroll-coupled drift for background and decorative layers only — never for
 * primary readable text. Continuous effects like this one are switched off
 * below the desktop breakpoint and under reduced-motion, where their cost
 * outweighs the depth they buy.
 */
export function Parallax({
  role = "bed",
  intensity = 1,
  className,
  style,
  children,
}: {
  role?: ParallaxRole;
  intensity?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const desktop = window.matchMedia("(min-width: 992px)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;
    let active = false;

    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const viewport = window.innerHeight;
      if (rect.bottom < 0 || rect.top > viewport) {
        return;
      }
      // -1 entering from the bottom, +1 leaving past the top.
      const progress = 1 - (rect.top + rect.height / 2) / ((viewport + rect.height) / 2);
      const shift = ROLE_SHIFT[role] * intensity * progress;
      element.style.setProperty("--parallax-shift", `${shift.toFixed(3)}%`);
    };

    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(update);
      }
    };

    const sync = () => {
      const enabled = desktop.matches && !calm.matches;
      if (enabled === active) {
        return;
      }
      active = enabled;
      if (enabled) {
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        update();
      } else {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        element.style.removeProperty("--parallax-shift");
      }
    };

    sync();
    desktop.addEventListener("change", sync);
    calm.addEventListener("change", sync);

    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      desktop.removeEventListener("change", sync);
      calm.removeEventListener("change", sync);
    };
  }, [role, intensity]);

  return (
    <div ref={ref} className={cn("parallax", className)} data-parallax={role} style={style}>
      {children}
    </div>
  );
}
