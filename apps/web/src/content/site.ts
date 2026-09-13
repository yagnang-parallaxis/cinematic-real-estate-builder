import type {
  ArchitectureContent,
  FooterContent,
  HeroContent,
  LoadingContent,
  NavigationContent,
  ResidenceTypesContent,
  StoryContent,
} from "@cinematic/section-library";

export const navigation: NavigationContent = {
  brand: "Aurelia",
  homeHref: "/",
  primary: { label: "Select a residence", href: "/residences", lines: ["Select a", "residence"] },
  links: [],
  cta: { label: "Book a call", href: "#visit" },
  contact: { label: "Contact", href: "#visit" },
  overlayAccent: "The",
  overlayTitle: "Menu",
  scrollLabel: "Scroll",
  showProgress: true,
};

/**
 * The same chrome on the residence pages, with every in-page anchor pointed
 * back at the homepage so "Contact" and "Book a call" still land somewhere.
 */
export const subpageNavigation: NavigationContent = {
  ...navigation,
  contact: { label: "Contact", href: "/#visit" },
  cta: { label: "Book a call", href: "/#visit" },
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
  cta: { label: "Select a residence", href: "/residences" },
  imageSrc:
    "https://cdn.prod.website-files.com/6a068da7ad91b057365bf967/6a25da81dce540a251389928_era-residence_gated-community_day.webp",
  imageAlt: "Sunlit gated courtyard with a turquoise pool, stone residences and open sky.",
  nightImageSrc:
    "https://cdn.prod.website-files.com/6a068da7ad91b057365bf967/6a25da81dce540a251389928_era-residence_gated-community_day.webp",
  nightImageAlt: "The courtyard after the light softens across the pool and stone.",
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

export const residenceTypes: ResidenceTypesContent = {
  eyebrow: "Residences",
  types: [
    {
      id: "garden",
      name: "Garden residence",
      bedrooms: "3",
      areaRange: "128 – 148 m²",
      description:
        "A private basement level and direct access to the shared garden, for a household that wants its own entrance.",
      imageSrc:
        "https://images.unsplash.com/photo-1600585153490-76fb20a32601?auto=format&fit=crop&w=1800&q=80",
      cta: { label: "Explore garden residences", href: "/residences?type=garden" },
    },
    {
      id: "harbor",
      name: "Harbor residence",
      bedrooms: "2",
      areaRange: "97 – 104 m²",
      description:
        "Step directly onto a terrace that opens toward the water, with the communal garden just beyond.",
      imageSrc:
        "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1800&q=80",
      cta: { label: "Explore harbor residences", href: "/residences?type=harbor" },
    },
    {
      id: "penthouse",
      name: "Penthouse residence",
      bedrooms: "3 – 4",
      areaRange: "164 – 198 m²",
      description:
        "The top level of the building, under a high ceiling, with a rooftop solarium reached by its own stair.",
      imageSrc:
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=80",
      cta: { label: "Explore penthouse residences", href: "/residences?type=penthouse" },
    },
  ],
};

export const footer: FooterContent = {
  ctaEyebrow: "Visit",
  ctaHeadingLines: ["Come see", "the water"],
  ctaSubheading: "A short conversation is enough to know if it fits.",
  ctaBackgroundSrc:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=80",
  ctaAction: { label: "Book a call", href: "#visit" },
  phone: "+1 (555) 010-0142",
  phoneHref: "tel:+15550100142",
  officeLabel: "Sales office",
  officeAddress: "12 Harbor Path, North Coast",
  officeMapHref: "https://maps.google.com/?q=Harbor+Path",
  brand: "Aurelia Residences",
  legalLinks: [
    { label: "Privacy policy", href: "#" },
    { label: "Terms of use", href: "#" },
  ],
  credit: { label: "Studio North", href: "#" },
};

export const subpageFooter: FooterContent = {
  ...footer,
  topHref: "#content",
};
