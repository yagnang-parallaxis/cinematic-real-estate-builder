import type { NavigationContent } from "@cinematic/section-library";

export const navigation: NavigationContent = {
  brand: "Aurelia",
  homeHref: "/",
  links: [
    { label: "Residences", href: "#residences" },
    { label: "Architecture", href: "#architecture" },
    { label: "Gallery", href: "#gallery" },
    { label: "Location", href: "#location" },
  ],
  cta: { label: "Book a visit", href: "#visit" },
  contact: { label: "Contact", href: "#visit" },
  mobileTagline: "Eighteen residences above a quiet harbor.",
  showProgress: true,
};
