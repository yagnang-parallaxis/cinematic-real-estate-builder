"use client";

import { useEffect } from "react";

/**
 * Sitewide virtual scrolling. The damped scroll is what lets the pinned and
 * scrub-driven sections read as deliberate rather than twitchy; it is disabled
 * outright under reduced-motion so those users keep native scrolling.
 */
export function SmoothScroll() {
  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (calm.matches) {
      return;
    }

    let cancelled = false;
    let dispose: (() => void) | undefined;

    void (async () => {
      const { default: Lenis } = await import("lenis");
      if (cancelled) {
        return;
      }

      const lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
        smoothWheel: true,
        // Touch scrolling stays native; virtualising it fights the platform.
        syncTouch: false,
      });

      let frame = requestAnimationFrame(function raf(time: number) {
        lenis.raf(time);
        frame = requestAnimationFrame(raf);
      });

      const onAnchor = (event: globalThis.MouseEvent) => {
        const anchor = (event.target as HTMLElement | null)?.closest?.<HTMLAnchorElement>(
          'a[href^="#"]',
        );
        const hash = anchor?.getAttribute("href");
        if (!anchor || !hash || hash === "#") {
          return;
        }
        const target = document.querySelector(hash);
        if (!target) {
          return;
        }
        event.preventDefault();
        lenis.scrollTo(target as HTMLElement, { offset: 0 });
      };

      document.addEventListener("click", onAnchor);
      document.documentElement.setAttribute("data-smooth-scroll", "true");

      dispose = () => {
        cancelAnimationFrame(frame);
        document.removeEventListener("click", onAnchor);
        document.documentElement.removeAttribute("data-smooth-scroll");
        lenis.destroy();
      };
    })();

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return null;
}
