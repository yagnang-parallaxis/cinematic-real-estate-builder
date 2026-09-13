import type { OvertureContent, StatementContent } from "@cinematic/section-library";

export const overture: OvertureContent = {
  eyebrow: "Aurelia Residences",
  lines: ["Eighteen houses", "on one quiet slope"],
  imageSrc:
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1800&q=80",
  imageAlt: "A pale stone hallway opening onto a garden through a tall arched doorway.",
  caption: "North Harbour — completion 2028",
};

export const conceptCallout: StatementContent = {
  id: "concept-callout",
  variant: "callout",
  tone: "light",
  eyebrow: "The idea",
  lines: ["Paths instead of corridors,", "and a door of your own."],
  body: "Nothing here is reached through a shared hallway. Each residence is entered from the garden, along a path that belongs to it, past planting that was on the site before the drawings were.",
  imageSrc:
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
  imageAlt: "",
  secondaryImageSrc:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  secondaryImageAlt: "",
};

export const residenceFigures: StatementContent = {
  id: "residence-figures",
  variant: "figures",
  tone: "light-deep",
  eyebrow: "The range",
  lines: ["Residences from 97", "to 198 square metres."],
  body: "Two, three and four bedrooms, each with its own outdoor room — a garden at the lower level, a terrace in the middle, a solarium at the top.",
  figures: [
    { value: "18", label: "Residences" },
    { value: "97–198", label: "Square metres" },
    { value: "2–4", label: "Bedrooms" },
    { value: "2028", label: "Completion" },
  ],
};

export const closingView: StatementContent = {
  id: "closing-view",
  variant: "panorama",
  tone: "media",
  eyebrow: "The outlook",
  lines: ["Water in every", "principal room."],
  body: "The slope does the work. Every residence sits half a level above the one in front of it, so the harbour is never somebody else's view.",
  imageSrc:
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=2400&q=80",
  imageAlt: "",
  action: { label: "Select a residence", href: "#residence-types" },
};
