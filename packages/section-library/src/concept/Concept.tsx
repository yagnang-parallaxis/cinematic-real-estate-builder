"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

import { Reveal, RevealLines } from "../shared/Reveal";
import { Section } from "../shared/Section";
import { FloralCorner } from "./FloralCorner";
import {
  activePanelIndex,
  clampIndex,
  floralAccentsForPanel,
  formatCount,
  labelAlign,
  labelPlacement,
  panelEntryProgress,
  pinnedScrollSpan,
  pinProgress,
  revealedWaypointCount,
  smoothApproach,
  stripIndex,
  toPercent,
  trackTranslation,
} from "./logic";
import type { ConceptContent, ConceptFloralPanel } from "./types";

export type {
  ConceptBetweenPanel,
  ConceptContent,
  ConceptIntroPanel,
  ConceptPole,
  ConceptFloral,
  ConceptFloralAccent,
  ConceptFloralCorner,
  ConceptFloralPlace,
  ConceptRoutePanel,
  ConceptWaypoint,
} from "./types";

const PANEL_COUNT = 3;
const ROUTE_PANEL_INDEX = 2;

/** Fraction of the remaining gap closed each frame — lower trails softer. */
const SMOOTH_FACTOR = 0.14;

const PLOT_WIDTH = 1200;
const PLOT_HEIGHT = 420;

/**
 * The route is drawn as a walk rather than a map: each cubic segment ends on a
 * waypoint, so the coordinates in the content sit exactly on the line.
 */
const ROUTE_PATH = [
  "M 62 330",
  "C 130 318 190 300 270 262",
  "C 330 232 386 206 452 214",
  "C 528 224 588 272 664 276",
  "C 760 280 838 244 900 190",
  "C 968 130 1046 100 1138 92",
].join(" ");

const SHORE_PATH = "M 0 398 C 180 378 306 390 452 366 S 742 336 900 306 S 1108 264 1200 238";
const SHORE_FILL = `${SHORE_PATH} L ${PLOT_WIDTH} ${PLOT_HEIGHT} L 0 ${PLOT_HEIGHT} Z`;

function FloralAccents({
  floral,
  panel,
}: {
  floral: ConceptContent["floral"];
  panel: ConceptFloralPanel;
}) {
  const accents = floralAccentsForPanel(floral, panel);
  if (!accents.length) {
    return null;
  }

  return (
    <>
      {accents.map((accent) => (
        <FloralCorner key={accent.place} {...accent} />
      ))}
    </>
  );
}

