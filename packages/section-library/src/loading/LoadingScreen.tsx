"use client";

import { cn } from "@cinematic/ui";
import { useEffect, useState, type CSSProperties } from "react";

import { BrandMark } from "../shared/BrandMark";
import { clampHoldMs, taglineLines, wordmarkLines } from "./logic";
import type { LoadingContent } from "./types";

const EXIT_MS = 450;

/**
 * The screen that covers the page while it boots.
 *
 * Its entry is animated entirely in CSS. That is the whole point of this
 * component: it is on screen *because* JavaScript has not finished, so nothing
 * about its composition may wait for an effect to run — a scroll-entry reveal
 * here would leave an empty field until hydration. JavaScript is used for one
 * thing only, deciding when to leave.
 */
export function LoadingScreen({
  content,
  forceVisible = false,
}: {
  content: LoadingContent;
  forceVisible?: boolean;
}) {
  const [leaving, setLeaving] = useState(false);
  const [mounted, setMounted] = useState(true);

  const wordmark = wordmarkLines(content);
  const tagline = taglineLines(content.tagline);
  const holdMs = clampHoldMs(content.maxDurationMs);

  useEffect(() => {
    if (forceVisible) {
      setLeaving(false);
      setMounted(true);
      return;
    }

    const leave = window.setTimeout(() => setLeaving(true), holdMs);
    const unmount = window.setTimeout(() => setMounted(false), holdMs + EXIT_MS);

    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(unmount);
    };
  }, [forceVisible, holdMs]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn("loader", leaving && "is-leaving")}
      /* The rule below the wordmark is animated over exactly this hold. */
      style={{ "--loader-hold": `${holdMs}ms` } as CSSProperties}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="loader-shell">
        <div className="loader-top">
          <BrandMark className="loader-mark" />
        </div>

        <div className="loader-middle">
          <div className="loader-lockup">
            {content.leftCaption ? (
              <p className="t-label loader-flank loader-flank-left">{content.leftCaption}</p>
            ) : null}

            <div className="loader-wordmark">
              <p className="t-h2 loader-title">
                {wordmark.map((line, index) => (
                  <span key={line} className="loader-title-line">
                    <span
                      className="loader-title-line-inner"
                      style={{ "--line": index } as CSSProperties}
                    >
                      {line}
                    </span>
                  </span>
                ))}
              </p>

              {/*
               * The script crosses the wordmark's last line, so it sits over
               * the lockup rather than inside a masked line — a clipped line
               * would cut its swash off.
               */}
              {content.place ? <p className="loader-place">{content.place}</p> : null}
            </div>

            {content.rightCaption ? (
              <p className="t-label loader-flank loader-flank-right">{content.rightCaption}</p>
            ) : null}
          </div>
        </div>

        {/*
         * Progress + tagline live in the foot, not under the lockup. Keeping the
         * rule out of the centred stack is what stops it painting through the
         * hanging Harbor script on desktop.
         */}
        <div className="loader-foot">
          {content.progressStyle === "bar" ? (
            <div className="loader-progress" aria-hidden="true">
              {/* The track draws itself downward; the fill inside carries the hold. */}
              <div className="loader-progress-track">
                <span className="loader-progress-fill" />
              </div>
            </div>
          ) : null}

          {tagline.length > 0 ? (
            <p className="t-label loader-tagline">
              {tagline.map((line) => (
                <span key={line} className="loader-tagline-line">
                  {line}
                </span>
              ))}
            </p>
          ) : null}
        </div>
      </div>

      <span className="sr-only">Loading {content.brand}</span>
    </div>
  );
}
