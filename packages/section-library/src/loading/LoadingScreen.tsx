"use client";

import { cn } from "@cinematic/ui";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { lockScroll } from "../shared/scroll-lock";
import {
  BOOT_ATTR,
  BOOT_PROGRESS_VAR,
  bootProgress,
  clampHoldMs,
  GATE_EVENT,
  markBootSeen,
  OPEN_EVENT,
  shouldSkipBoot,
  shouldUncover,
  type BootPhase,
  type BootSignal,
} from "./logic";
import type { LoadingContent } from "./types";

/**
 * How long the plate takes to fade off the page.
 *
 * Short, because there is nothing behind it to be uncovered *by* — the opening
 * gate is the same ink, already painted as a fixed overlay. What the fade
 * reveals is the brand composition arriving on a plate that never moved, which
 * is why this is a fade and not a lift: a lift would slide one ink field off
 * an identical one.
 */
const EXIT_MS = 520;

/** Polled rather than event-driven, because the rule has to move every frame. */
const TICK_MS = 60;

/**
 * The plate that covers first paint.
 *
 * It carries no brand of its own. The wordmark belongs to the opening gate,
 * which plays once as a preloader and then is gone. This plate has exactly two
 * jobs: hold the page still and at the top until the document is genuinely
 * ready, and report how much of it has arrived. Scroll stays locked through
 * the gate that follows; releasing it here would let the visitor scrub a
 * sequence that is supposed to play itself.
 */
export function LoadingScreen({
  content,
  forceVisible = false,
}: {
  content: LoadingContent;
  forceVisible?: boolean;
}) {
  const [leaving, setLeaving] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [held, setHeld] = useState(true);
  const [progress, setProgress] = useState(0);
  const ready = useRef<Set<BootSignal>>(new Set());

  const holdMs = clampHoldMs(content.maxDurationMs);
  /*
   * Snapshotted once. `markBootSeen` runs when this visit's gate completes, and
   * `shouldSkipBoot` would then return true — which must not abort the sequence
   * that is still playing.
   */
  const skip = useRef(shouldSkipBoot(forceVisible));

  /*
   * Held until the gate has left, not merely until this plate has. A wheel
   * during the arch would otherwise travel the hero behind a sequence that is
   * supposed to play itself, and a restored scroll offset would drop the
   * visitor mid-page before the overlay had gone.
   *
   * `forceVisible` is a capture mode: the plate is pinned up deliberately, so
   * locking the page for good would make the rest of it unreachable.
   */
  useEffect(() => {
    if (forceVisible || skip.current) {
      setHeld(false);
      return;
    }

    const done = () => {
      markBootSeen();
      setHeld(false);
    };
    window.addEventListener(GATE_EVENT, done);
    return () => window.removeEventListener(GATE_EVENT, done);
  }, [forceVisible]);

  useEffect(() => {
    if (forceVisible || skip.current || (!mounted && !held)) {
      return;
    }

    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const unlock = lockScroll();
    return () => {
      history.scrollRestoration = previousRestoration;
      unlock();
    };
  }, [forceVisible, mounted, held]);

  /*
   * The phase is published on the root rather than passed down, because the
   * gate is a sibling overlay mounted independently of this plate, and the CSS
   * needs it too.
   *
   * A session that has already seen the boot must never publish `veil` or
   * `gate`: a skip has to leave the page open so it is usable on the first
   * frame rather than waiting for an uncover that will not come.
   */
  useEffect(() => {
    const root = document.documentElement;
    if (skip.current) {
      root.setAttribute(BOOT_ATTR, "open" satisfies BootPhase);
      setMounted(false);
      setHeld(false);
      history.scrollRestoration = "manual";
      const reset = () => window.scrollTo(0, 0);
      reset();
      window.addEventListener("pageshow", reset, { once: true });
      return;
    }

    if (!mounted && !held) {
      root.setAttribute(BOOT_ATTR, "open" satisfies BootPhase);
      return;
    }

    const phase: BootPhase = mounted ? "veil" : "gate";
    root.setAttribute(BOOT_ATTR, phase);
  }, [forceVisible, mounted, held]);

  useEffect(() => {
    document.documentElement.style.setProperty(BOOT_PROGRESS_VAR, progress.toFixed(4));
  }, [progress]);

  useEffect(() => {
    if (skip.current) {
      return;
    }

    if (forceVisible) {
      setLeaving(false);
      setMounted(true);
      setProgress(0);
      return;
    }

    const start = performance.now();
    const seen = ready.current;
    const mark = (signal: BootSignal) => seen.add(signal);

    void document.fonts?.ready.then(() => mark("fonts"));

    /*
     * "Media" is the first photograph behind the plate, not every image on the
     * page — waiting for the whole document's imagery would spend the grace
     * window on sections nobody has reached yet.
     */
    const media = document.querySelector<HTMLImageElement>("#hero img, .hero-image");
    if (!media) {
      mark("media");
    } else if (media.complete) {
      mark("media");
    } else {
      media.addEventListener("load", () => mark("media"), { once: true });
      media.addEventListener("error", () => mark("media"), { once: true });
    }

    if (document.readyState === "complete") {
      mark("load");
    } else {
      window.addEventListener("load", () => mark("load"), { once: true });
    }

    let unmount = 0;

    const tick = window.setInterval(() => {
      const elapsedMs = performance.now() - start;
      setProgress(bootProgress({ elapsedMs, floorMs: holdMs, ready: seen }));

      if (!shouldUncover({ elapsedMs, floorMs: holdMs, ready: seen })) {
        return;
      }

      window.clearInterval(tick);
      setProgress(1);
      setLeaving(true);
      /*
       * Announced as the fade starts, not after it: the gate's own entry
       * plays into the fade so the two overlap instead of playing in turn.
       */
      window.dispatchEvent(new Event(OPEN_EVENT));
      unmount = window.setTimeout(() => {
        setMounted(false);
        /*
         * No gate in the page (loading switched off, or already skipped) must
         * not leave the lock held for good.
         */
        if (!document.querySelector(".curtain-stage")) {
          markBootSeen();
          setHeld(false);
        }
      }, EXIT_MS);
    }, TICK_MS);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(unmount);
    };
  }, [forceVisible, holdMs]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn("boot-plate", leaving && "is-leaving")}
      style={{ "--boot-exit": `${EXIT_MS}ms` } as CSSProperties}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {content.progressStyle === "bar" ? (
        <div className="boot-progress" aria-hidden="true">
          {/* The track draws itself downward; the fill inside reports readiness. */}
          <div className="boot-progress-track">
            <span className="boot-progress-fill" />
          </div>
        </div>
      ) : null}

      <span className="sr-only">Loading {content.brand}</span>
    </div>
  );
}
