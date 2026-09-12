import type {
  ArchitectureContent,
  GalleryContent,
  HeroContent,
  HorizontalGalleryContent,
  ResidencesContent,
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

export const walk: HorizontalGalleryContent = {
  eyebrow: "A walk",
  heading: "From the street to the water.",
  hint: "Drag to see more",
  items: [
    {
      src: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1800&q=80",
      alt: "A timber doorway opening into a pale hall.",
      caption: "The street door",
    },
    {
      src: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1800&q=80",
      alt: "A dining table under a long window.",
      caption: "The dining room",
    },
    {
      src: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=80",
      alt: "A stair in dark timber with a high window.",
      caption: "The stair",
    },
    {
      src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80",
      alt: "The house facing the inlet at dusk.",
      caption: "The water",
    },
  ],
};

export const residences: ResidencesContent = {
  eyebrow: "Residences",
  heading: "Eighteen homes, three plans.",
  empty: "No residences match this type.",
  residences: [
    {
      id: "a3",
      name: "A3",
      type: "Harbor",
      bedrooms: 2,
      area: "128 m² interior",
      outdoor: "18 m² terrace",
      status: "Available",
      imageSrc:
        "https://images.unsplash.com/photo-1600585153490-76fb20a32601?auto=format&fit=crop&w=1400&q=80",
      imageAlt: "A two-bedroom harbor residence with a long window.",
    },
    {
      id: "b2",
      name: "B2",
      type: "Garden",
      bedrooms: 3,
      area: "164 m² interior",
      outdoor: "42 m² garden",
      status: "Reserved",
      imageSrc:
        "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1400&q=80",
      imageAlt: "A three-bedroom garden residence opening to planting.",
    },
    {
      id: "c1",
      name: "C1",
      type: "Penthouse",
      bedrooms: 3,
      area: "198 m² interior",
      outdoor: "36 m² terrace",
      status: "Available",
      imageSrc:
        "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1400&q=80",
      imageAlt: "A penthouse living room under a high ceiling.",
    },
  ],
};
