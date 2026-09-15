"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";

import { BrandMark } from "../shared/BrandMark";
import {
  ARCH_SCROLL_VH,
  ARCH_STATIC_PROGRESS,
  archGeometry,
  archInteriorTop,
  archPath,
  archTextPath,
  archTextRun,
  archWordGaps,
  curvedTextOpacity,
  archNavTone,
  hidesHeroChrome,
  interiorOpacity,
  pinProgress,
  settleProgress,
  type ArchTextMetrics,
} from "./logic";
import type { ArchRevealContent } from "./types";

export type { ArchRevealContent } from "./types";

/** Used until the stage has been measured, so the first paint is not degenerate. */
const FALLBACK_STAGE = { width: 1440, height: 900 };

/**
 * The handoff after the hero photograph has been scrolled: an Era-style arch
 * rises from the bottom as a growing circular slice until it is a full-width
 * semicircle, carrying the incoming heading along its curve. The photograph
 * stays visible above the arc — the rise never becomes a title card.
 *
 * When composed inside HomeOpen, the photograph is the chapter's sticky media
 * — this section draws only the arch. Standalone, it can still carry its own
 * backdropSrc.
 *
 * The arch is scrubbed by scroll on the desktop breakpoint only. Below it, and
 * under reduced motion, the same composition is held at a fixed point part way
 * up — the arch and its lettering still read, but nothing is coupled to scroll.
 */
