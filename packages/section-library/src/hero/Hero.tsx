"use client";

import { Animated } from "@cinematic/animation-engine";
import { cn } from "@cinematic/ui";
import { useEffect, useId, useRef, useState, type MouseEvent } from "react";

import { HoverSlide } from "../shared/HoverSlide";
import { brandLeaveProgress, clampHotspots, magneticOffset, resolveHeroMedia } from "./logic";
import type { HeroContent, HeroHotspot, HeroVariant } from "./types";

/**
 * Tall scrollable photograph with three stations along its height.
 *
 * The media fills the whole runway and scrolls with the page — sky in the
 * first viewport, the house mid-frame with the navigators, lawn and CTA at
 * the foot — so the image itself travels, not a static plate under moving type.
 */
function HeroPins({ hotspots, tablistId }: { hotspots: HeroHotspot[]; tablistId: string }) {
  const [openPin, setOpenPin] = useState<string | null>(null);

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

  return (
    <ul className="hero-pins">
      {hotspots.map((pin) => {
        const open = openPin === pin.id;
        return (
          <li
            key={pin.id}
            className="hero-pin"
            style={{ top: `${pin.y}%`, left: `${pin.x}%` }}
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
            <button
              type="button"
              className={cn("hero-pin-btn", open && "is-open")}
              aria-expanded={open}
              aria-controls={`${tablistId}-${pin.id}`}
              onClick={() => setOpenPin(open ? null : pin.id)}
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
  );
}

export function Hero({ content }: { content: HeroContent }) {
  const [variant, setVariant] = useState<HeroVariant>("day");
  const [pull, setPull] = useState({ x: 0, y: 0 });
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const brandCopyRef = useRef<HTMLDivElement>(null);
  const tablistId = useId();
  const headingLines = content.headingLines ?? [content.heading];
  const hotspots = clampHotspots(content.hotspots);
  const day = resolveHeroMedia(content, "day");
  const night = resolveHeroMedia(content, "night");

  useEffect(() => {
    const node = brandCopyRef.current;
    if (!node) {
      return;
    }

    let frame = 0;

    const apply = () => {
      frame = 0;
      const out = brandLeaveProgress(window.scrollY, window.innerHeight);
      node.style.setProperty("--hero-brand-out", out.toFixed(4));
      node.classList.toggle("is-away", out >= 0.92);
    };

    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(apply);
      }
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      node.style.removeProperty("--hero-brand-out");
      node.classList.remove("is-away");
    };
  }, []);

  const onCtaMove = (event: MouseEvent<HTMLAnchorElement>) => {
    const node = ctaRef.current;
    if (!node || window.matchMedia("(max-width: 991px)").matches) {
      return;
    }

    setPull(magneticOffset(event.clientX, event.clientY, node.getBoundingClientRect()));
  };

  return (
    <section id="hero" data-tone="media" data-nav-tone="on-media" data-hero-variant={variant}>
      <div className="hero">
        {/*
         * The photograph is as tall as the runway. Scrolling the section is
         * scrolling the image — stations are landmarks along that travel.
         */}
        <div className="hero-media">
          <img
            src={day.src}
            alt=""
            className={cn("hero-image", variant === "day" && "is-active")}
            aria-hidden="true"
          />
          {content.nightImageSrc ? (
            <img
              src={night.src}
              alt=""
              className={cn("hero-image", variant === "night" && "is-active")}
              aria-hidden="true"
            />
          ) : null}
          <div className="hero-grade hero-grade-top" aria-hidden="true" />
          <div className="hero-grade hero-grade-bot" aria-hidden="true" />
          {/*
           * Pins live on the photograph itself, so they travel with the
           * rooftops. The arch may overlap them as it rises.
           */}
          <HeroPins hotspots={hotspots} tablistId={tablistId} />
        </div>

        <div className="hero-station hero-station-brand">
          <div ref={brandCopyRef} className="hero-copy hero-copy-brand">
            <div className="hero-lockup">
              <Animated
                type="textReveal"
                config={{ duration: 1.1, trigger: "on-load" }}
                as="h1"
                className="t-h1 hero-title"
              >
                {headingLines.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </Animated>
              <Animated
                type="textReveal"
                config={{ duration: 0.9, delay: 0.08, trigger: "on-load" }}
              >
                <p className="hero-place">{content.place}</p>
              </Animated>
            </div>

            <Animated
              type="fadeUp"
              config={{ duration: 0.8, delay: 0.16, trigger: "on-load" }}
              className="hero-sentence-wrap"
            >
              <div className="hero-sentence t-h5">
                <span className="hero-sentence-lead">{content.supportingBefore}</span>
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
                  <span className="hero-tab-rule" />
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
                <span className="hero-sentence-tail">{content.supportingAfter}</span>
              </div>
            </Animated>
          </div>
        </div>

        <div className="hero-station hero-station-mid" aria-hidden="true" />

        <div className="hero-station hero-station-cta">
          <Animated
            type="fadeUp"
            config={{ duration: 0.7, trigger: "on-scroll-enter" }}
            className="hero-cta-wrap"
          >
            <a
              ref={ctaRef}
              href={content.cta.href}
              className="hero-cta"
              onMouseMove={onCtaMove}
              onMouseLeave={() => setPull({ x: 0, y: 0 })}
            >
              <span className="hero-cta-ring-rest" aria-hidden="true" />
              <svg className="hero-cta-ring" viewBox="0 0 100 100" aria-hidden="true">
                <path
                  className="hero-cta-ring-arc"
                  pathLength="100"
                  d="M99 50 A 49 49 0 0 1 1 50"
                  strokeDasharray="100"
                  strokeDashoffset="100"
                />
                <path
                  className="hero-cta-ring-arc"
                  pathLength="100"
                  d="M1 50 A 49 49 0 0 1 99 50"
                  strokeDasharray="100"
                  strokeDashoffset="100"
                />
              </svg>
              <span
                className="hero-cta-label t-label"
                style={{ transform: `translate(${pull.x}px, ${pull.y}px)` }}
              >
                <HoverSlide align="center">{content.cta.label}</HoverSlide>
              </span>
            </a>
          </Animated>
        </div>
      </div>
    </section>
  );
}
