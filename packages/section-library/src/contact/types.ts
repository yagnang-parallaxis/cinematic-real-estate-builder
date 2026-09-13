export const CONTACT_CHANNEL_KINDS = ["email", "maps", "tel", "whatsapp", "link"] as const;

export type ContactChannelKind = (typeof CONTACT_CHANNEL_KINDS)[number];

export const CONTACT_SOCIAL_NETWORKS = ["linkedin", "facebook", "instagram"] as const;

export type ContactSocialNetwork = (typeof CONTACT_SOCIAL_NETWORKS)[number];

export interface ContactChannel {
  id: string;
  label: string;
  value: string;
  href: string;
  kind: ContactChannelKind;
}

export interface ContactSocial {
  id: string;
  label: string;
  href: string;
  network: ContactSocialNetwork;
}

export interface ContactPin {
  label: string;
  hours: string;
  /** Horizontal position on the illustrated map, in percent. */
  x: number;
  /** Vertical position on the illustrated map, in percent. */
  y: number;
}

export interface ContactMap {
  src: string;
  alt: string;
}

export interface ContactCta {
  label: string;
  /** Recorded with the enquiry so the sales office knows which surface opened it. */
  source?: string;
}

export interface ContactContent {
  eyebrow: string;
  heading: string;
  /** Lines unmask in turn. Falls back to a single line of `heading`. */
  headingLines?: string[];
  channels: ContactChannel[];
  socials: ContactSocial[];
  map: ContactMap;
  pin: ContactPin;
  cta: ContactCta;
  dragHint: string;
}
