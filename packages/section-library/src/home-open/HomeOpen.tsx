"use client";

import { useEffect } from "react";

import { ArchReveal } from "../arch/ArchReveal";
import type { ArchRevealContent } from "../arch/types";
import { Hero } from "../hero/Hero";
import type { HeroContent } from "../hero/types";

/**
 * Opening chapter: scroll the tall photograph, then hold the finale frame
 * (image + CTA) while a short lead zooms the plate and the oval arch rises
 * over it — elements stay put; the dome overlaps them. No second image.
 */
export function HomeOpen({
  hero,
  arch,
}: {
  hero: HeroContent;
  arch: ArchRevealContent;
}) {
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
        media.style.setProperty("--hero-zoom", "1");
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
      media.style.setProperty("--hero-zoom", zoom.toFixed(4));
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
      media.style.removeProperty("--hero-zoom");
    };
  }, [arch.id]);

  return (
    <div className="home-open">
      <Hero content={hero} />
      {/*
       * Scroll room after the CTA so the held frame can zoom and settle before
       * the arch section begins — the “pause” is distance, not a timer.
       */}
      <div className="home-open-lead" aria-hidden="true" />
      <ArchReveal content={arch} omitBackdrop riseAfter={0.1} />
    </div>
  );
}
