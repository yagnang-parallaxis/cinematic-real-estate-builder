import type { NavigationContent, NavigationLink, NavTone } from "./types";

export function scrollProgress(scrollY: number, maxScroll: number): number {
  if (maxScroll <= 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, scrollY / maxScroll));
}

export function formatProgressLabel(progress: number): string {
  const value = Math.min(99, Math.max(0, Math.floor(progress * 100)));
  return String(value).padStart(2, "0");
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

export function readSectionTones(root: ParentNode = document): { top: number; bottom: number; tone: NavTone }[] {
  return [...root.querySelectorAll<HTMLElement>("[data-nav-tone]")].map((node) => {
    const rect = node.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      bottom: rect.bottom + window.scrollY,
      tone: (node.dataset.navTone as NavTone) || "on-dark",
    };
  });
}
