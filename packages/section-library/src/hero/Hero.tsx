"use client";

import { Animated } from "@cinematic/animation-engine";
import { cn } from "@cinematic/ui";
import { useEffect, useId, useRef, useState, type MouseEvent } from "react";

import { HoverSlide } from "../navigation/HoverSlide";
import { clampHotspots, magneticOffset, resolveHeroMedia } from "./logic";
import type { HeroContent, HeroVariant } from "./types";

export function Hero({ content }: { content: HeroContent }) {
  const [variant, setVariant] = useState<HeroVariant>("day");
  const [openPin, setOpenPin] = useState<string | null>(null);
  const [pull, setPull] = useState({ x: 0, y: 0 });
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const tablistId = useId();
  const headingLines = content.headingLines ?? [content.heading];
  const hotspots = clampHotspots(content.hotspots);
  const day = resolveHeroMedia(content, "day");
  const night = resolveHeroMedia(content, "night");

  useEffect(() => {
    if (!openPin) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenPin(null);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openPin]);

  const onCtaMove = (event: MouseEvent<HTMLAnchorElement>) => {
    const node = ctaRef.current;
    if (!node || window.matchMedia("(max-width: 991px)").matches) {
      return;
    }

    setPull(magneticOffset(event.clientX, event.clientY, node.getBoundingClientRect()));
  };

  return (
    <section id="hero" data-nav-tone="on-dark" className="hero" data-hero-variant={variant}>
      <div className="hero-media" aria-hidden="true">
        <Animated
          type="imageZoom"
          config={{ trigger: "on-load", duration: 9, intensity: 1.08 }}
          className="hero-image-zoom"
        >
          <img
            src={day.src}
            alt=""
            className={cn("hero-image", variant === "day" && "is-active")}
          />
        </Animated>
        {content.nightImageSrc ? (
          <Animated
            type="imageZoom"
            config={{ trigger: "on-load", duration: 9, delay: 0.15, intensity: 1.08 }}
            className="hero-image-zoom"
          >
            <img
              src={night.src}
              alt=""
              className={cn("hero-image", variant === "night" && "is-active")}
            />
          </Animated>
        ) : null}
        <div className="hero-grade hero-grade-top" />
        <div className="hero-grade hero-grade-bot" />
      </div>

      <ul className="hero-pins">
        {hotspots.map((pin) => {
          const open = openPin === pin.id;
          return (
            <li key={pin.id} className="hero-pin" style={{ top: `${pin.y}%`, left: `${pin.x}%` }}>
              <button
                type="button"
                className={cn("hero-pin-btn", open && "is-open")}
                aria-expanded={open}
                aria-controls={`${tablistId}-${pin.id}`}
                onClick={() => setOpenPin(open ? null : pin.id)}
                onMouseEnter={() => {
                  if (window.matchMedia("(min-width: 992px)").matches) {
                    setOpenPin(pin.id);
                  }
                }}
                onMouseLeave={() => {
                  if (window.matchMedia("(min-width: 992px)").matches) {
                    setOpenPin(null);
                  }
                }}
              >
                <span className="hero-pin-dot" />
                <span className="hero-pin-pulse" />
                <span className="hero-pin-pulse is-late" />
                <span className="sr-only">{pin.label}</span>
              </button>
              {open ? (
                <div id={`${tablistId}-${pin.id}`} className="hero-pin-card" role="tooltip">
                  <p className="t-h5">{pin.label}</p>
                  <p className="t-body">{pin.description}</p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="hero-copy">
        <div className="hero-lockup">
          <Animated type="textReveal" config={{ duration: 1.1, trigger: "on-load" }} as="h1" className="t-h1 hero-title">
            {headingLines.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </Animated>
          <Animated type="textReveal" config={{ duration: 0.9, delay: 0.08, trigger: "on-load" }}>
            <p className="hero-place">{content.place}</p>
          </Animated>
        </div>

        <Animated type="fadeUp" config={{ duration: 0.8, delay: 0.16, trigger: "on-load" }}>
          <div className="hero-sentence t-h5">
            <span>{content.supportingBefore}</span>
            <div className="hero-tabs" role="tablist" aria-label="Light">
              <button
                type="button"
                role="tab"
                aria-selected={variant === "day"}
                className={cn("hero-tab t-label", variant === "day" && "is-active")}
                onClick={() => setVariant("day")}
              >
                <HoverSlide align="center">{content.dayLabel}</HoverSlide>
              </button>
              <span className={cn("hero-tab-rule", variant === "night" && "is-night")} />
              <button
                type="button"
                role="tab"
                aria-selected={variant === "night"}
                className={cn("hero-tab t-label", variant === "night" && "is-active")}
                onClick={() => setVariant("night")}
              >
                <HoverSlide align="center">{content.nightLabel}</HoverSlide>
              </button>
            </div>
            <span>{content.supportingAfter}</span>
          </div>
        </Animated>
      </div>

      <Animated type="fadeUp" config={{ duration: 0.7, delay: 0.24, trigger: "on-load" }} className="hero-cta-wrap">
        <a
          ref={ctaRef}
          href={content.cta.href}
          className="hero-cta"
          onMouseMove={onCtaMove}
          onMouseLeave={() => setPull({ x: 0, y: 0 })}
        >
          <span className="hero-cta-ring" aria-hidden="true" />
          <span className="hero-cta-label t-label" style={{ transform: `translate(${pull.x}px, ${pull.y}px)` }}>
            <HoverSlide align="center">{content.cta.label}</HoverSlide>
          </span>
        </a>
      </Animated>
    </section>
  );
}
