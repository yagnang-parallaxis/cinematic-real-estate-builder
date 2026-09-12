"use client";

import { Animated } from "@cinematic/animation-engine";
import { useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import { BrandMark } from "../navigation/BrandMark";
import { HoverSlide } from "../navigation/HoverSlide";
import {
  clampBeats,
  formatSlideLabel,
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
    <section id="story" data-nav-tone="on-light" className="story">
      <div className="story-intro">
        <Animated
          type="textReveal"
          config={{ duration: 1.1, trigger: "on-load" }}
          as="h2"
          className="t-display story-title"
        >
          {headingLines.map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
        </Animated>

        <div className="story-lockup">
          <Animated
            type="fadeUp"
            config={{ duration: 0.8, delay: 0.08, trigger: "on-load" }}
            className="story-flanks"
          >
            <p className="t-label story-flank">{content.leftCaption}</p>
            <BrandMark className="story-mark" />
            <p className="t-label story-flank">{content.rightCaption}</p>
          </Animated>
          <div className="story-rule" aria-hidden="true">
            <Animated type="fadeUp" config={{ duration: 0.7, delay: 0.12, trigger: "on-load" }}>
              <span className="story-rule-line" />
            </Animated>
          </div>
          <Animated type="textReveal" config={{ duration: 0.8, delay: 0.16, trigger: "on-load" }}>
            <p className="t-label story-tagline">{content.tagline}</p>
          </Animated>
        </div>
      </div>

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

        <article className="story-slide" aria-live="polite" aria-atomic="true">
          <div className="story-slide-top">
            <Animated
              key={`${beat.title}-title`}
              type="textReveal"
              config={{ duration: 0.8, trigger: "on-load" }}
            >
              <h3 className="t-h1 story-slide-title">{beat.title}</h3>
            </Animated>
          </div>

          <Animated
            key={`${beat.title}-image`}
            type="carousel"
            config={{ duration: 0.7, trigger: "on-load" }}
            className="story-slide-media"
          >
            <img src={beat.imageSrc} alt={beat.imageAlt} className="story-slide-image" />
          </Animated>

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
        </article>

        <div className="story-pag">
          <button
            type="button"
            className="story-pag-btn"
            aria-label="Previous reason"
            onClick={() => goTo(prevIndex(index, beats.length))}
          >
            <PagArrow direction="prev" />
            <HoverSlide align="center">
              <span className="t-label">{formatSlideLabel(index)}</span>
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
            aria-label="Next reason"
            onClick={() => goTo(nextIndex(index, beats.length))}
          >
            <HoverSlide align="center">
              <span className="t-label">{formatSlideLabel(nextIndex(index, beats.length))}</span>
            </HoverSlide>
            <PagArrow direction="next" />
          </button>
        </div>
      </div>
    </section>
  );
}
