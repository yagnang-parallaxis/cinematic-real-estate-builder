import {
  CONTACT_CHANNEL_KINDS,
  CONTACT_SOCIAL_NETWORKS,
  type ContactChannel,
  type ContactChannelKind,
  type ContactPin,
  type ContactSocial,
  type ContactSocialNetwork,
} from "./types";

/** Five channels still read as a single desktop row. */
export const MAX_CHANNELS = 5;
export const MAX_SOCIALS = 4;
/** Keep the pin and its hours card away from the cropped edge of the map. */
export const PIN_INSET = 8;

export const CHANNEL_KINDS = CONTACT_CHANNEL_KINDS;
export const SOCIAL_NETWORKS = CONTACT_SOCIAL_NETWORKS;

const CHANNEL_KIND_SET = new Set<string>(CONTACT_CHANNEL_KINDS);
const SOCIAL_NETWORK_SET = new Set<string>(CONTACT_SOCIAL_NETWORKS);

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function asKind(kind: ContactChannelKind): ContactChannelKind {
  return CHANNEL_KIND_SET.has(kind) ? kind : "link";
}

function asNetwork(network: ContactSocialNetwork): ContactSocialNetwork | null {
  return SOCIAL_NETWORK_SET.has(network) ? network : null;
}

/**
 * Trim written fields, drop empty rows, and cap the list so a long CMS payload
 * degrades by losing trailing channels rather than crowding the row.
 */
export function normalizeChannels(
  channels: ContactChannel[],
  max = MAX_CHANNELS,
): ContactChannel[] {
  const limit = Math.max(0, Math.trunc(max));
  const kept: ContactChannel[] = [];

  for (const channel of channels) {
    const label = channel.label.trim();
    const href = channel.href.trim();
    if (!label || !href) {
      continue;
    }
    kept.push({
      ...channel,
      label,
      value: channel.value.trim(),
      href,
      kind: asKind(channel.kind),
    });
    if (kept.length === limit) {
      break;
    }
  }

  return kept;
}

export function normalizeSocials(socials: ContactSocial[], max = MAX_SOCIALS): ContactSocial[] {
  const limit = Math.max(0, Math.trunc(max));
  const kept: ContactSocial[] = [];

  for (const social of socials) {
    const label = social.label.trim();
    const href = social.href.trim();
    const network = asNetwork(social.network);
    if (!label || !href || !network) {
      continue;
    }
    kept.push({ ...social, label, href, network });
    if (kept.length === limit) {
      break;
    }
  }

  return kept;
}

export function clampPin(pin: ContactPin): ContactPin {
  const x = Number.isFinite(pin.x) ? pin.x : 50;
  const y = Number.isFinite(pin.y) ? pin.y : 50;

  return {
    label: pin.label.trim(),
    hours: pin.hours.trim(),
    x: clamp(x, PIN_INSET, 100 - PIN_INSET),
    y: clamp(y, PIN_INSET, 100 - PIN_INSET),
  };
}

/** Mail and telephone stay in-place; everything else leaves the page. */
export function isExternalChannel(kind: ContactChannelKind): boolean {
  return kind !== "email" && kind !== "tel";
}
