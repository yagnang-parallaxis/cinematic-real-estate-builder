"use client";

import { useEffect, useRef, type CSSProperties } from "react";

import { Reveal, RevealLines } from "../shared/Reveal";
import { Section } from "../shared/Section";
import {
  cloudLanes,
  CLOUD_SHAPES_PER_LANE,
  panProgress,
} from "./logic";
import type { LocationContent } from "./types";

const shapes = Array.from({ length: CLOUD_SHAPES_PER_LANE }, (_, index) => index);

function CloudShapes() {
  return (
    <div className="marquee-list">
      {shapes.map((shape) => (
        <span key={shape} className="location-cloud" />
      ))}
    </div>
  );
}

export function Location({ content }: { content: LocationContent }) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const lanes = cloudLanes();

  useEffect(() => {
    const stage = stageRef.current;
    const frame = frameRef.current;
    if (!stage || !frame) {
      return;
    }

    const desktop = window.matchMedia("(min-width: 992px)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let attached = false;

    const paint = () => {
      raf = 0;
      const rect = stage.getBoundingClientRect();
      const progress = panProgress({
        stageTop: rect.top + window.scrollY,
        stageHeight: stage.offsetHeight,
        viewportHeight: window.innerHeight,
        scrollY: window.scrollY,
      });
      frame.style.setProperty("--location-pan", progress.toFixed(4));
      frame.style.setProperty("--location-shift", `${(-progress * 50).toFixed(2)}%`);
    };

    const onScroll = () => {
      if (!raf) {
        raf = requestAnimationFrame(paint);
      }
    };

    const sync = () => {
      const enabled = desktop.matches && !calm.matches;
      if (enabled === attached) {
        if (enabled) {
          paint();
        }
        return;
      }

      attached = enabled;
      if (enabled) {
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        paint();
      } else {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
        frame.style.removeProperty("--location-pan");
        frame.style.removeProperty("--location-shift");
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
  }, []);

  return (
    <Section id="location" tone="light" label={content.eyebrow} className="location">
      <div ref={stageRef} className="location-stage">
        <div ref={frameRef} className="location-frame">
          <img src={content.imageSrc} alt={content.imageAlt} className="location-plate" />

          <div className="location-sky" aria-hidden="true">
            {lanes.map((lane) => (
              <div
                key={lane.index}
                className="marquee location-cloud-lane"
                style={
                  {
                    "--cloud-top": `${lane.topPercent}%`,
                    "--cloud-dur": `${lane.durationSeconds}s`,
                    "--cloud-delay": `${lane.delaySeconds}s`,
                    "--cloud-opacity": lane.opacity,
                    "--cloud-scale": lane.scale,
                  } as CSSProperties
                }
              >
                <div className="marquee-track" data-direction={lane.direction}>
                  <CloudShapes />
                  <CloudShapes />
                </div>
              </div>
            ))}
          </div>

          <div className="location-veil" aria-hidden="true" />

          <div className="location-plaque">
            <RevealLines
              lines={[content.placeLines[0] ?? ""]}
              as="h2"
              className="t-h3 location-place"
              delay={0.06}
            />
            {content.placeLines[1] ? (
              <Reveal variant="block" delay={0.12} className="t-accent location-shore">
                {content.placeLines[1]}
              </Reveal>
            ) : null}
            <Reveal variant="block" delay={0.2} className="t-label location-region">
              {content.regionLabel}
            </Reveal>
          </div>
        </div>
      </div>

      <div className="location-edge" aria-hidden="true" />
    </Section>
  );
}
