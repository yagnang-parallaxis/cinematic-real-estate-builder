import type { NavigationIntent } from "./types";

/**
 * Durations for the route overlay. Deliberately brief: this is a handoff, not
 * a scene change, and it must never make navigation feel slower than it is.
 */
export const TRANSITION_MS = {
  desktop: 480,
  compact: 340,
  /** Reduced motion gets a near-instant cross-fade, per the primitive's rule. */
  reduced: 120,
} as const;

export function transitionMs(options: { reducedMotion: boolean; compact: boolean }): number {
  if (options.reducedMotion) {
    return TRANSITION_MS.reduced;
  }
  return options.compact ? TRANSITION_MS.compact : TRANSITION_MS.desktop;
}

/** Resolves a link's href against the page it was clicked on. `null` if unusable. */
export function resolveHref(href: string | null | undefined, currentUrl: string): URL | null {
  if (!href || !href.trim()) {
    return null;
  }
  try {
    return new URL(href, currentUrl);
  } catch {
    return null;
  }
}

/**
 * Whether the overlay should play for this click.
 *
 * It plays only for a plain left-click on a same-origin link that actually
 * changes the path. Modified clicks, new-tab links, downloads, other schemes,
 * and in-page anchors are all left to the browser — an in-page anchor in
 * particular belongs to the smooth-scroll layer, not to this one.
 */
export function shouldInterceptNavigation(intent: NavigationIntent): boolean {
  if (intent.defaultPrevented) {
    return false;
  }
  if (intent.metaKey || intent.ctrlKey || intent.shiftKey || intent.altKey) {
    return false;
  }
  if (intent.button !== undefined && intent.button !== 0) {
    return false;
  }
  if (intent.download) {
    return false;
  }
  if (intent.target && intent.target !== "" && intent.target !== "_self") {
    return false;
  }

  const target = resolveHref(intent.href, intent.currentUrl);
  const current = resolveHref(intent.currentUrl, intent.currentUrl);
  if (!target || !current) {
    return false;
  }
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return false;
  }
  if (target.origin !== current.origin) {
    return false;
  }
  /* Same page: either a no-op or a jump to an anchor on it. */
  if (target.pathname === current.pathname && target.search === current.search) {
    return false;
  }

  return true;
}

/**
 * The homepage boot plate is the cover on a first visit. Playing the route
 * overlay at the same time is two covers; stand aside until the page is open.
 */
export function shouldPlayPageTransition(bootPhase: string | null): boolean {
  return bootPhase !== "veil" && bootPhase !== "gate";
}

/** The path (plus query and hash) to hand to the router. */
export function navigationPath(href: string | null, currentUrl: string): string | null {
  const target = resolveHref(href, currentUrl);
  return target ? `${target.pathname}${target.search}${target.hash}` : null;
}

/** Fills the announcement template with the new page's title. */
export function routeAnnouncement(template: string | undefined, title: string): string {
  const cleanTitle = title.trim();
  if (!template) {
    return cleanTitle ? `${cleanTitle} — page loaded` : "Page loaded";
  }
  return template.includes("%s") ? template.replace("%s", cleanTitle) : template;
}
