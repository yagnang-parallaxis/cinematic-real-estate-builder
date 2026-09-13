import type { ContactContent } from "@cinematic/section-library";

export const contact: ContactContent = {
  eyebrow: "Visit",
  heading: "Contact us",
  headingLines: ["Contact us"],
  channels: [
    {
      id: "write",
      label: "Write us",
      value: "hello@aurelia.example",
      href: "mailto:hello@aurelia.example",
      kind: "email",
    },
    {
      id: "office",
      label: "Sales office",
      value: "12 Harbor Path, Norhavn",
      href: "https://maps.google.com/?q=Harbor+Path+Norhavn",
      kind: "maps",
    },
    {
      id: "place",
      label: "Location",
      value: "North Harbour, Aldemark coast",
      href: "https://maps.google.com/?q=Norhavn+harbour",
      kind: "maps",
    },
    {
      id: "talk",
      label: "Talk to us",
      value: "+1 (555) 010-0142",
      href: "tel:+15550100142",
      kind: "tel",
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      value: "WhatsApp",
      href: "https://wa.me/15550100142",
      kind: "whatsapp",
    },
  ],
  socials: [
    {
      id: "linkedin",
      label: "LinkedIn",
      href: "https://example.com/aurelia/linkedin",
      network: "linkedin",
    },
    {
      id: "facebook",
      label: "Facebook",
      href: "https://example.com/aurelia/facebook",
      network: "facebook",
    },
    {
      id: "instagram",
      label: "Instagram",
      href: "https://example.com/aurelia/instagram",
      network: "instagram",
    },
  ],
  map: {
    src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2400&q=80",
    alt: "A cool northern inlet seen from above, dark water against a wooded shore.",
  },
  pin: {
    label: "Sales office",
    hours: "Open daily, 09:00–18:00",
    x: 58,
    y: 42,
  },
  cta: { label: "Book a call", source: "contact" },
  dragHint: "Drag to see more",
};
