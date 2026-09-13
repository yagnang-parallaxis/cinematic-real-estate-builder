import type { CSSProperties } from "react";

import { CircleCta } from "../shared/CircleCta";
import { Parallax } from "../shared/Parallax";
import { Reveal, RevealLines } from "../shared/Reveal";
import { Section } from "../shared/Section";
import { cloudLanes, CLOUD_SHAPES_PER_LANE, normalizePoints } from "./logic";
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
  const points = normalizePoints(content.points);
  const lanes = cloudLanes();

  return (
    <Section id="location" tone="color" clip label={content.eyebrow} className="location">
      <div className="location-frame">
        <Parallax role="image">
          <img src={content.imageSrc} alt={content.imageAlt} />
        </Parallax>

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
                {/* Two identical lists: the track loops by translating exactly one list. */}
                <CloudShapes />
                <CloudShapes />
              </div>
            </div>
          ))}
        </div>

        <div className="section-scrim location-scrim" aria-hidden="true" />
      </div>

      <div className="section-shell location-shell">
        <div className="location-copy">
          <div className="location-copy-head">
            <Reveal variant="block" className="t-label location-eyebrow">
              {content.eyebrow}
            </Reveal>
            <RevealLines lines={content.placeLines} className="t-h2 location-place" delay={0.08} />
          </div>

          <div className="location-copy-aside">
            {/* The rule is the revealed element itself, so it carries no content. */}
            <Reveal variant="line" className="location-rule" delay={0.16}>
              {null}
            </Reveal>
            <Reveal variant="block" delay={0.22} className="location-support">
              <p className="t-lead">{content.description}</p>
              <p className="t-caption location-region">{content.regionLabel}</p>
            </Reveal>
          </div>
        </div>

        <Reveal as="ol" variant="block" stagger={0.06} className="location-waypoints">
          {points.map((point) => (
            <li key={point.id} className="location-waypoint">
              <span className="t-label location-waypoint-label">{point.label}</span>
              <span className="t-caption location-waypoint-time">{point.travelTime}</span>
            </li>
          ))}
        </Reveal>

        <div className="location-action">
          <CircleCta label={content.cta.label} href={content.cta.href} size="md" />
        </div>
      </div>

      <div className="location-edge" aria-hidden="true" />
    </Section>
  );
}