export function ArchReveal({
  content,
  omitBackdrop = false,
  /** Fraction of the scrub spent settling before the dome begins to rise. */
  riseAfter = 0,
}: {
  content: ArchRevealContent;
  omitBackdrop?: boolean;
  riseAfter?: number;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const tokenRef = useRef<SVGTextElement | null>(null);
  const floorRef = useRef<SVGTextElement | null>(null);

  const [stage, setStage] = useState(FALLBACK_STAGE);
  const [progress, setProgress] = useState(ARCH_STATIC_PROGRESS);
  const [scrubbing, setScrubbing] = useState(false);
  const [metrics, setMetrics] = useState<ArchTextMetrics | null>(null);

  const arcId = `arch-arc-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    const node = stageRef.current;
    if (!node) {
      return;
    }

    const sync = () => {
      const rect = node.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setStage({ width: Math.round(rect.width), height: Math.round(rect.height) });
      }
    };

    sync();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", sync);
      return () => window.removeEventListener("resize", sync);
    }

    const observer = new ResizeObserver(sync);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /*
   * What the copy costs to set, measured rather than assumed: the fit needs the
   * line's natural width per em, and the two tiers CSS is asking for in px. A
   * hidden twin carries the token size so the live line can be given a derived
   * one without the measurement chasing its own tail.
   */
  useEffect(() => {
    const token = tokenRef.current;
    const floor = floorRef.current;
    if (!token || !floor) {
      return;
    }

    let cancelled = false;

    const measure = () => {
      if (cancelled) {
        return;
      }
      const tokenSize = Number.parseFloat(window.getComputedStyle(token).fontSize);
      const minSize = Number.parseFloat(window.getComputedStyle(floor).fontSize);
      const natural = token.getComputedTextLength();
      if (!(tokenSize > 0) || !(natural > 0)) {
        return;
      }
      setMetrics({
        emWidth: natural / tokenSize,
        gaps: archWordGaps(content.curvedText),
        tokenSize,
        minSize: Number.isFinite(minSize) ? minSize : 0,
      });
    };

    measure();
    /* A display Didone is a web font; its metrics land after the first paint. */
    document.fonts?.ready.then(measure).catch(() => {});

    return () => {
      cancelled = true;
    };
    /* The stage dependency re-measures on resize — both tiers are viewport-relative. */
  }, [content.curvedText, stage.width]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const desktop = window.matchMedia("(min-width: 992px)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;
    let active = false;

    const update = () => {
      frame = 0;
      const raw = pinProgress(section.getBoundingClientRect(), window.innerHeight);
      const delay = Math.min(0.45, Math.max(0, riseAfter));
      const mapped = delay >= 0.999 ? raw : Math.min(1, Math.max(0, (raw - delay) / (1 - delay)));
      setProgress(settleProgress(mapped));
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
      setScrubbing(enabled);

      if (enabled) {
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        update();
      } else {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        setProgress(ARCH_STATIC_PROGRESS);
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
  }, [riseAfter]);

  const geometry = archGeometry(progress, stage);
  const overCta = hidesHeroChrome(progress);
  /*
   * The heading is sized off the arc it has to fit rather than off the scale, so
   * it neither wraps most of the way around the dome on a wide stage nor has its
   * tracking squeezed negative on a narrow one. The words then spread into
   * whatever room is left, which is the reference's own mechanism.
   */
  const run = archTextRun(geometry, metrics, progress, content.curvedWordSpacing ?? 1);
  const navTone = archNavTone(geometry, stage);

  /*
   * The fixed navigation picks its contrast by sampling `data-nav-tone` on the
   * scroll event. This section's tone is rendered from state, which lands a
   * frame later — so without a nudge after the swap the nav keeps the tone it
   * read before it.
   */
  useEffect(() => {
    window.dispatchEvent(new Event("scroll"));
  }, [navTone]);

  return (
    <section
      ref={sectionRef}
      id={content.id}
      aria-label={content.label}
      data-tone={content.tone}
      data-nav-tone={navTone}
      data-arch-scrub={scrubbing ? "true" : undefined}
      data-arch-covered={overCta ? "true" : undefined}
      className="arch"
      style={{ "--arch-run": `${ARCH_SCROLL_VH}svh` } as CSSProperties}
    >
      <div ref={stageRef} className="arch-stage">
        {!omitBackdrop && content.backdropSrc ? (
          <div className="arch-backdrop" aria-hidden="true">
            <img
              src={content.backdropSrc}
              alt=""
              className="arch-backdrop-image"
              style={
                scrubbing
                  ? ({ translate: `0 ${(-progress * 3).toFixed(2)}%` } as CSSProperties)
                  : undefined
              }
            />
            <div className="arch-backdrop-grade" />
          </div>
        ) : null}

        {content.enterFrom ? (
          <div className="arch-enter" data-seam-tone={content.enterFrom} aria-hidden="true" />
        ) : null}

        <svg
          className="arch-svg"
          viewBox={`0 0 ${stage.width} ${stage.height}`}
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <path id={arcId} d={archTextPath(geometry, run.inset)} fill="none" />
          </defs>

          <path d={archPath(geometry)} className="arch-dome" />

          <text
            className="arch-curve"
            style={
              {
                opacity: curvedTextOpacity(progress),
                fontSize: run.fontSize === null ? undefined : `${run.fontSize.toFixed(2)}px`,
                wordSpacing: `${run.wordSpacingEm.toFixed(4)}em`,
              } as CSSProperties
            }
          >
            <textPath
              href={`#${arcId}`}
              startOffset="50%"
              textAnchor="middle"
              /*
               * Absent on any copy the fit could size to the arc. Where it is
               * set, spacing only: the Didone's hairlines do not survive
               * scaling, and the shortfall lands on the tracking instead.
               */
              textLength={run.forcedLength ?? undefined}
              lengthAdjust={run.forcedLength === null ? undefined : "spacing"}
              /* Sit just inside the rim — small blue margin, not a deep inset. */
              dy="0.78em"
            >
              {content.curvedText}
            </textPath>
          </text>

          {/*
           * Measured, never drawn. The first carries the tier CSS asks for, so
           * the copy's natural width per em can be read at a size the fit has
           * not already changed; the second carries the floor the fit may not
           * pass, which is a token rather than a number this file can know.
           */}
          <g className="arch-measure" aria-hidden="true">
            <text ref={tokenRef} className="arch-curve">
              {content.curvedText}
            </text>
            <text ref={floorRef} className="arch-curve arch-curve-floor" />
          </g>
        </svg>

        {/*
         * The heading is on the curve inside an aria-hidden drawing, so it is
         * repeated here for anything that reads the page rather than sees it.
         */}
        <h2 className="sr-only">{content.curvedText}</h2>

        <div
          className="arch-interior"
          style={{
            opacity: interiorOpacity(progress),
            top: `${archInteriorTop(geometry, run.inset, stage.height).toFixed(1)}px`,
          }}
        >
          <div className="arch-mark-row">
            {content.leftCaption ? (
              <span className="t-label arch-flank">{content.leftCaption}</span>
            ) : (
              <span />
            )}
            <BrandMark className="arch-mark" />
            {content.rightCaption ? (
              <span className="t-label arch-flank">{content.rightCaption}</span>
            ) : (
              <span />
            )}
          </div>

          <span className="arch-rule" aria-hidden="true" />

          {content.tagline && content.tagline.length > 0 ? (
            <p className="t-label arch-tagline">
              {content.tagline.map((line) => (
                <span key={line} className="arch-tagline-line">
                  {line}
                </span>
              ))}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
