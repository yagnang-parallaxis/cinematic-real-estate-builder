import type {
  HeroContent,
  LoadingContent,
  NavigationContent,
  StoryContent,
} from "@cinematic/section-library";

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

export const story: StoryContent = {
  eyebrow: "The plot",
  heading: "A house that keeps the weather in the rooms.",
  imageSrc:
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
  imageAlt: "A double-height living room with timber, stone, and a tall window.",
  beats: [
    {
      title: "The inlet first",
      body: "The plan turns every primary room toward the water, so the day is read in reflections rather than in a corridor of doors.",
    },
    {
      title: "Eighteen residences, one tide",
      body: "Each home shares the same material language and a different slice of light. Nothing is stacked that cannot still feel like a house.",
    },
    {
      title: "Quiet at the street",
      body: "From the road, Aurelia is a dark timber wall and a single opening. The garden and the water are kept for the people who live here.",
    },
  ],
};
