"use client";

import { cn } from "@cinematic/ui";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { Lockup } from "../hero/Lockup";
import type { HeroContent } from "../hero/types";
import {
  bootOpened,
  GATE_EVENT,
  OPEN_EVENT,
  shouldSkipBoot,
  taglineLines,
  wordmarkLines,
} from "../loading/logic";
import type { LoadingContent } from "../loading/types";
import { NAV_TONE_EVENT } from "../navigation/logic";
import {
  curtainArchPath,
  curtainFrameOut,
  curtainLockupOut,
  curtainNavTone,
  curtainPlatePath,
  curtainPlayProgress,
  curtainRingOffset,
  curtainRingOpacity,
  curtainSpent,
  curtainTaglineOut,
  curtainWindow,
} from "./curtain";

/** Used until the stage has been measured, so the first paint is not degenerate. */
const FALLBACK_STAGE = { width: 1440, height: 900 };

/**
 * The opening gate — a once-only preloader, not a page chapter.
 *
 * A brand plate with an arch cut out of it, played on a timer after the boot
 * plate leaves. Behind the hole is the hero photograph, held at its first
 * frame by `HomeOpen`. When the arch is full bleed the overlay unmounts and
 * the visitor is on the hero at the top of the page. A later load in the same
 * session never mounts this at all.
 */
export function Curtain({
  content,
  hero,
}: {
  content: LoadingContent;
  hero: HeroContent;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);

  const [live, setLive] = useState(true);
  const [stage, setStage] = useState(FALLBACK_STAGE);
  const [progress, setProgress] = useState(0);
  const [intro, setIntro] = useState(false);

  const lines = hero.headingLines ?? wordmarkLines({ brand: hero.heading });
  const tagline = taglineLines(content.tagline);

  const skip = useRef(shouldSkipBoot());

  useEffect(() => {
    if (skip.current) {
      setLive(false);
      return;
    }

    const opening = document.querySelector<HTMLElement>(".home-open");
    opening?.classList.add("is-opening");

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    let start = 0;
    let frame = 0;
    let playing = false;

    const tick = (now: number) => {
      if (!playing) {
        start = now;
        playing = true;
      }
      const next = curtainPlayProgress({
        elapsedMs: now - start,
        calm: calm.matches,
      });
      setProgress(next);
      const spent = curtainSpent(next);
      opening?.classList.toggle("is-opening", !spent);
      if (spent) {
        window.dispatchEvent(new Event(GATE_EVENT));
        setLive(false);
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const play = () => {
      setIntro(true);
      if (!frame) {
        frame = requestAnimationFrame(tick);
      }
    };

    window.addEventListener(OPEN_EVENT, play);
    if (bootOpened()) {
      play();
    }

    return () => {
      window.removeEventListener(OPEN_EVENT, play);
      if (frame) {
        cancelAnimationFrame(frame);
      }
      opening?.classList.remove("is-opening");
    };
  }, []);

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
  }, [live]);

  const win = curtainWindow(progress, stage);
  const ringOffset = curtainRingOffset(win, stage);
  const spent = curtainSpent(progress);
  const navTone = curtainNavTone(win, stage);
  const out = curtainLockupOut(progress);
  const frameOut = curtainFrameOut(progress);
  const taglineOut = curtainTaglineOut(progress);

  useEffect(() => {
    window.dispatchEvent(new Event(NAV_TONE_EVENT));
  }, [navTone]);

  if (!live || spent) {
    return null;
  }

  return (
    <div
      ref={stageRef}
      className={cn("curtain-stage", intro && "is-intro")}
      aria-hidden="true"
      style={
        {
          "--curtain-frame-out": frameOut.toFixed(4),
          "--curtain-tagline-out": taglineOut.toFixed(4),
        } as CSSProperties
      }
    >
      <svg
        className="curtain-plate"
        viewBox={`0 0 ${stage.width} ${stage.height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path className="curtain-plate-fill" fillRule="evenodd" d={curtainPlatePath(win, stage)} />
        <path
          className="curtain-plate-ring"
          d={curtainArchPath(win, stage, ringOffset)}
          style={{ opacity: curtainRingOpacity(progress) }}
        />
      </svg>

      <div className="curtain-shell">
        <div className="curtain-middle">
          <div
            className={cn("hero-copy hero-copy-brand curtain-copy", intro && "is-intro")}
            style={{ "--hero-brand-out": out.toFixed(4) } as CSSProperties}
          >
            <Lockup lines={lines} place={content.place ?? hero.place} titled={false} />
          </div>
        </div>

        <div className="curtain-foot">
          {content.leftCaption ? (
            <p className="t-label curtain-flank curtain-flank-left">{content.leftCaption}</p>
          ) : null}

          {tagline.length > 0 ? (
            <p className="t-label curtain-tagline">
              {tagline.map((line) => (
                <span key={line} className="curtain-tagline-line">
                  {line}
                </span>
              ))}
            </p>
          ) : null}

          {content.rightCaption ? (
            <p className="t-label curtain-flank curtain-flank-right">{content.rightCaption}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
