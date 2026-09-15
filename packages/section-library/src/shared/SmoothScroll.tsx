"use client";

import { useEffect } from "react";

import { SCROLL_LOCK_ATTR } from "./scroll-lock";

/**
 * Sitewide virtual scrolling. The damped scroll is what lets the pinned and
 * scrub-driven sections read as deliberate rather than twitchy; it is disabled
 * outright under reduced-motion so those users keep native scrolling.
 *
 * It also answers for scroll locks itself. A lock hides the document's overflow,
 * which stops user input but not this scroller — it moves the page by script, so
 * it would keep travelling underneath a covered page. Watching the root
 * attribute rather than being told directly means the state is correct however
 * the two happen to be ordered: this module is imported dynamically, so a lock
 * may well be taken before it exists.
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
      (window as Window & { cinematicLenis?: typeof lenis }).cinematicLenis = lenis;

      let frame = requestAnimationFrame(function raf(time: number) {
        lenis.raf(time);
        frame = requestAnimationFrame(raf);
      });

      const root = document.documentElement;
      const syncLock = () => {
        if (root.hasAttribute(SCROLL_LOCK_ATTR)) {
          lenis.stop();
        } else {
          lenis.start();
        }
      };

      /* A lock may already be held by the time this module finishes loading. */
      syncLock();
      const lockWatch = new MutationObserver(syncLock);
      lockWatch.observe(root, { attributeFilter: [SCROLL_LOCK_ATTR] });

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
        lockWatch.disconnect();
        document.removeEventListener("click", onAnchor);
        document.documentElement.removeAttribute("data-smooth-scroll");
        delete (window as Window & { cinematicLenis?: typeof lenis }).cinematicLenis;
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
