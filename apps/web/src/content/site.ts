import type {
  ArchitectureContent,
  HeroContent,
  LoadingContent,
  NavigationContent,
  StoryContent,
} from "@cinematic/section-library";

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

export const story: StoryContent = {
  leftCaption: "North",
  rightCaption: "Coast",
  tagline: "A house to live in — and come back to.",
  heading: "Three reasons to return",
  headingLines: ["Three reasons", "to return"],
  caption: "Designed as a street of houses, not a stack of flats.",
  beats: [
    {
      title: "The inlet first",
      body: "The plan turns every primary room toward the water, so the day is read in reflections rather than in a corridor of doors.",
      imageSrc:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=80",
      imageAlt: "A double-height living room with timber, stone, and a tall window.",
    },
    {
      title: "A street of houses",
      body: "Each home shares the same material language and a different slice of light. Nothing is stacked that cannot still feel like a house.",
      imageSrc:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80",
      imageAlt: "A timber and stone house facing a still inlet.",
    },
    {
      title: "Quiet at the street",
      body: "From the road, Aurelia is a dark timber wall and a single opening. The garden and the water are kept for the people who live here.",
      imageSrc:
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1800&q=80",
      imageAlt: "A timber doorway opening into a pale hall.",
    },
  ],
};

export const architecture: ArchitectureContent = {
  eyebrow: "Architecture",
  heading: "Stone that remembers the tide.",
  quote:
    "We kept the rooms long and the openings few, so the house would feel like it had always been looking at the water.",
  attribution: "Lena Voss",
  credit: "Studio North",
  materials:
    "Dark timber, limewashed stone, and bronze that will dull in the salt air. Nothing that asks to stay new.",
  imageSrc:
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2400&q=80",
  cta: { label: "Book a call", href: "#visit" },
};
