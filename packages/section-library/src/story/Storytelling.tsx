"use client";

import { Animated } from "@cinematic/animation-engine";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import { HoverSlide } from "../shared/HoverSlide";
import { useFitText } from "../shared/useFitText";
import {
  STORY_AUTO_MS,
  canAutoAdvance,
  clampBeats,
  formatBeatNumber,
  nextIndex,
  prevIndex,
  swipeStep,
  titleEnterDelay,
  titleWords,
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

function TitleRun({ title, leaving }: { title: string; leaving?: boolean }) {
  const words = titleWords(title);
  return (
    <span className={leaving ? "story-title-run is-out" : "story-title-run"} aria-hidden={leaving}>
      {words.map((word, wordIndex) => (
        <span
          key={`${word}-${wordIndex}`}
          className="story-title-word"
          style={
            {
              "--i": wordIndex,
              "--n": words.length,
            } as CSSProperties
          }
        >
          {wordIndex > 0 ? "\u00a0" : null}
          {word}
        </span>
      ))}
    </span>
  );
}

export function Storytelling({ content }: { content: StoryContent }) {
  const beats = clampBeats(content.beats);
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [inView, setInView] = useState(false);
  const dragX = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const beat = beats[index];
  const labelId = useId();
  const [titleRef, titleFit, titleReady] = useFitText<HTMLHeadingElement>(
    ".story-title-run:not(.is-out)",
    beat?.title ?? "",
  );

  const goTo = (next: number) => {
    if (next === index || !beats[next]) {
      return;
    }
    setLeaving(beat?.title ?? null);
    setIndex(next);
  };

  useEffect(() => {
    if (!leaving) {
      return;
    }
    const clear = window.setTimeout(() => setLeaving(null), titleEnterDelay(leaving));
    return () => window.clearTimeout(clear);
  }, [leaving]);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.45 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!canAutoAdvance({ inView, reducedMotion: calm.matches, count: beats.length })) {
      return;
    }

    const tick = window.setInterval(() => {
      setIndex((current) => {
        const next = nextIndex(current, beats.length);
        setLeaving(beats[current]?.title ?? null);
        return next;
      });
    }, STORY_AUTO_MS);

    return () => window.clearInterval(tick);
  }, [beats.length, beats, inView, index]);

  if (!beat) {
    return null;
  }

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
    <section
      ref={sectionRef}
      id="story"
      data-tone="color"
      data-nav-tone="on-color"
      className="story"
    >
      <div className="story-shell">
        <div
          className="story-browser"
          role="region"
          aria-roledescription="carousel"
          aria-labelledby={labelId}
          tabIndex={0}
          style={{ "--story-auto": `${STORY_AUTO_MS}ms` } as CSSProperties}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            dragX.current = null;
          }}
          onKeyDown={onKeyDown}
        >
          <p id={labelId} className="sr-only">
            {beat.title}
          </p>

          <div className="story-plate">
            <h2
              ref={titleRef}
              className="t-display story-title"
              data-fit-ready={titleReady ? "true" : undefined}
              aria-live="polite"
              style={{ "--story-fit": titleFit } as CSSProperties}
            >
              {leaving ? (
                <TitleRun key={`out-${leaving}`} title={leaving} leaving />
              ) : (
                <TitleRun key={beat.title} title={beat.title} />
              )}
            </h2>

            <article className="story-slide" aria-live="polite" aria-atomic="true">
              <Animated
                key={`${beat.title}-image`}
                type="carousel"
                config={{ duration: 0.85, trigger: "on-load" }}
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
                  <span className="t-label">
                    {formatBeatNumber(prevIndex(index, beats.length))}
                  </span>
                </HoverSlide>
              </button>
              <div className="story-pag-track" aria-hidden="true">
                <span key={index} className="story-pag-fill" />
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
