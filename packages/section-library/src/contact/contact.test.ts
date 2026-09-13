import { describe, expect, it } from "vitest";

import {
  CHANNEL_KINDS,
  clampPin,
  isExternalChannel,
  MAX_CHANNELS,
  MAX_SOCIALS,
  normalizeChannels,
  normalizeSocials,
  PIN_INSET,
  SOCIAL_NETWORKS,
} from "./logic";
import type { ContactChannel, ContactPin, ContactSocial } from "./types";

function channel(id: string, overrides: Partial<ContactChannel> = {}): ContactChannel {
  return {
    id,
    label: "Write us",
    value: "hello@aurelia.example",
    href: "mailto:hello@aurelia.example",
    kind: "email",
    ...overrides,
  };
}

function social(id: string, overrides: Partial<ContactSocial> = {}): ContactSocial {
  return {
    id,
    label: "Instagram",
    href: "https://example.com/aurelia",
    network: "instagram",
    ...overrides,
  };
}

const pin: ContactPin = { label: "Sales office", hours: "Open daily, 09:00–18:00", x: 62, y: 48 };

describe("normalizeChannels", () => {
  it("keeps a short list in its authored order", () => {
    const channels = [
      channel("write"),
      channel("office", { kind: "maps", href: "https://maps.example/office" }),
      channel("talk", { kind: "tel", href: "tel:+15550100142" }),
    ];
    expect(normalizeChannels(channels).map((entry) => entry.id)).toEqual([
      "write",
      "office",
      "talk",
    ]);
  });

  it("trims labels, values, and hrefs", () => {
    const [entry] = normalizeChannels([
      channel("write", {
        label: "  Write us ",
        value: " hello@aurelia.example ",
        href: " mailto:hello@aurelia.example ",
      }),
    ]);
    expect(entry).toEqual({
      id: "write",
      label: "Write us",
      value: "hello@aurelia.example",
      href: "mailto:hello@aurelia.example",
      kind: "email",
    });
  });

  it("drops entries with no label or no href left after trimming", () => {
    const kept = normalizeChannels([
      channel("write"),
      channel("blank", { label: "   " }),
      channel("dead", { href: "  " }),
    ]);
    expect(kept.map((entry) => entry.id)).toEqual(["write"]);
  });

  it("caps the row so it still reads as a row", () => {
    const many = Array.from({ length: 10 }, (_, index) => channel(`ch-${index}`));
    expect(normalizeChannels(many)).toHaveLength(MAX_CHANNELS);
  });

  it("falls an unknown kind back to link", () => {
    const [entry] = normalizeChannels([
      channel("other", { kind: "fax" as ContactChannel["kind"], href: "https://example.com" }),
    ]);
    expect(entry?.kind).toBe("link");
  });

  it("leaves the input array untouched", () => {
    const input = [channel("write", { label: "  Write us " })];
    normalizeChannels(input);
    expect(input[0]?.label).toBe("  Write us ");
  });
});

describe("normalizeSocials", () => {
  it("trims labels and hrefs and keeps the authored order", () => {
    const kept = normalizeSocials([
      social("in", { label: " LinkedIn ", href: " https://example.com/in ", network: "linkedin" }),
      social("ig"),
    ]);
    expect(kept.map((entry) => entry.id)).toEqual(["in", "ig"]);
    expect(kept[0]).toMatchObject({ label: "LinkedIn", href: "https://example.com/in" });
  });

  it("drops empty hrefs and unknown networks", () => {
    const kept = normalizeSocials([
      social("ig"),
      social("dead", { href: " " }),
      social("odd", { network: "tiktok" as ContactSocial["network"] }),
    ]);
    expect(kept.map((entry) => entry.id)).toEqual(["ig"]);
  });

  it("caps the icon row", () => {
    const many = Array.from({ length: 8 }, (_, index) => social(`s-${index}`));
    expect(normalizeSocials(many)).toHaveLength(MAX_SOCIALS);
  });
});

describe("clampPin", () => {
  it("keeps a pin that already sits inside the inset", () => {
    expect(clampPin(pin)).toEqual(pin);
  });

  it("pulls a pin off the edge so the card still has room", () => {
    expect(clampPin({ ...pin, x: -4, y: 140 })).toEqual({
      ...pin,
      x: PIN_INSET,
      y: 100 - PIN_INSET,
    });
  });

  it("trims the written label and hours", () => {
    expect(clampPin({ ...pin, label: "  Office ", hours: "  09:00–18:00 " })).toEqual({
      ...pin,
      label: "Office",
      hours: "09:00–18:00",
    });
  });

  it("treats a non-finite coordinate as the centre", () => {
    expect(clampPin({ ...pin, x: Number.NaN, y: Number.POSITIVE_INFINITY })).toEqual({
      ...pin,
      x: 50,
      y: 50,
    });
  });
});

describe("isExternalChannel", () => {
  it("treats maps, messaging, and generic links as leaving the page", () => {
    expect(isExternalChannel("maps")).toBe(true);
    expect(isExternalChannel("whatsapp")).toBe(true);
    expect(isExternalChannel("link")).toBe(true);
  });

  it("keeps mail and telephone on the same tab", () => {
    expect(isExternalChannel("email")).toBe(false);
    expect(isExternalChannel("tel")).toBe(false);
  });
});

describe("catalogues", () => {
  it("exposes the closed channel and network sets", () => {
    expect(CHANNEL_KINDS).toEqual(["email", "maps", "tel", "whatsapp", "link"]);
    expect(SOCIAL_NETWORKS).toEqual(["linkedin", "facebook", "instagram"]);
  });
});
