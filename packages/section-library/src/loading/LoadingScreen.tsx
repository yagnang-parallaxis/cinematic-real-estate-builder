"use client";

import { Animated } from "@cinematic/animation-engine";
import { cn } from "@cinematic/ui";
import { useEffect, useState } from "react";

import { BrandMark } from "../shared/BrandMark";
import { LoaderArch, LoaderFrame } from "./LoaderArt";
import { loaderProgress, shouldHoldLoader } from "./logic";
import type { LoadingContent } from "./types";

const EXIT_MS = 450;

export function LoadingScreen({
  content,
  forceVisible = false,
}: {
  content: LoadingContent;
  forceVisible?: boolean;
}) {
  const [progress, setProgress] = useState(forceVisible ? 0.42 : 0);
  const [leaving, setLeaving] = useState(false);
  const [mounted, setMounted] = useState(true);
  const wordmark = content.wordmark ?? [content.brand];

  useEffect(() => {
    if (forceVisible) {
      setMounted(true);
      setLeaving(false);
      setProgress(0.42);
      return;
    }

    const started = performance.now();
    let frame = 0;
    let exitTimer = 0;

    const tick = (now: number) => {
      const elapsed = now - started;
      setProgress(loaderProgress(elapsed, content.maxDurationMs));

      if (!shouldHoldLoader(elapsed, content.maxDurationMs, false)) {
        setLeaving(true);
        exitTimer = window.setTimeout(() => setMounted(false), EXIT_MS);
        return;
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(exitTimer);
    };
  }, [content.maxDurationMs, forceVisible]);

  if (!mounted) {
    return null;
  }

  return (
    <div className={cn("loader", leaving && "is-leaving")} role="status" aria-live="polite" aria-busy="true">
      <LoaderFrame className="loader-frame" />
      <LoaderArch className="loader-arch" />

      <div className="loader-shell">
        <div className="loader-top">
          <BrandMark className="loader-mark" />
        </div>

        <div className="loader-lockup">
          {content.leftCaption ? <p className="loader-flank">{content.leftCaption}</p> : <span />}
          <div className="loader-wordmark">
            <Animated
              type="textReveal"
              config={{ duration: 0.9, trigger: "on-load" }}
              as="p"
              className="t-h2 loader-title"
            >
              {wordmark.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </Animated>
            {content.place ? (
              <Animated type="textReveal" config={{ duration: 0.8, delay: 0.08, trigger: "on-load" }}>
                <p className="loader-place">{content.place}</p>
              </Animated>
            ) : null}
          </div>
          {content.rightCaption ? <p className="loader-flank">{content.rightCaption}</p> : <span />}
        </div>

        <div className="loader-bottom">
          {content.progressStyle === "bar" ? (
            <div className="loader-progress" aria-hidden="true">
              <div className="loader-progress-track">
                <div className="loader-progress-fill" style={{ transform: `scaleY(${progress})` }} />
              </div>
            </div>
          ) : null}
          {content.tagline ? (
            <Animated type="fadeUp" config={{ duration: 0.7, delay: 0.12, trigger: "on-load" }}>
              <p className="t-label loader-tagline">
                {content.tagline.split("\n").map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
            </Animated>
          ) : null}
        </div>
      </div>
      <span className="sr-only">Loading {content.brand}</span>
    </div>
  );
}
