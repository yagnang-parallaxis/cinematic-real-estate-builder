import type { LocationContent } from "@cinematic/section-library";

export const location: LocationContent = {
  eyebrow: "Location",
  placeLines: ["Norhavn,", "on the Aldemark coast"],
  regionLabel: "Nordkvist county, 61° north",
  description:
    "A working harbour of two thousand people. Aurelia stands on the last ridge before the water, eight minutes above the quay.",
  imageSrc:
    "https://images.unsplash.com/photo-1552083375-1447ce886485?auto=format&fit=crop&w=1800&q=80",
  imageAlt:
    "The inlet at Norhavn seen from the ridge above, with moored boats along the far shore.",
  points: [
    { id: "quay", label: "The quay", travelTime: "8 min on foot" },
    { id: "ferry", label: "Ferry terminal", travelTime: "4 min" },
    { id: "market", label: "Fish market", travelTime: "7 min" },
    { id: "old-town", label: "Old town", travelTime: "12 min" },
    { id: "airport", label: "Aldemark airport", travelTime: "50 min" },
  ],
  cta: { label: "See available residences", href: "#residence-types" },
};
