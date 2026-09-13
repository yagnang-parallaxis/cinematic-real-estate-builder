"use client";

import { cn } from "@cinematic/ui";
import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

export type RevealVariant =
  /** Text unmasks upward from behind a clip edge. */
  | "mask"
  /** Block fades and rises as one unit. */
  | "block"
  /** A rule draws itself along its own length. */
  | "line"
  /** Media slides up inside its frame while the frame stays put. */
  | "media";

export interface RevealProps {
  variant?: RevealVariant;
  as?: ElementType;
  /** Stagger applied to direct children, in seconds. */
  stagger?: number;
  delay?: number;
  duration?: number;
  /** Fraction of the element that must be visible before it plays. */
  threshold?: number;
  /** Play on mount rather than on scroll entry (above-the-fold content). */
  immediate?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Progressive reveal used as the default treatment for incoming content.
 *
 * The motion is CSS-driven (clip-path plus transform) and gated by a single
 * IntersectionObserver, which keeps it cheap enough to apply to every heading
 * and paragraph on the page — including on touch devices, where the
 * scroll-coupled effects (parallax, pinning) are deliberately switched off.
 */
export function Reveal({
  variant = "mask",
  as: Component = "div",
  stagger,
  delay = 0,
  duration,
  threshold = 0.15,
  immediate = false,
  className,
  style,
  children,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    if (immediate) {
      // Defer a frame so the "from" state is painted before the transition.
      const raf = requestAnimationFrame(() => element.setAttribute("data-revealed", "true"));
      return () => cancelAnimationFrame(raf);
    }

    if (typeof IntersectionObserver === "undefined") {
      element.setAttribute("data-revealed", "true");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            element.setAttribute("data-revealed", "true");
            observer.disconnect();
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [immediate, threshold]);

  return (
    <Component
      ref={ref}
      className={cn("reveal", className)}
      data-reveal={variant}
      data-reveal-stagger={stagger ? "true" : undefined}
      style={
        {
          ...style,
          ...(delay ? { "--reveal-delay": `${delay}s` } : null),
          ...(duration ? { "--reveal-dur": `${duration}s` } : null),
          ...(stagger ? { "--reveal-stagger": `${stagger}s` } : null),
        } as CSSProperties
      }
    >
      {children}
    </Component>
  );
}

/**
 * Convenience wrapper for a multi-line heading: each line unmasks in turn,
 * which reads as the line-level reveal used across the reference category.
 */
export function RevealLines({
  lines,
  as: Component = "h2",
  className,
  lineClassName,
  delay = 0,
  stagger = 0.08,
  immediate = false,
}: {
  lines: string[];
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  immediate?: boolean;
}) {
  return (
    <Reveal
      as={Component}
      variant="mask"
      stagger={stagger}
      delay={delay}
      immediate={immediate}
      className={cn("reveal-lines", className)}
    >
      {lines.map((line, index) => (
        <span key={`${line}-${index}`} className={cn("reveal-line", lineClassName)}>
          <span className="reveal-line-inner">{line}</span>
        </span>
      ))}
    </Reveal>
  );
}
