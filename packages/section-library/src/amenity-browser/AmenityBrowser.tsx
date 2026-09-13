"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";

import { CircleCta } from "../shared/CircleCta";
import { Parallax } from "../shared/Parallax";
import { Reveal, RevealLines } from "../shared/Reveal";
import { Section } from "../shared/Section";
import {
  activeIndexFromProgress,
  arrowStep,
  formatIndexLabel,
  indicatorFrame,
  panelDomId,
  pinProgress,
  rovingIndex,
  scrollYForIndex,
  tabDomId,
} from "./logic";
import type { AmenityBrowserContent } from "./types";

export type { AmenityBrowserContent, AmenityPanel } from "./types";

const BASE_ID = "amenity-browser";
const DESKTOP = "(min-width: 992px)";
const CALM = "(prefers-reduced-motion: reduce)";

/**
 * A small named set of amenities browsed one at a time. On desktop the screen
 * is pinned and scroll selects the panel; below the breakpoint, and under
 * reduced-motion, the pin is dropped and the same tabs run in normal flow.
 */
export function AmenityBrowser({ content }: { content: AmenityBrowserContent }) {
  const panels = content.panels;
  const count = panels.length;

  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  const areaRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const orientation = pinned ? "vertical" : "horizontal";

  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP);
    const calm = window.matchMedia(CALM);
    const sync = () => setPinned(desktop.matches && !calm.matches);

    sync();
    desktop.addEventListener("change", sync);
    calm.addEventListener("change", sync);
    return () => {
      desktop.removeEventListener("change", sync);
      calm.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const area = areaRef.current;
    if (!pinned || !area) {
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = area.getBoundingClientRect();
      const progress = pinProgress({
        areaTop: rect.top + window.scrollY,
        areaHeight: rect.height,
        viewportHeight: window.innerHeight,
        scrollY: window.scrollY,
      });
      setActive(activeIndexFromProgress(progress, count));
    };

    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pinned, count]);

  useEffect(() => {
    const rail = railRef.current;
    const tab = tabsRef.current[active];
    if (!rail || !tab) {
      return;
    }

    const measure = () => {
      const frame = indicatorFrame(tab.getBoundingClientRect(), rail.getBoundingClientRect(), {
        x: rail.scrollLeft,
        y: rail.scrollTop,
      });
      rail.style.setProperty("--amenity-browser-ind-x", `${frame.x}px`);
      rail.style.setProperty("--amenity-browser-ind-y", `${frame.y}px`);
      rail.style.setProperty("--amenity-browser-ind-w", `${frame.width}px`);
      rail.style.setProperty("--amenity-browser-ind-h", `${frame.height}px`);
    };

    measure();
    rail.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(rail);
    observer?.observe(tab);

    return () => {
      observer?.disconnect();
      rail.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [active, pinned, count]);

  const select = useCallback(
    (index: number) => {
      setActive(index);

      const area = areaRef.current;
      if (!pinned || !area) {
        tabsRef.current[index]?.scrollIntoView({ block: "nearest", inline: "center" });
        return;
      }

      const rect = area.getBoundingClientRect();
      window.scrollTo({
        top: scrollYForIndex(index, count, {
          areaTop: rect.top + window.scrollY,
          areaHeight: rect.height,
          viewportHeight: window.innerHeight,
        }),
        behavior: "smooth",
      });
    },
    [count, pinned],
  );

  const onRailKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = arrowStep(event.key, orientation);
    let next = -1;

    if (step !== 0) {
      next = rovingIndex(active, step, count);
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = count - 1;
    }

    if (next < 0) {
      return;
    }

    event.preventDefault();
    select(next);
    tabsRef.current[next]?.focus({ preventScroll: true });
  };

  if (count === 0) {
    return null;
  }

  return (
    <Section id="amenities" tone="media" label={content.label} className="amenity-browser">
      <div
        ref={areaRef}
        className="amenity-browser-area"
        style={{ "--amenity-browser-count": String(count) } as CSSProperties}
      >
        <div className="amenity-browser-screen">
          <div className="amenity-browser-stage">
            {panels.map((panel, index) => (
              <div
                key={panel.id}
                className="amenity-browser-plate"
                data-active={index === active ? "true" : undefined}
                aria-hidden={index === active ? undefined : "true"}
              >
                <Parallax role="image">
                  <img
                    src={panel.imageSrc}
                    alt={panel.imageAlt}
                    loading={index === 0 ? undefined : "lazy"}
                    decoding="async"
                  />
                </Parallax>
              </div>
            ))}
            <div className="section-scrim section-scrim-top" aria-hidden="true" />
            <div className="section-scrim section-scrim-bottom" aria-hidden="true" />
          </div>

          <div className="amenity-browser-intro on-media-text">
            <p className="t-label amenity-browser-eyebrow">{content.eyebrow}</p>
            <RevealLines
              lines={content.headingLines}
              className="t-h2 amenity-browser-heading"
              stagger={0.07}
            />
          </div>

          <div
            ref={railRef}
            role="tablist"
            aria-label={content.tablistLabel}
            aria-orientation={orientation}
            className="amenity-browser-rail on-media-text"
            onKeyDown={onRailKeyDown}
          >
            <span className="amenity-browser-indicator" aria-hidden="true" />
            {panels.map((panel, index) => (
              <button
                key={panel.id}
                ref={(node) => {
                  tabsRef.current[index] = node;
                }}
                type="button"
                role="tab"
                id={tabDomId(BASE_ID, panel.id)}
                aria-controls={panelDomId(BASE_ID, panel.id)}
                aria-selected={index === active}
                tabIndex={index === active ? 0 : -1}
                className="amenity-browser-tab t-label"
                onClick={() => select(index)}
              >
                <span className="amenity-browser-tab-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="amenity-browser-tab-name">{panel.name}</span>
              </button>
            ))}
          </div>

          <p className="drag-hint t-label amenity-browser-hint" aria-hidden="true">
            <span className="amenity-browser-hint-rule" />
            {content.hint}
          </p>

          <div className="amenity-browser-panels on-media-text">
            {panels.map((panel, index) => (
              <div
                key={panel.id}
                role="tabpanel"
                id={panelDomId(BASE_ID, panel.id)}
                aria-labelledby={tabDomId(BASE_ID, panel.id)}
                className="amenity-browser-panel"
                hidden={index !== active}
                tabIndex={0}
              >
                <p className="t-label amenity-browser-count">{formatIndexLabel(index, count)}</p>
                {/* Remounting on every change replays the reveal instead of cutting. */}
                <RevealLines
                  key={`title-${active}`}
                  as="h3"
                  lines={[panel.title]}
                  className="t-h3 amenity-browser-title"
                />
                <Reveal key={`desc-${active}`} variant="block" delay={0.12}>
                  <p className="t-lead amenity-browser-desc">{panel.description}</p>
                </Reveal>
              </div>
            ))}
          </div>

          <div className="amenity-browser-cta">
            <CircleCta label={content.cta.label} href={content.cta.href} size="md" />
          </div>
        </div>
      </div>
    </Section>
  );
}
