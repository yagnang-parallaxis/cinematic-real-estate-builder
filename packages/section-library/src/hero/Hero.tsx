"use client";

import { Animated } from "@cinematic/animation-engine";
import { cn } from "@cinematic/ui";
import { useEffect, useId, useRef, useState, type CSSProperties, type MouseEvent } from "react";

import { HoverSlide } from "../shared/HoverSlide";
import { bootOpened, bootReleased, GATE_EVENT, OPEN_EVENT } from "../loading/logic";
import { NAV_TONE_EVENT } from "../navigation/logic";
import { Lockup } from "./Lockup";
import {
  brandLeaveProgress,
  clampHotspots,
  heroFocusPercent,
  heroIntroReady,
  heroNavTone,
  heroRunwaySvh,
  magneticOffset,
  resolveHeroMedia,
} from "./logic";
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
              if (window.matchMedia("(min-width: 992px) and (hover: hover) and (pointer: fine)").matches) {
                setOpenPin(pin.id);
              }
            }}
            onMouseLeave={() => {
              if (window.matchMedia("(min-width: 992px) and (hover: hover) and (pointer: fine)").matches) {
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

/**
 * @param variant       Day or night, when an owner above the hero shares it
 *                      with another surface — the opening curtain reveals this
 *                      same photograph, so the two cannot each hold their own.
 */
export function Hero({
  content,
  variant: sharedVariant,
  onVariantChange,
}: {
  content: HeroContent;
  variant?: HeroVariant;
  onVariantChange?: (variant: HeroVariant) => void;
}) {
  const [ownVariant, setOwnVariant] = useState<HeroVariant>("day");
  const variant = sharedVariant ?? ownVariant;
  const setVariant = onVariantChange ?? setOwnVariant;
  const [pull, setPull] = useState({ x: 0, y: 0 });
  const [intro, setIntro] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const brandCopyRef = useRef<HTMLDivElement>(null);
  const tablistId = useId();
  const headingLines = content.headingLines ?? [content.heading];
  const hotspots = clampHotspots(content.hotspots);
  const day = resolveHeroMedia(content, "day");
  const night = resolveHeroMedia(content, "night");
  const navTone = heroNavTone(variant);
  /*
   * Both breakpoints are published as custom properties and the media query
   * picks one, so the crop is authored art direction without a resize listener
   * deciding the first paint.
   */
  const framing = {
    "--hero-runway-desktop": heroRunwaySvh(content.framing, "desktop"),
    "--hero-runway-compact": heroRunwaySvh(content.framing, "compact"),
    "--hero-focus-desktop": `${heroFocusPercent(content.framing, "desktop")}%`,
    "--hero-focus-compact": `${heroFocusPercent(content.framing, "compact")}%`,
  } as CSSProperties;

  useEffect(() => {
    const node = brandCopyRef.current;
    const section = sectionRef.current;
    if (!node || !section) {
      return;
    }

    let frame = 0;

    const apply = () => {
      frame = 0;
      /*
       * Measured from the section's own top, not from the document's. Anything
       * ahead of the hero — the opening curtain's pin — otherwise counts as
       * travel the lockup has already made, and it starts the first frame gone.
       */
      const travelled = Math.max(0, -section.getBoundingClientRect().top);
      const out = brandLeaveProgress(travelled, window.innerHeight);
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

  /*
   * The tone attribute has already been committed by the time this runs, so the
   * chrome re-samples the hero it is actually sitting over.
   */
  useEffect(() => {
    window.dispatchEvent(new Event(NAV_TONE_EVENT));
  }, [navTone]);

  useEffect(() => {
    const root = document.querySelector(".home-open");

    const play = () => {
      const opening = root?.classList.contains("is-opening") ?? false;
      if (heroIntroReady(opening) || bootReleased()) {
        setIntro(true);
      }
    };

    window.addEventListener(OPEN_EVENT, play);
    window.addEventListener(GATE_EVENT, play);
    if (bootOpened()) {
      play();
    }

    if (!root) {
      return () => {
        window.removeEventListener(OPEN_EVENT, play);
        window.removeEventListener(GATE_EVENT, play);
      };
    }

    const observer = new MutationObserver(play);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => {
      window.removeEventListener(OPEN_EVENT, play);
      window.removeEventListener(GATE_EVENT, play);
      observer.disconnect();
    };
  }, []);

  const onCtaMove = (event: MouseEvent<HTMLAnchorElement>) => {
    const node = ctaRef.current;
    if (
      !node ||
      !window.matchMedia("(min-width: 992px) and (hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }

    setPull(magneticOffset(event.clientX, event.clientY, node.getBoundingClientRect()));
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      data-tone="media"
      data-nav-tone={navTone}
      data-hero-variant={variant}
    >
      <div className="hero" style={framing}>
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
          <div ref={brandCopyRef} className={cn("hero-copy hero-copy-brand", intro && "is-intro")}>
            <Lockup lines={headingLines} place={content.place} />

            <div className="hero-sentence-wrap">
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
            </div>
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
