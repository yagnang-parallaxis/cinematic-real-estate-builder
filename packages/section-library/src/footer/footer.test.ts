import { describe, expect, it } from "vitest";

import { currentYear, joinLegalLinks } from "./logic";
import type { FooterContent } from "./types";

const sample: FooterContent = {
  ctaEyebrow: "Visit",
  ctaHeadingLines: ["Come see", "the water"],
  ctaSubheading: "A short walk from the harbor path.",
  ctaBackgroundSrc: "https://images.example.com/cta.jpg",
  ctaAction: { label: "Book a call", href: "#visit" },
  phone: "+1 (555) 010-0100",
  phoneHref: "tel:+15550100100",
  officeLabel: "Sales Office",
  officeAddress: "12 Harbor Path, North Coast",
  officeMapHref: "https://maps.example.com/aurelia",
  brand: "Aurelia Residences",
  legalLinks: [
    { label: "Privacy policy", href: "https://example.com/privacy.pdf" },
    { label: "Terms of use", href: "https://example.com/terms.pdf" },
  ],
  credit: { label: "Studio North", href: "https://example.com" },
};

describe("footer content", () => {
  it("requires a CTA, a phone, an office address, and a brand", () => {
    expect(sample.ctaAction.href.length).toBeGreaterThan(0);
    expect(sample.phone.length).toBeGreaterThan(0);
    expect(sample.officeAddress.length).toBeGreaterThan(0);
    expect(sample.brand.length).toBeGreaterThan(0);
  });
});

describe("currentYear", () => {
  it("reads the year from the given date", () => {
    expect(currentYear(new Date("2031-06-01"))).toBe(2031);
  });
});

describe("joinLegalLinks", () => {
  it("joins link labels with a comma and space", () => {
    expect(joinLegalLinks(sample.legalLinks)).toBe("Privacy policy, Terms of use");
  });

  it("returns an empty string for no links", () => {
    expect(joinLegalLinks([])).toBe("");
  });
});
