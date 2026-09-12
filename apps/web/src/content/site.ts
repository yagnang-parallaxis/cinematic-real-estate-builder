import type { HeroContent, LoadingContent, NavigationContent } from "@cinematic/section-library";

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

export const loading: LoadingContent = {
  brand: "Aurelia",
  tagline: "Eighteen residences above a quiet harbor.",
  progressStyle: "bar",
  maxDurationMs: 1400,
};

export const hero: HeroContent = {
  heading: "Quiet rooms above the water.",
  place: "Harbor Line, North Coast",
  supporting:
    "Eighteen residences on a narrow inlet. Stone, timber, and long rooms that keep the last of the afternoon.",
  cta: { label: "Book a visit", href: "#visit" },
  imageSrc:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=80",
  imageAlt: "A timber and stone house facing a still inlet at dusk.",
  scrollLabel: "Begin the walk",
};
