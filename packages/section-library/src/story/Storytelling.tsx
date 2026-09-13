"use client";

import { Animated } from "@cinematic/animation-engine";
import { useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import { HoverSlide } from "../shared/HoverSlide";
import {
  clampBeats,
  formatBeatNumber,
  nextIndex,
  prevIndex,
  slideProgress,
  swipeStep,
} from "./logic";
import type { StoryContent } from "./types";

export type { StoryBeat, StoryContent } from "./types";

function PagArrow({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="story-pag-ico">
      <path
        d={direction === "prev" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"}
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

export function Storytelling({ content }: { content: StoryContent }) {
  const beats = clampBeats(content.beats);
  const [index, setIndex] = useState(0);
  const dragX = useRef<number | null>(null);
  const headingLines = content.headingLines ?? [content.heading];
  const beat = beats[index];
  const labelId = useId();

  if (!beat) {
    return null;
  }

  const goTo = (next: number) => {
    setIndex(next);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }

    dragX.current = event.clientX;
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragX.current == null) {
      return;
    }

    const step = swipeStep(event.clientX - dragX.current);
    dragX.current = null;

    if (step === 1) {
      goTo(nextIndex(index, beats.length));
    }

    if (step === -1) {
      goTo(prevIndex(index, beats.length));
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(nextIndex(index, beats.length));
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(prevIndex(index, beats.length));
    }
  };

  return (
    <section id="story" data-tone="color" data-nav-tone="on-color" className="story">
      <div className="story-shell">
        <div
          className="story-browser"
          role="region"
          aria-roledescription="carousel"
          aria-labelledby={labelId}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            dragX.current = null;
          }}
          onKeyDown={onKeyDown}
        >
          <p id={labelId} className="sr-only">
            {content.heading}
          </p>

          <div className="story-plate">
            <Animated
              type="textReveal"
              config={{ duration: 1.1, trigger: "on-scroll-enter" }}
              as="h2"
              className="t-display story-title"
            >
              {headingLines.map((line, lineIndex) => (
                <span key={line}>
                  {lineIndex > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </Animated>

            <article className="story-slide" aria-live="polite" aria-atomic="true">
              <Animated
                key={`${beat.title}-image`}
                type="carousel"
                config={{ duration: 0.7, trigger: "on-load" }}
                className="story-slide-media"
              >
                <img src={beat.imageSrc} alt={beat.imageAlt} className="story-slide-image" />
              </Animated>
            </article>
          </div>

          <div className="story-follow">
            <div className="story-pag">
              <button
                type="button"
                className="story-pag-btn"
                aria-label="Previous"
                onClick={() => goTo(prevIndex(index, beats.length))}
              >
                <PagArrow direction="prev" />
                <HoverSlide align="center">
                  <span className="t-label">{formatBeatNumber(prevIndex(index, beats.length))}</span>
                </HoverSlide>
              </button>
              <div className="story-pag-track" aria-hidden="true">
                <span
                  className="story-pag-fill"
                  style={{ width: `${slideProgress(index, beats.length)}%` }}
                />
              </div>
              <button
                type="button"
                className="story-pag-btn"
                aria-label="Next"
                onClick={() => goTo(nextIndex(index, beats.length))}
              >
                <HoverSlide align="center">
                  <span className="t-label">{formatBeatNumber(index)}</span>
                </HoverSlide>
                <PagArrow direction="next" />
              </button>
            </div>

            <div className="story-slide-copy">
              <Animated
                key={`${beat.title}-body`}
                type="fadeUp"
                config={{ duration: 0.7, trigger: "on-load" }}
              >
                <p className="t-body story-slide-body">{beat.body}</p>
              </Animated>
              <Animated
                key={`${beat.title}-cap`}
                type="fadeUp"
                config={{ duration: 0.6, delay: 0.06, trigger: "on-load" }}
              >
                <p className="t-label story-slide-caption">{content.caption}</p>
              </Animated>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
