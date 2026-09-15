"use client";

import {
  navigationPath,
  routeAnnouncement,
  shouldInterceptNavigation,
  shouldPlayPageTransition,
  transitionMs,
  type PageTransitionContent,
} from "@cinematic/section-library";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "covering" | "revealing";

/**
 * The route handoff: a brief overlay that covers the outgoing page, then lifts
 * off the incoming one, so navigating between the homepage, the listing and a
 * residence never reads as a hard cut.
 *
 * It is mounted once at the application shell rather than per page, and it sits
 * *below* the loading screen in the stack. That is deliberate: arriving at the
 * homepage, the loader is already the cover, so the two never compete — the
 * overlay has lifted by the time the loader finishes.
 *
 * It never plays on the first load, and it always ends in the `idle` phase, so
 * it cannot swallow a click if a navigation is cancelled.
 */
export function PageTransition({ content = {} }: { content?: PageTransitionContent }) {
  const router = useRouter();
  const pathname = usePathname();

  const [phase, setPhase] = useState<Phase>("idle");
  const [announcement, setAnnouncement] = useState("");
  const firstPath = useRef(pathname);
  const pending = useRef<string | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.<HTMLAnchorElement>("a[href]");
      if (!anchor) {
        return;
      }

      const intent = {
        href: anchor.getAttribute("href"),
        currentUrl: window.location.href,
        target: anchor.getAttribute("target"),
        download: anchor.hasAttribute("download"),
        metaKey: event.metaKey,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        button: event.button,
        defaultPrevented: event.defaultPrevented,
      };

      if (!shouldInterceptNavigation(intent)) {
        return;
      }

      const bootPhase = document.documentElement.getAttribute("data-boot");
      if (!shouldPlayPageTransition(bootPhase)) {
        const path = navigationPath(intent.href, intent.currentUrl);
        if (path) {
          event.preventDefault();
          router.push(path);
        }
        return;
      }

      const path = navigationPath(intent.href, intent.currentUrl);
      if (!path) {
        return;
      }

      event.preventDefault();
      pending.current = path;

      const duration = transitionMs({
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        compact: !window.matchMedia("(min-width: 992px)").matches,
      });

      setPhase("covering");
      window.setTimeout(() => {
        if (pending.current) {
          router.push(pending.current);
        }
      }, duration);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  /* The incoming page has mounted: lift the overlay and say where we are. */
  useEffect(() => {
    if (pathname === firstPath.current) {
      return;
    }
    firstPath.current = pathname;
    pending.current = null;

    setPhase("revealing");
    setAnnouncement(routeAnnouncement(content.announcement, document.title));

    const duration = transitionMs({
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      compact: !window.matchMedia("(min-width: 992px)").matches,
    });
    const timer = window.setTimeout(() => setPhase("idle"), duration);
    return () => window.clearTimeout(timer);
  }, [content.announcement, pathname]);

  return (
    <>
      <div
        className="page-transition"
        data-phase={phase}
        data-style={content.style ?? "overlay-wipe"}
        aria-hidden="true"
      />
      <p role="status" aria-live="polite" className="page-transition-status sr-only">
        {announcement}
      </p>
    </>
  );
}
