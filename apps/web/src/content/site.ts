import type { HeroContent, LoadingContent, NavigationContent } from "@cinematic/section-library";

export const navigation: NavigationContent = {
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

export const loading: LoadingContent = {
  brand: "Aurelia",
  wordmark: ["Aurelia", "Residences"],
  place: "Harbor",
  leftCaption: "North",
  rightCaption: "Coast",
  tagline: "Eighteen residences\nabove a quiet harbor.",
  progressStyle: "bar",
  maxDurationMs: 2000,
};

export const hero: HeroContent = {
  heading: "Aurelia Residences",
  headingLines: ["Aurelia", "Residences"],
  place: "Harbor",
  supportingBefore: "A house",
  supportingAfter: "above the water",
  dayLabel: "by day",
  nightLabel: "by night",
  cta: { label: "Select a residence", href: "#residences" },
  imageSrc:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=80",
  imageAlt: "A timber and stone house facing a still inlet in afternoon light.",
  nightImageSrc:
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=2400&q=80",
  nightImageAlt: "A house seen after dark, interior lights on toward the garden.",
  hotspots: [
    {
      id: "stone",
      label: "Stone that lasts",
      description:
        "Limewashed stone and dark timber, chosen to weather the salt rather than stay new.",
      x: 57.5,
      y: 62.5,
    },
    {
      id: "light",
      label: "Light through the rooms",
      description: "Every primary room turns toward the inlet, so the day is read in reflections.",
      x: 26.9,
      y: 58.3,
    },
    {
      id: "street",
      label: "The quiet street wall",
      description:
        "From the road, only a timber wall and a single opening. The water is kept for the people who live here.",
      x: 76.6,
      y: 73.2,
    },
  ],
};
