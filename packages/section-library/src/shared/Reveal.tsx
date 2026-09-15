"use client";

import { cn, type FitTier } from "@cinematic/ui";
import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type RefObject,
} from "react";

import { useFitText } from "./useFitText";

export type RevealVariant =
  /** Text unmasks upward from behind a clip edge. */
  | "mask"
  /** A multi-line heading unmasks a line at a time; see `RevealLines`. */
  | "lines"
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
  /**
   * Handle on the rendered element, for callers that have to measure it. The
   * reveal keeps its own reference either way, so this only adds a second one.
   */
  elementRef?: RefObject<HTMLElement | null>;
  /** Fitted headings stay hidden until the first measure after fonts land. */
  fitReady?: boolean;
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
  elementRef,
  fitReady,
  children,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  const attach = useCallback(
    (node: HTMLElement | null) => {
      ref.current = node;
      if (elementRef) {
        elementRef.current = node;
      }
    },
    [elementRef],
  );

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
      ref={attach}
      className={cn("reveal", className)}
      data-reveal={variant}
      data-reveal-stagger={stagger ? "true" : undefined}
      data-fit-ready={fitReady ? "true" : undefined}
      style={
        {
          ...style,
          ...(delay ? { "--reveal-delay": `${delay}s` } : null),
          ...(duration ? { "--reveal-dur": `${duration}s` } : null),
          ...(stagger ? { "--reveal-stagger": `${stagger}s` } : null),
        } as CSSProperties
      }
    >
      {/*
       * The mask's clip edge is carried by an inner box rather than by the
       * observed element, because an element clipped to nothing reports an
       * empty intersection rect and would never be told it had arrived.
       */}
      {variant === "mask" ? <span className="reveal-mask">{children}</span> : children}
    </Component>
  );
}

export interface RevealLinesProps {
  lines: string[];
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  immediate?: boolean;
  /**
   * Size the lines to span the measure at this tier rather than taking the tier
   * verbatim. Clone copy is arbitrary, so a display heading that fits one
   * development name will not fit the next; fitting makes the tier an aspiration
   * the heading is pulled back from only as far as the copy needs.
   */
  fit?: FitTier;
}

function Lines({ lines, lineClassName }: Pick<RevealLinesProps, "lines" | "lineClassName">) {
  return (
    <>
      {lines.map((line, index) => (
        <span key={`${line}-${index}`} className={cn("reveal-line", lineClassName)}>
          <span className="reveal-line-inner">{line}</span>
        </span>
      ))}
    </>
  );
}

/**
 * Convenience wrapper for a multi-line heading: each line unmasks in turn,
 * which reads as the line-level reveal used across the reference category.
 */
export function RevealLines({ fit, ...props }: RevealLinesProps) {
  /*
   * The fitted variant is a separate component because it carries a measuring
   * hook, and only the call sites that ask for a fit should pay for one. `fit`
   * is a property of the call site, so the branch never flips at runtime.
   */
  if (fit) {
    return <FittedRevealLines fit={fit} {...props} />;
  }

  return <PlainRevealLines {...props} />;
}

function PlainRevealLines({
  lines,
  as: Component = "h2",
  className,
  lineClassName,
  delay = 0,
  stagger = 0.08,
  immediate = false,
}: Omit<RevealLinesProps, "fit">) {
  return (
    <Reveal
      as={Component}
      variant="lines"
      stagger={stagger}
      delay={delay}
      immediate={immediate}
      className={cn("reveal-lines", className)}
    >
      <Lines lines={lines} lineClassName={lineClassName} />
    </Reveal>
  );
}

function FittedRevealLines({
  lines,
  as: Component = "h2",
  className,
  lineClassName,
  delay = 0,
  stagger = 0.08,
  immediate = false,
  fit,
}: RevealLinesProps & { fit: FitTier }) {
  const [ref, scale, ready] = useFitText<HTMLElement>(".reveal-line-inner", lines.join("|"));

  return (
    <Reveal
      as={Component}
      variant="lines"
      stagger={stagger}
      delay={delay}
      immediate={immediate}
      elementRef={ref}
      /*
       * The tier is a class, not an inline custom property: a section still has
       * to be able to step the tier down at a breakpoint, and an inline value
       * would outrank every stylesheet rule that tried.
       */
      className={cn("reveal-lines", "fit-heading", `fit-tier-${fit}`, className)}
      style={{ "--fit": scale } as CSSProperties}
      fitReady={ready}
    >
      <Lines lines={lines} lineClassName={lineClassName} />
    </Reveal>
  );
}
