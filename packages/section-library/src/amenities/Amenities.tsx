"use client";

import { Animated } from "@cinematic/animation-engine";
import { cn } from "@cinematic/ui";
import { useEffect, useId, useState } from "react";

import { clampHotspots } from "../hero/logic";
import { clampScenes } from "./logic";
import type { AmenitiesContent, AmenityScene } from "./types";

interface SceneIntro {
  eyebrow: string;
  headingLines: string[];
}

function Scene({ scene, intro }: { scene: AmenityScene; intro?: SceneIntro }) {
  const [openPin, setOpenPin] = useState<string | null>(null);
  const tablistId = useId();
  const hotspots = clampHotspots(scene.hotspots);

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
    <section id={`amenity-${scene.id}`} data-nav-tone="on-dark" className="amenity-scene">
      <div className="amenity-media" aria-hidden="true">
        <Animated
          type="imageZoom"
          config={{ trigger: "on-scroll-enter", duration: 8, intensity: 1.06 }}
          className="amenity-image-zoom"
        >
          <img src={scene.imageSrc} alt="" className="amenity-image" />
        </Animated>
        <div className="amenity-grade amenity-grade-top" />
        <div className="amenity-grade amenity-grade-bot" />
      </div>

      <ul className="amenity-pins">
        {hotspots.map((pin) => {
          const open = openPin === pin.id;
          return (
            <li key={pin.id} className="amenity-pin" style={{ top: `${pin.y}%`, left: `${pin.x}%` }}>
              <button
                type="button"
                className={cn("amenity-pin-btn", open && "is-open")}
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
                <span className="amenity-pin-dot" />
                <span className="amenity-pin-pulse" />
                <span className="amenity-pin-pulse is-late" />
                <span className="sr-only">{pin.label}</span>
              </button>
              {open ? (
                <div id={`${tablistId}-${pin.id}`} className="amenity-pin-card" role="tooltip">
                  <p className="t-h5">{pin.label}</p>
                  <p className="t-body">{pin.description}</p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {intro ? (
        <div className="amenity-intro">
          <Animated type="textReveal" className="t-label amenity-eyebrow">
            {intro.eyebrow}
          </Animated>
          <Animated type="textReveal" as="h2" config={{ duration: 1, delay: 0.06 }} className="t-h1 amenity-heading">
            {intro.headingLines.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </Animated>
        </div>
      ) : null}

      <div className="amenity-caption-wrap">
        <Animated type="textReveal" config={{ duration: 0.8 }} className="t-label amenity-caption">
          {scene.caption}
        </Animated>
      </div>
    </section>
  );
}

export function Amenities({ content }: { content: AmenitiesContent }) {
  const scenes = clampScenes(content.scenes);
  const headingLines = content.headingLines ?? [content.heading];

  if (scenes.length === 0) {
    return null;
  }

  return (
    <>
      {scenes.map((scene, index) => (
        <Scene
          key={scene.id}
          scene={scene}
          intro={index === 0 ? { eyebrow: content.eyebrow, headingLines } : undefined}
        />
      ))}
    </>
  );
}
