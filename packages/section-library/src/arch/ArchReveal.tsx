"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";

import { BrandMark } from "../shared/BrandMark";
import { navContrastForTone } from "../shared/tone";
import {
  ARCH_STATIC_PROGRESS,
  archGeometry,
  archInteriorTop,
  archPath,
  archTextInset,
  archTextPath,
  coversStage,
  curvedTextOpacity,
  curvedWordSpacingEm,
  interiorOpacity,
  pinProgress,
} from "./logic";
import type { ArchRevealContent } from "./types";

export type { ArchRevealContent } from "./types";

/** Used until the stage has been measured, so the first paint is not degenerate. */
const FALLBACK_STAGE = { width: 1440, height: 900 };

/**
 * The handoff after the hero photograph has been scrolled: an Era-style arch
 * rises from the bottom — first as a growing semicircle, then as a full-width
 * curved panel with straight sides — until it covers the stage in the incoming
 * tone, carrying the incoming heading along its curve.
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

  const [stage, setStage] = useState(FALLBACK_STAGE);
  const [progress, setProgress] = useState(ARCH_STATIC_PROGRESS);
  const [scrubbing, setScrubbing] = useState(false);

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
      const mapped =
        delay >= 0.999 ? raw : Math.min(1, Math.max(0, (raw - delay) / (1 - delay)));
      setProgress(mapped);
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
  const inset = archTextInset(geometry, stage);
  const covered = coversStage(progress);
  const wordSpacing = curvedWordSpacingEm(progress, content.curvedWordSpacing ?? 1);

  /*
   * The fixed navigation picks its contrast by sampling `data-nav-tone` on the
   * scroll event. This section's tone is rendered from state, which lands a
   * frame later — so without a nudge after the swap the nav keeps the tone it
   * read before it, and is left light on a light dome once scrolling stops.
   */
  useEffect(() => {
    window.dispatchEvent(new Event("scroll"));
  }, [covered]);

  return (
    <section
      ref={sectionRef}
      id={content.id}
      aria-label={content.label}
      data-tone={content.tone}
      /* While the photograph still shows, the fixed nav is sitting on it. */
      data-nav-tone={covered ? navContrastForTone(content.tone) : "on-media"}
      data-arch-scrub={scrubbing ? "true" : undefined}
      data-arch-covered={covered ? "true" : undefined}
      className="arch"
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
            <path id={arcId} d={archTextPath(geometry, inset, progress)} fill="none" />
          </defs>

          <path d={archPath(geometry)} className="arch-dome" />

          <text
            className="arch-curve"
            style={
              {
                opacity: curvedTextOpacity(progress),
                wordSpacing: `${wordSpacing.toFixed(3)}em`,
              } as CSSProperties
            }
          >
            <textPath
              href={`#${arcId}`}
              startOffset="50%"
              textAnchor="middle"
              /* Sit just inside the rim — small blue margin, not a deep inset. */
              dy="0.78em"
            >
              {content.curvedText}
            </textPath>
          </text>
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
            /* Kept below the lettering, which sits lower the lower the dome is. */
            top: `${archInteriorTop(geometry, inset, stage.height).toFixed(1)}px`,
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
