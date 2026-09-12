import { describe, expect, it } from "vitest";

import type { NavigationContent } from "./types";

const sample: NavigationContent = {
  brand: "Aurelia",
  homeHref: "/",
  links: [
    { label: "Residences", href: "#residences" },
    { label: "Architecture", href: "#architecture" },
    { label: "Location", href: "#location" },
  ],
  cta: { label: "Book a visit", href: "#visit" },
};

describe("navigation content", () => {
  it("keeps the primary link set within the builder bound", () => {
    expect(sample.links.length).toBeGreaterThanOrEqual(2);
    expect(sample.links.length).toBeLessThanOrEqual(5);
  });
});
