"use client";

import { Animated } from "@cinematic/animation-engine";
import { useEffect, useState } from "react";

import type { LoadingContent } from "./types";

export function LoadingScreen({
  content,
  forceVisible = false,
}: {
  content: LoadingContent;
  forceVisible?: boolean;
}) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (forceVisible) {
      setVisible(true);
      setProgress(0.42);
      return;
    }

    const started = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const ratio = Math.min((now - started) / content.maxDurationMs, 1);
      setProgress(ratio);
      if (ratio >= 1) {
        setVisible(false);
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [content.maxDurationMs, forceVisible]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className="bg-background animate-loader-out fixed inset-0 z-[70] flex flex-col items-center justify-center gap-8 px-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{ animationDelay: forceVisible ? "9999s" : `${content.maxDurationMs}ms` }}
      onAnimationEnd={() => {
        if (!forceVisible) {
          setVisible(false);
        }
      }}
    >
      <Animated type="textReveal" config={{ duration: 0.8 }}>
        <p className="t-label text-primary">{content.brand}</p>
      </Animated>
      {content.tagline ? (
        <Animated type="fadeUp" config={{ duration: 0.7, delay: 0.1 }}>
          <p className="t-h3 max-w-md text-center">{content.tagline}</p>
        </Animated>
      ) : null}
      {content.progressStyle === "bar" ? (
        <div className="bg-border h-px w-40 overflow-hidden" aria-hidden="true">
          <div
            className="bg-primary h-full transition-none"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      ) : null}
      <span className="sr-only">Loading {content.brand}</span>
    </div>
  );
}
