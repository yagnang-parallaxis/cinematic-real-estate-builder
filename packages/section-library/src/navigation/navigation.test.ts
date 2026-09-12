import { describe, expect, it } from "vitest";

import {
  formatSectionIndex,
  overlayLinks,
  resolveNavTone,
  resolveSectionIndex,
  scrollProgress,
} from "./logic";
import type { NavigationContent } from "./types";

const sample: NavigationContent = {
  brand: "Aurelia",
  homeHref: "/",
  primary: { label: "Select a residence", href: "#residences", lines: ["Select a", "residence"] },
  links: [],
  cta: { label: "Book a call", href: "#visit" },
  contact: { label: "Contact", href: "#visit" },
  overlayAccent: "The",
  overlayTitle: "Menu",
  scrollLabel: "Scroll",
  showProgress: true,
};

describe("navigation content", () => {
  it("keeps the chrome to a primary link plus two actions", () => {
    expect(sample.primary).toBeDefined();
    expect(sample.cta?.label).toBeTruthy();
    expect(sample.contact?.label).toBeTruthy();
    expect(sample.links.length).toBeLessThanOrEqual(5);
  });
});

describe("scrollProgress", () => {
  it("returns 0 when the page cannot scroll", () => {
    expect(scrollProgress(80, 0)).toBe(0);
  });

  it("clamps the ratio between 0 and 1", () => {
    expect(scrollProgress(-20, 800)).toBe(0);
    expect(scrollProgress(400, 800)).toBe(0.5);
    expect(scrollProgress(1200, 800)).toBe(1);
  });
});

describe("overlayLinks", () => {
  it("starts with Home and then the same actions as the desktop chrome", () => {
    expect(overlayLinks(sample).map((link) => link.label)).toEqual([
      "Home",
      "Select a residence",
      "Book a call",
      "Contact",
    ]);
  });

  it("does not repeat a link that already appears as Home", () => {
    const homePrimary: NavigationContent = {
      ...sample,
      primary: { label: "Home", href: "/" },
    };

    expect(overlayLinks(homePrimary).map((link) => `${link.label}:${link.href}`)).toEqual([
      "Home:/",
      "Book a call:#visit",
      "Contact:#visit",
    ]);
  });
});

describe("resolveNavTone", () => {
  const sections = [
    { top: 0, bottom: 900, tone: "on-dark" as const },
    { top: 900, bottom: 1800, tone: "on-light" as const },
    { top: 1800, bottom: 2700, tone: "on-color" as const },
  ];

  it("uses the section under the header probe", () => {
    expect(resolveNavTone(sections, 80)).toBe("on-dark");
    expect(resolveNavTone(sections, 1100)).toBe("on-light");
    expect(resolveNavTone(sections, 1900)).toBe("on-color");
  });

  it("falls back to on-dark when no section is under the probe", () => {
    expect(resolveNavTone([], 80)).toBe("on-dark");
  });
});

describe("resolveSectionIndex", () => {
  const sections = [
    { top: 0, bottom: 900 },
    { top: 900, bottom: 1800 },
    { top: 1800, bottom: 2700 },
  ];

  it("counts sections one-based, matching the reference's scene counter", () => {
    expect(resolveSectionIndex(sections, 80)).toBe(1);
    expect(resolveSectionIndex(sections, 1100)).toBe(2);
    expect(resolveSectionIndex(sections, 1900)).toBe(3);
  });

  it("falls back to the first scene when no section is under the probe", () => {
    expect(resolveSectionIndex([], 80)).toBe(1);
  });
});

describe("formatSectionIndex", () => {
  it("pads a one-based scene index to two digits", () => {
    expect(formatSectionIndex(1)).toBe("01");
    expect(formatSectionIndex(7)).toBe("07");
    expect(formatSectionIndex(12)).toBe("12");
  });

  it("never renders below scene 01", () => {
    expect(formatSectionIndex(0)).toBe("01");
    expect(formatSectionIndex(-3)).toBe("01");
  });
});
