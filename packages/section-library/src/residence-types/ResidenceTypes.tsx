"use client";

import { Animated } from "@cinematic/animation-engine";
import { useRef, useState } from "react";

import { HoverSlide } from "../shared/HoverSlide";
import {
  clampTypes,
  formatSlideLabel,
  nextIndex,
  prevIndex,
  slideProgress,
  swipeStep,
} from "./logic";
import type { ResidenceTypesContent } from "./types";

export type { ResidenceType, ResidenceTypesContent } from "./types";

export function ResidenceTypes({ content }: { content: ResidenceTypesContent }) {
  const types = clampTypes(content.types);
  const [index, setIndex] = useState(0);
  const type = types[index];

  if (!type) {
    return null;
  }

  const goTo = (next: number) => setIndex(next);
  const dragX = useRef<number | null>(null);

  return (
    <section id="residence-types" data-tone="light" data-nav-tone="on-light" className="residence-types">
      <div
        className="residence-types-browser"
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("button, a")) {
            return;
          }
          dragX.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (dragX.current == null) {
            return;
          }
          const step = swipeStep(event.clientX - dragX.current);
          dragX.current = null;
          if (step === 1) goTo(nextIndex(index, types.length));
          if (step === -1) goTo(prevIndex(index, types.length));
        }}
        onPointerCancel={() => {
          dragX.current = null;
        }}
      >
        <Animated
          type="textReveal"
          config={{ duration: 0.8, trigger: "on-load" }}
          className="t-label residence-types-eyebrow"
        >
          {content.eyebrow}
        </Animated>

        <article className="residence-types-slide">
          <div className="residence-types-data">
            <div className="residence-types-data-item">
              <p className="t-label residence-types-data-label">Bedrooms</p>
              <p className="t-h5">{type.bedrooms}</p>
            </div>
            <div className="residence-types-data-item">
              <p className="t-label residence-types-data-label">Area up to</p>
              <p className="t-h5">{type.areaRange}</p>
            </div>
          </div>

          <Animated
            key={type.id}
            type="textReveal"
            as="h3"
            config={{ duration: 0.9, trigger: "on-load" }}
            className="t-h2 residence-types-name"
          >
            {type.name}
          </Animated>

          <Animated
            key={`${type.id}-media`}
            type="imageReveal"
            config={{ duration: 0.8, trigger: "on-load" }}
            className="residence-types-media"
          >
            <img src={type.imageSrc} alt="" className="residence-types-image" />
          </Animated>

          <div className="residence-types-copy">
            <Animated key={`${type.id}-desc`} type="fadeUp" config={{ duration: 0.6, trigger: "on-load" }}>
              <p className="t-body residence-types-desc">{type.description}</p>
            </Animated>
            <a href={type.cta.href} className="residence-types-cta">
              <HoverSlide>{type.cta.label}</HoverSlide>
            </a>
          </div>
        </article>

        <div className="residence-types-pag">
          <button
            type="button"
            className="residence-types-pag-btn"
            aria-label="Previous residence type"
            onClick={() => goTo(prevIndex(index, types.length))}
          >
            <HoverSlide align="center">
              <span className="t-label">{formatSlideLabel(index)}</span>
            </HoverSlide>
          </button>
          <div className="residence-types-pag-track" aria-hidden="true">
            <span
              className="residence-types-pag-fill"
              style={{ width: `${slideProgress(index, types.length)}%` }}
            />
          </div>
          <button
            type="button"
            className="residence-types-pag-btn"
            aria-label="Next residence type"
            onClick={() => goTo(nextIndex(index, types.length))}
          >
            <HoverSlide align="center">
              <span className="t-label">{formatSlideLabel(nextIndex(index, types.length))}</span>
            </HoverSlide>
          </button>
        </div>
      </div>
    </section>
  );
}
