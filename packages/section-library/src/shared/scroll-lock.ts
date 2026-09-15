/**
 * Sitewide scroll lock.
 *
 * Two things have to be held at once for a lock to actually hold: the document's
 * own overflow, and the input events that survive it — wheel, touch and the
 * page keys.
 *
 * The third participant, the virtual scroller, is *not* commanded from here.
 * It scrolls the page programmatically, which `overflow: hidden` does not stop,
 * and it is imported dynamically, so it may not exist at the moment a lock is
 * taken. Instead the lock publishes `data-scroll-locked` on the root and
 * `SmoothScroll` watches for it — the scroller answers for its own state
 * whenever it happens to come up.
 *
 * Locks nest. The loader holds one across its whole life while a menu may open
 * and close inside that window, so releasing the inner lock must not release
 * the outer one.
 */

/** Watched by `SmoothScroll`; also the hook for any CSS that needs to know. */
export const SCROLL_LOCK_ATTR = "data-scroll-locked";

const SCROLL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
  "Spacebar",
]);

let depth = 0;
let release: (() => void) | undefined;

function engage(): () => void {
  const root = document.documentElement;
  const body = document.body;
  const previousRootOverflow = root.style.overflow;
  const previousOverflow = body.style.overflow;
  const previousOverscroll = body.style.overscrollBehavior;

  /*
   * The document element is the scroller, so hiding *its* overflow is what
   * actually stops the page. `body { overflow: hidden }` alone does nothing here
   * — the propagation rule that makes it work applies to the root, not the body.
   */
  root.style.overflow = "hidden";
  body.style.overflow = "hidden";
  body.style.overscrollBehavior = "none";
  root.setAttribute(SCROLL_LOCK_ATTR, "true");

  const swallow = (event: Event) => {
    if (event.cancelable) {
      event.preventDefault();
    }
  };
  const swallowKey = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null;
    /* A locked page can still contain a focused field the visitor is typing in,
     * and a lightbox still has to hear its own arrow keys. */
    if (target?.closest("input, textarea, select, [contenteditable], [role='dialog']")) {
      return;
    }
    if (SCROLL_KEYS.has(event.key)) {
      event.preventDefault();
    }
  };

  window.addEventListener("wheel", swallow, { passive: false });
  window.addEventListener("touchmove", swallow, { passive: false });
  window.addEventListener("keydown", swallowKey);

  return () => {
    root.style.overflow = previousRootOverflow;
    body.style.overflow = previousOverflow;
    body.style.overscrollBehavior = previousOverscroll;
    root.removeAttribute(SCROLL_LOCK_ATTR);
    window.removeEventListener("wheel", swallow);
    window.removeEventListener("touchmove", swallow);
    window.removeEventListener("keydown", swallowKey);
  };
}

/**
 * Holds the page still until the returned function is called. Calling it twice
 * is a no-op, so it is safe to use as an effect teardown.
 */
export function lockScroll(): () => void {
  if (typeof document === "undefined") {
    return () => {};
  }

  depth += 1;
  if (depth === 1) {
    release = engage();
  }

  let spent = false;
  return () => {
    if (spent) {
      return;
    }
    spent = true;
    depth = Math.max(0, depth - 1);
    if (depth === 0) {
      release?.();
      release = undefined;
    }
  };
}