function DragArrow() {
  return (
    <svg viewBox="0 0 40 8" fill="none" aria-hidden="true" className="concept-hint-arrow">
      <path d="M0 4h37M32 1l6 3-6 3" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function Concept({ content }: { content: ConceptContent }) {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const screenRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<SVGPathElement | null>(null);
  const walkerRef = useRef<SVGCircleElement | null>(null);
  const indexRef = useRef(0);
  const revealedRef = useRef(0);

  const [pinned, setPinned] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [drawn, setDrawn] = useState(false);
  const [pinnedRevealed, setPinnedRevealed] = useState(0);

  const waypoints = content.route.waypoints;
  const revealed = pinned ? pinnedRevealed : drawn ? waypoints.length : 0;
  const [nearPole, farPole] = content.between.poles;

  useEffect(() => {
    const area = areaRef.current;
    const screen = screenRef.current;
    const track = trackRef.current;
    if (!area || !screen || !track) {
      return;
    }

    const desktop = window.matchMedia("(min-width: 992px)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let attached = false;
    let target = 0;
    let display = 0;

    // The raw scroll-derived position for this frame. Read on scroll/resize
    // rather than every tick, since it never changes between them.
    const measure = () => {
      const rect = area.getBoundingClientRect();
      target = pinProgress({
        areaTop: rect.top + window.scrollY,
        areaHeight: rect.height,
        viewportHeight: window.innerHeight,
        scrollY: window.scrollY,
      });
    };

    // Paints a given (smoothed) progress and derives the discrete states from
    // it, so the active panel and waypoint reveals change in step with what
    // is visually on screen rather than jumping ahead of the eased track.
    const paint = (progress: number) => {
      const shift = trackTranslation(progress, {
        trackWidth: track.offsetWidth,
        viewportWidth: screen.clientWidth,
      });

      track.style.setProperty("--concept-x", `${shift.toFixed(2)}px`);
      const entry = panelEntryProgress(progress, PANEL_COUNT, ROUTE_PANEL_INDEX);
      plotRef.current?.style.setProperty("--concept-path-drawn", entry.toFixed(4));

      const line = lineRef.current;
      const walker = walkerRef.current;
      if (line && walker) {
        const point = line.getPointAtLength(entry * line.getTotalLength());
        walker.setAttribute("cx", point.x.toFixed(1));
        walker.setAttribute("cy", point.y.toFixed(1));
      }

      const index = activePanelIndex(progress, PANEL_COUNT);
      if (index !== indexRef.current) {
        indexRef.current = index;
        setActiveIndex(index);
      }

      const count = revealedWaypointCount(
        panelEntryProgress(progress, PANEL_COUNT, ROUTE_PANEL_INDEX),
        waypoints.length,
      );
      if (count !== revealedRef.current) {
        revealedRef.current = count;
        setPinnedRevealed(count);
      }
    };

    // Eases the displayed position toward the target every frame, so the pin
    // trails the scrollbar with a soft, inertial lag instead of snapping to
    // it — the loop keeps ticking under its own motion until it converges,
    // even after the user has stopped scrolling.
    const tick = () => {
      raf = 0;
      display = smoothApproach(display, target, SMOOTH_FACTOR);
      paint(display);
      if (display !== target) {
        raf = requestAnimationFrame(tick);
      }
    };

    const onScroll = () => {
      measure();
      if (!raf) {
        raf = requestAnimationFrame(tick);
      }
    };

    const sync = () => {
      const enabled = desktop.matches && !calm.matches;
      setPinned(enabled);
      if (enabled === attached) {
        return;
      }

      attached = enabled;
      if (enabled) {
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        // Jump straight to position on activation — nothing to ease from yet.
        measure();
        display = target;
        paint(display);
      } else {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
        target = 0;
        display = 0;
        track.style.removeProperty("--concept-x");
        plotRef.current?.style.removeProperty("--concept-path-drawn");
        indexRef.current = 0;
        revealedRef.current = 0;
        setActiveIndex(0);
        setPinnedRevealed(0);
      }
    };

    sync();
    desktop.addEventListener("change", sync);
    calm.addEventListener("change", sync);

    return () => {
      if (raf) {
        cancelAnimationFrame(raf);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      desktop.removeEventListener("change", sync);
      calm.removeEventListener("change", sync);
    };
  }, [waypoints.length]);

  // The compact strip reports its own position so the rail still tracks it.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || pinned) {
      return;
    }

    let frame = 0;
    const read = () => {
      frame = 0;
      const index = stripIndex(track.scrollLeft, track.clientWidth, PANEL_COUNT);
      if (index !== indexRef.current) {
        indexRef.current = index;
        setActiveIndex(index);
      }
    };

    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(read);
      }
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    read();

    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }
      track.removeEventListener("scroll", onScroll);
    };
  }, [pinned]);

  useEffect(() => {
    const line = lineRef.current;
    const plot = plotRef.current;
    if (line && plot) {
      plot.style.setProperty("--concept-path-len", `${Math.ceil(line.getTotalLength())}`);
    }

    if (!plot) {
      return;
    }

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (calm.matches || typeof IntersectionObserver === "undefined") {
      setDrawn(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setDrawn(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(plot);
    return () => observer.disconnect();
  }, []);

  // The strip is a scroll container of its own, so it answers to the arrow keys.
  const onStripKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (pinned || !track || step === 0) {
      return;
    }

    event.preventDefault();
    const from = stripIndex(track.scrollLeft, track.clientWidth, PANEL_COUNT);
    track.scrollTo({
      left: clampIndex(from + step, PANEL_COUNT) * track.clientWidth,
      behavior: "smooth",
    });
  };

  const panelState = (index: number) => {
    if (index === activeIndex) {
      return "active";
    }

    return index < activeIndex ? "past" : "coming";
  };

  return (
    <Section id="concept" tone="light" label={content.label} className="concept" navScrim>
      <div
        ref={areaRef}
        className="concept-area"
        style={{ "--concept-span": `${pinnedScrollSpan(PANEL_COUNT)}` } as CSSProperties}
      >
        <div ref={screenRef} className="concept-screen">
          <div className="concept-brow">
            <p className="t-label concept-count" aria-hidden="true">
              {formatCount(activeIndex + 1)} / {formatCount(PANEL_COUNT)}
            </p>
          </div>

          <p className="t-label concept-hint drag-hint">
            <DragArrow />
            {content.dragHint}
          </p>

          <div
            ref={trackRef}
            className="concept-track"
            role="group"
            aria-label={content.label}
            tabIndex={pinned ? undefined : 0}
            onKeyDown={onStripKeyDown}
          >
            <article className="concept-panel" data-panel="intro" data-state={panelState(0)}>
              <FloralAccents floral={content.floral} panel="intro" />
              <Reveal variant="block" className="t-label concept-eyebrow">
                {content.intro.eyebrow}
              </Reveal>
              <RevealLines
                lines={content.intro.headingLines}
                className="t-h1 concept-heading"
                delay={0.06}
                fit="h1"
              />
              <div className="concept-copy">
                <Reveal variant="block" delay={0.12}>
                  <p className="t-lead">{content.intro.body}</p>
                </Reveal>
              </div>
              <Reveal variant="block" delay={0.18} className="t-caption concept-aside">
                {content.intro.aside}
              </Reveal>
            </article>

            <article className="concept-panel" data-panel="between" data-state={panelState(1)}>
              <FloralAccents floral={content.floral} panel="between" />
              <Reveal variant="block" className="t-label concept-eyebrow">
                {content.between.eyebrow}
              </Reveal>
              <RevealLines
                lines={content.between.headingLines}
                className="t-h2 concept-heading"
                delay={0.06}
                fit="h2"
              />
              <div className="concept-between">
                <Reveal variant="block" delay={0.1} className="concept-pole">
                  <p className="t-label concept-pole-label">{nearPole.label}</p>
                  <p className="t-body">{nearPole.body}</p>
                </Reveal>
                <Reveal variant="media" delay={0.14} className="concept-plate">
                  <img src={content.between.imageSrc} alt={content.between.imageAlt} />
                </Reveal>
                <Reveal variant="block" delay={0.18} className="concept-pole">
                  <p className="t-label concept-pole-label">{farPole.label}</p>
                  <p className="t-body">{farPole.body}</p>
                </Reveal>
              </div>
            </article>

            <article className="concept-panel" data-panel="route" data-state={panelState(2)}>
              <FloralAccents floral={content.floral} panel="route" />
              <div className="concept-route-head">
                <Reveal variant="block" className="t-label concept-eyebrow">
                  {content.route.eyebrow}
                </Reveal>
                <RevealLines
                  lines={[content.route.heading]}
                  className="t-h3 concept-heading"
                  delay={0.06}
                  fit="h3"
                />
                <div className="concept-copy">
                  <Reveal variant="block" delay={0.12}>
                    <p className="t-body">{content.route.body}</p>
                  </Reveal>
                </div>
              </div>

              <div ref={plotRef} className="concept-route" data-drawn={drawn ? "true" : undefined}>
                <div className="concept-plot">
                  <svg
                    className="concept-plot-svg"
                    viewBox={`0 0 ${PLOT_WIDTH} ${PLOT_HEIGHT}`}
                    aria-hidden="true"
                    focusable="false"
                  >
                    <defs>
                      <linearGradient
                        id="concept-water-fill"
                        gradientUnits="userSpaceOnUse"
                        x1="600"
                        y1="220"
                        x2="600"
                        y2="410"
                      >
                        <stop offset="0" stopColor="currentColor" stopOpacity="0.07" />
                        <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient
                        id="concept-water-edge"
                        gradientUnits="userSpaceOnUse"
                        x1="0"
                        y1="0"
                        x2={PLOT_WIDTH}
                        y2="0"
                      >
                        <stop offset="0" stopColor="#fff" />
                        <stop offset="0.88" stopColor="#fff" />
                        <stop offset="1" stopColor="#fff" stopOpacity="0" />
                      </linearGradient>
                      <mask id="concept-water-mask">
                        <rect
                          width={PLOT_WIDTH}
                          height={PLOT_HEIGHT}
                          fill="url(#concept-water-edge)"
                        />
                      </mask>
                    </defs>
                    <path
                      className="concept-plot-water"
                      d={SHORE_FILL}
                      fill="url(#concept-water-fill)"
                      mask="url(#concept-water-mask)"
                    />
                    <path className="concept-plot-shore" d={SHORE_PATH} />
                    <path className="concept-plot-halo" d={ROUTE_PATH} />
                    <path ref={lineRef} className="concept-plot-line" d={ROUTE_PATH} />
                    <circle
                      ref={walkerRef}
                      className="concept-plot-walker"
                      r="6"
                      cx="62"
                      cy="330"
                    />
                  </svg>
                </div>

                {/* Positioned over the plot on desktop, a legend beneath it when compact. */}
                <ol className="concept-stops">
                  {waypoints.map((waypoint, index) => (
                    <li
                      key={waypoint.id}
                      className="concept-stop"
                      data-shown={index < revealed ? "true" : undefined}
                      data-place={labelPlacement(index)}
                      data-align={labelAlign(waypoint.x, PLOT_WIDTH)}
                      data-mark={
                        index === 0 ? "start" : index === waypoints.length - 1 ? "end" : undefined
                      }
                      style={
                        {
                          left: `${toPercent(waypoint.x, PLOT_WIDTH)}%`,
                          top: `${toPercent(waypoint.y, PLOT_HEIGHT)}%`,
                          "--stop-index": `${index}`,
                        } as CSSProperties
                      }
                    >
                      <span className="concept-stop-dot" aria-hidden="true" />
                      <span className="concept-stop-text">
                        <span className="t-label concept-stop-label">{waypoint.label}</span>
                        <span className="t-caption concept-stop-detail">{waypoint.detail}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <Reveal variant="block" delay={0.16} className="t-caption concept-aside">
                {content.route.footnote}
              </Reveal>
            </article>
            <FloralAccents floral={content.floral} panel="seam" />
          </div>
        </div>
      </div>
    </Section>
  );
}
