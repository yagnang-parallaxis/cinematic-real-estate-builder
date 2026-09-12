import type {
  ArchitectureContent,
  GalleryContent,
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
  cta: { label: "Book a visit", href: "#visit" },
};

export const gallery: GalleryContent = {
  eyebrow: "Gallery",
  heading: "Rooms and the light they keep.",
  hint: "Drag to see more",
  items: [
    {
      src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=80",
      alt: "A pale living room with a low sofa and a wide window.",
      caption: "The long room",
    },
    {
      src: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1200&q=80",
      alt: "A stone kitchen with a timber island and pendant lights.",
      caption: "Kitchen",
    },
    {
      src: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1200&q=80",
      alt: "A bedroom with linen bedding and a view of trees.",
      caption: "Bedroom",
    },
    {
      src: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
      alt: "A bathroom with a freestanding tub and stone walls.",
      caption: "Bath",
    },
    {
      src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      alt: "An evening terrace looking toward still water.",
      caption: "Terrace",
    },
  ],
};
