import type { FooterLink } from "./types";

export function currentYear(now: Date = new Date()): number {
  return now.getFullYear();
}

export function joinLegalLinks(links: FooterLink[]): string {
  return links.map((link) => link.label).join(", ");
}
