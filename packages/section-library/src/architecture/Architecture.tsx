"use client";

import { Animated } from "@cinematic/animation-engine";
import { useRef, useState, type MouseEvent } from "react";

import { magneticOffset } from "../hero/logic";
import { HoverSlide } from "../shared/HoverSlide";
import { fitScale, headingLines, shouldShowCta } from "./logic";
import type { ArchitectureContent } from "./types";

export function Architecture({ content }: { content: ArchitectureContent }) {
  const [pull, setPull] = useState({ x: 0, y: 0 });
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const lines = headingLines(content);

  const onCtaMove = (event: MouseEvent<HTMLAnchorElement>) => {
    const node = ctaRef.current;
    const isDesktop = window.matchMedia("(min-width: 992px)").matches;

    if (!node || !shouldShowCta(content.cta, isDesktop ? "desktop" : "compact")) {
      return;
    }

    setPull(magneticOffset(event.clientX, event.clientY, node.getBoundingClientRect()));
  };

  return (
    <section id="architecture" data-tone="media" data-nav-tone="on-media" className="architecture">
      <Animated type="parallax" config={{ intensity: 0.6, direction: "up" }} className="architecture-media">
        <img src={content.imageSrc} alt="" className="architecture-image" />
      </Animated>
      <div className="architecture-grade architecture-grade-top" />
      <div className="architecture-grade architecture-grade-bot" />

      <div className="architecture-copy">
        <Animated
          type="textReveal"
          config={{ duration: 0.8, trigger: "on-load" }}
          className="t-label architecture-eyebrow"
        >
          {content.eyebrow}
        </Animated>

        <Animated
          type="textReveal"
          as="h2"
          config={{ duration: 1, delay: 0.06, trigger: "on-load" }}
          className="t-display architecture-heading"
        >
          {lines.map((line) => (
            <span
              key={line}
              className="architecture-heading-line"
              style={{ fontSize: `calc(var(--text-display) * ${fitScale(line)})` }}
            >
              {line}
            </span>
          ))}
        </Animated>

        <Animated
          type="fadeUp"
          config={{ duration: 0.8, delay: 0.16, trigger: "on-load" }}
          className="architecture-quote-wrap"
        >
          <blockquote className="architecture-quote">
            <p className="t-lead">{content.quote}</p>
            <footer className="t-caption architecture-cite">
              <cite>
                {content.attribution}
                {content.credit ? ` — ${content.credit}` : null}
              </cite>
            </footer>
          </blockquote>
        </Animated>

        {content.materials ? (
          <Animated
            type="fadeUp"
            config={{ duration: 0.7, delay: 0.22, trigger: "on-load" }}
            className="architecture-materials-wrap"
          >
            <p className="t-body architecture-materials">{content.materials}</p>
          </Animated>
        ) : null}
      </div>

      {content.cta ? (
        <Animated
          type="fadeUp"
          config={{ duration: 0.7, delay: 0.28, trigger: "on-load" }}
          className="architecture-cta-wrap"
        >
          <a
            ref={ctaRef}
            href={content.cta.href}
            className="architecture-cta"
            onMouseMove={onCtaMove}
            onMouseLeave={() => setPull({ x: 0, y: 0 })}
          >
            <span className="architecture-cta-ring" aria-hidden="true" />
            <span
              className="architecture-cta-label t-label"
              style={{ transform: `translate(${pull.x}px, ${pull.y}px)` }}
            >
              <HoverSlide align="center">{content.cta.label}</HoverSlide>
            </span>
          </a>
        </Animated>
      ) : null}
    </section>
  );
}
