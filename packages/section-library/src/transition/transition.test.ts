import { describe, expect, it } from "vitest";

import {
  navigationPath,
  resolveHref,
  routeAnnouncement,
  shouldInterceptNavigation,
  shouldPlayPageTransition,
  TRANSITION_MS,
  transitionMs,
} from "./logic";
import type { NavigationIntent } from "./types";

const HERE = "https://aurelia.example/residences?type=garden";

function intent(overrides: Partial<NavigationIntent> = {}): NavigationIntent {
  return { href: "/residences/011", currentUrl: HERE, button: 0, ...overrides };
}

describe("transitionMs", () => {
  it("is shorter on compact screens than on desktop", () => {
    expect(transitionMs({ reducedMotion: false, compact: true })).toBe(TRANSITION_MS.compact);
    expect(transitionMs({ reducedMotion: false, compact: false })).toBe(TRANSITION_MS.desktop);
    expect(TRANSITION_MS.compact).toBeLessThan(TRANSITION_MS.desktop);
  });

  it("collapses to a near-instant cross-fade under reduced motion", () => {
    expect(transitionMs({ reducedMotion: true, compact: false })).toBe(TRANSITION_MS.reduced);
    expect(transitionMs({ reducedMotion: true, compact: true })).toBe(TRANSITION_MS.reduced);
    expect(TRANSITION_MS.reduced).toBeLessThanOrEqual(150);
  });
});

describe("resolveHref", () => {
  it("resolves a relative href against the current page", () => {
    expect(resolveHref("/residences/011", HERE)?.pathname).toBe("/residences/011");
    expect(resolveHref("011", "https://aurelia.example/residences/")?.pathname).toBe(
      "/residences/011",
    );
  });

  it("has nothing for an empty or unusable href", () => {
    expect(resolveHref("", HERE)).toBeNull();
    expect(resolveHref(null, HERE)).toBeNull();
    expect(resolveHref("   ", HERE)).toBeNull();
  });
});

describe("shouldInterceptNavigation", () => {
  it("plays for a plain click on an internal link to another page", () => {
    expect(shouldInterceptNavigation(intent())).toBe(true);
    expect(shouldInterceptNavigation(intent({ href: "/" }))).toBe(true);
  });

  it("plays when only the query changes", () => {
    expect(shouldInterceptNavigation(intent({ href: "/residences?type=harbor" }))).toBe(true);
  });

  it("leaves modified clicks and middle clicks to the browser", () => {
    expect(shouldInterceptNavigation(intent({ metaKey: true }))).toBe(false);
    expect(shouldInterceptNavigation(intent({ ctrlKey: true }))).toBe(false);
    expect(shouldInterceptNavigation(intent({ shiftKey: true }))).toBe(false);
    expect(shouldInterceptNavigation(intent({ altKey: true }))).toBe(false);
    expect(shouldInterceptNavigation(intent({ button: 1 }))).toBe(false);
  });

  it("leaves new-tab links, downloads and other schemes alone", () => {
    expect(shouldInterceptNavigation(intent({ target: "_blank" }))).toBe(false);
    expect(shouldInterceptNavigation(intent({ download: true }))).toBe(false);
    expect(shouldInterceptNavigation(intent({ href: "mailto:hello@aurelia.example" }))).toBe(false);
    expect(shouldInterceptNavigation(intent({ href: "tel:+15550100142" }))).toBe(false);
  });

  it("leaves another origin alone", () => {
    expect(shouldInterceptNavigation(intent({ href: "https://elsewhere.example/x" }))).toBe(false);
  });

  it("leaves an in-page anchor to the smooth-scroll layer", () => {
    expect(shouldInterceptNavigation(intent({ href: "#visit" }))).toBe(false);
    expect(shouldInterceptNavigation(intent({ href: "/residences?type=garden#visit" }))).toBe(
      false,
    );
  });

  it("does nothing for a link back to the page already open", () => {
    expect(shouldInterceptNavigation(intent({ href: "/residences?type=garden" }))).toBe(false);
  });

  it("stands aside once something else has handled the click", () => {
    expect(shouldInterceptNavigation(intent({ defaultPrevented: true }))).toBe(false);
  });

  it("does nothing without an href", () => {
    expect(shouldInterceptNavigation(intent({ href: null }))).toBe(false);
  });
});

describe("shouldPlayPageTransition", () => {
  it("stands aside while the homepage boot is covering", () => {
    expect(shouldPlayPageTransition("veil")).toBe(false);
    expect(shouldPlayPageTransition("gate")).toBe(false);
  });

  it("plays once the page is open, and when there is no boot at all", () => {
    expect(shouldPlayPageTransition("open")).toBe(true);
    expect(shouldPlayPageTransition(null)).toBe(true);
  });
});

describe("navigationPath", () => {
  it("keeps the path, the query and the hash", () => {
    expect(navigationPath("/residences?type=harbor#grid", HERE)).toBe(
      "/residences?type=harbor#grid",
    );
  });

  it("has nothing for an unusable href", () => {
    expect(navigationPath(null, HERE)).toBeNull();
  });
});

describe("routeAnnouncement", () => {
  it("fills the template with the new page's title", () => {
    expect(routeAnnouncement("%s — loaded", "No. 011")).toBe("No. 011 — loaded");
  });

  it("uses the template as it stands when it has no placeholder", () => {
    expect(routeAnnouncement("Page loaded", "No. 011")).toBe("Page loaded");
  });

  it("has something to say without a template", () => {
    expect(routeAnnouncement(undefined, "No. 011")).toBe("No. 011 — page loaded");
    expect(routeAnnouncement(undefined, "  ")).toBe("Page loaded");
  });
});
