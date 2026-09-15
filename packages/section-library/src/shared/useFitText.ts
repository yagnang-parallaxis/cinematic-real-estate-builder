"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { fitScale, quantiseScale } from "./fit-text";

/** Longest a fitted heading may stay hidden waiting for the display face. */
const FIT_READY_MS = 2000;

/** Lines are measured with a Range, so the element must not wrap while measured. */
function naturalWidth(node: Element): number {
  const range = document.createRange();
  range.selectNodeContents(node);
  const width = range.getBoundingClientRect().width;
  range.detach();
  return width;
}

/**
 * Measures the widest line inside a display heading and reports the scale that
 * brings it inside its own container.
 *
 * The returned scale is meant to be written onto a custom property the token
 * font size multiplies by, so the server still renders the full tier and the
 * client only ever reduces it. `lineSelector` picks the elements that each
 * occupy one line; they must be laid out `white-space: nowrap`.
 */
export function useFitText<T extends HTMLElement>(
  lineSelector: string,
  /** Re-measure when the copy changes; fonts and resize are handled here. */
  signature: string,
): [React.RefObject<T | null>, number, boolean] {
  const ref = useRef<T>(null);
  const [scale, setScale] = useState(1);
  const [ready, setReady] = useState(false);

  const measure = useCallback(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const available = node.getBoundingClientRect().width;
    const lines = node.querySelectorAll(lineSelector);
    let widest = 0;
    for (const line of lines) {
      widest = Math.max(widest, naturalWidth(line));
    }

    /*
     * Lines are measured at the current scale, so the natural width has to be
     * divided back out before the next scale is derived from it — otherwise
     * each pass compounds the last one.
     */
    setScale((previous) => {
      const natural = previous > 0 ? widest / previous : widest;
      return quantiseScale(fitScale(natural, available));
    });
  }, [lineSelector]);

  useEffect(() => {
    measure();
  }, [measure, signature]);

  useLayoutEffect(() => {
    const node = ref.current;
    const observer =
      node && typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(node as Element);
    window.addEventListener("resize", measure);

    /*
     * Hold the heading invisible until the face has landed and one measure has
     * run. The fallback serif and the Didone do not share metrics, and because
     * the size is fitted the swap is a layout jump rather than a glyph change.
     * A ceiling keeps a stalled font from leaving the heading blank.
     */
    let cancelled = false;
    const finish = () => {
      if (cancelled) {
        return;
      }
      measure();
      setReady(true);
    };

    if (!document.fonts || document.fonts.status === "loaded") {
      finish();
    } else {
      const timer = window.setTimeout(finish, FIT_READY_MS);
      document.fonts.ready
        .then(() => {
          window.clearTimeout(timer);
          finish();
        })
        .catch(() => {
          window.clearTimeout(timer);
          finish();
        });
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return [ref, scale, ready];
}
