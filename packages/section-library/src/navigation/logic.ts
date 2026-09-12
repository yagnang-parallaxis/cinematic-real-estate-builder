import type { NavigationContent, NavigationLink, NavTone } from "./types";

export function scrollProgress(scrollY: number, maxScroll: number): number {
  if (maxScroll <= 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, scrollY / maxScroll));
}

function sameLink(a: NavigationLink, b: NavigationLink) {
  return a.href === b.href && a.label === b.label;
}

export function overlayLinks(content: NavigationContent): NavigationLink[] {
  const home: NavigationLink = { label: "Home", href: content.homeHref };
  const rest = [content.primary, ...content.links, content.cta, content.contact].filter(
    (link): link is NavigationLink => Boolean(link),
  );

  return [home, ...rest.filter((link) => !sameLink(link, home))];
}

export function resolveNavTone(
  sections: { top: number; bottom: number; tone: NavTone }[],
  probeY: number,
): NavTone {
  const match = [...sections]
    .reverse()
    .find((section) => probeY >= section.top && probeY < section.bottom);

  return match?.tone ?? "on-dark";
}

export function resolveSectionIndex(
  sections: { top: number; bottom: number }[],
  probeY: number,
): number {
  const index = sections.findIndex((section) => probeY >= section.top && probeY < section.bottom);
  return index === -1 ? 1 : index + 1;
}

export function formatSectionIndex(index: number): string {
  return String(Math.max(1, index)).padStart(2, "0");
}

export function readSectionTones(
  root: ParentNode = document,
): { top: number; bottom: number; tone: NavTone }[] {
  return [...root.querySelectorAll<HTMLElement>("[data-nav-tone]")].map((node) => {
    const rect = node.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      bottom: rect.bottom + window.scrollY,
      tone: (node.dataset.navTone as NavTone) || "on-dark",
    };
  });
}
