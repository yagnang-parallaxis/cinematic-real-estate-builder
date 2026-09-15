"use client";

import { useEffect, useState } from "react";

import { ArchReveal } from "../arch/ArchReveal";
import type { ArchRevealContent } from "../arch/types";
import { Hero } from "../hero/Hero";
import type { HeroContent } from "../hero/types";
import { bootReleased, GATE_EVENT } from "../loading/logic";
import type { LoadingContent } from "../loading/types";
import { Curtain } from "./Curtain";

/**
 * Opening chapter, in one continuous gesture over one photograph.
 *
 * On a first visit the once-only gate plays as a preloader overlay: a brand
 * plate with an arch that opens onto this photograph, then is gone. After that
 * — and on every later load in the session — the visitor is on the hero, then
 * the photograph scrolls its own runway, then the finale frame is held while a
 * short lead zooms the plate and the oval dome rises over it. One photograph
 * throughout — no second image and no handoff between copies of it.
 */
export function HomeOpen({
  hero,
  arch,
  curtain,
}: {
  hero: HeroContent;
  arch: ArchRevealContent;
  /** The branded gate. Omitted when the loading section is switched off. */
  curtain?: LoadingContent;
}) {
  const [opening, setOpening] = useState(Boolean(curtain));

  useEffect(() => {
    if (!curtain) {
      setOpening(false);
      return;
    }

    const done = () => setOpening(false);
    window.addEventListener(GATE_EVENT, done);
    if (bootReleased()) {
      done();
    }
    return () => window.removeEventListener(GATE_EVENT, done);
  }, [curtain]);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".home-open");
    const heroNode = document.getElementById("hero");
    const archNode = document.getElementById(arch.id);
    const media = heroNode?.querySelector<HTMLElement>(".hero-media");
    const lead = root?.querySelector<HTMLElement>(".home-open-lead");
    if (!root || !heroNode || !archNode || !media) {
      return;
    }

    let frame = 0;

    const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

    const update = () => {
      frame = 0;
      const viewH = window.innerHeight;
      const heroRect = heroNode.getBoundingClientRect();
      const archRect = archNode.getBoundingClientRect();

      const pastHero = heroRect.bottom <= viewH + 0.5;
      const beforeArchLeaves = archRect.bottom > 0;
      const held = pastHero && beforeArchLeaves;
      const covered = archNode.getAttribute("data-arch-covered") === "true";

      root.classList.toggle("is-held", held);
      root.classList.toggle("is-arch-covered", held && covered);
      media.classList.toggle("is-held", held);

      if (!held) {
        root.style.setProperty("--hero-zoom", "1");
        return;
      }

      /*
       * Lead: gentle settle. Arch scrub: a clear push in as the panel rises —
       * scroll back reverses the same curve.
       */
      const holdStart = heroNode.offsetTop + heroNode.offsetHeight - viewH;
      const leadH = lead?.offsetHeight ?? Math.round(viewH * 0.85);
      const leadEnd = holdStart + leadH;
      const holdEnd = archNode.offsetTop + archNode.offsetHeight - viewH;
      const y = window.scrollY;

      const leadZoom = 0.05;
      const archZoom = 0.26;

      let zoom = 1;
      if (y <= leadEnd) {
        const throughLead = clamp01((y - holdStart) / Math.max(1, leadH));
        const eased = throughLead * throughLead;
        zoom = 1 + eased * leadZoom;
      } else {
        const throughArch = clamp01((y - leadEnd) / Math.max(1, holdEnd - leadEnd));
        const eased = throughArch * throughArch * (3 - 2 * throughArch);
        zoom = 1 + leadZoom + eased * archZoom;
      }
      root.style.setProperty("--hero-zoom", zoom.toFixed(4));
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
      root.classList.remove("is-held");
      root.classList.remove("is-arch-covered");
      media.classList.remove("is-held");
      root.style.removeProperty("--hero-zoom");
    };
  }, [arch.id]);

  return (
    <div className={opening ? "home-open is-opening" : "home-open"}>
      {curtain ? <Curtain content={curtain} hero={hero} /> : null}
      {/*
       * The hero keeps its own lockup whatever precedes it. The gate is the
       * brand's entrance and the hero's is the composition it arrives at — the
       * same lettering doing two different jobs, in sequence. Taking the hero's
       * away left the first screen a photograph with a caption on it.
       */}
      <Hero content={hero} />
      {/*
       * Scroll room after the CTA so the held frame can zoom and settle before
       * the arch section begins — the “pause” is distance, not a timer.
       */}
      <div className="home-open-lead" aria-hidden="true" />
      {/*
       * No `riseAfter`: the dome now starts from nothing, so a delay ahead of it
       * is scroll in which nothing happens at all. The lead above is the beat.
       */}
      <ArchReveal content={arch} omitBackdrop />
    </div>
  );
}
