"use client";

import { Animated } from "@cinematic/animation-engine";
import { useRef } from "react";

export interface HorizontalGalleryItem {
  src: string;
  alt: string;
  caption?: string;
}

export interface HorizontalGalleryContent {
  eyebrow: string;
  heading: string;
  hint: string;
  items: HorizontalGalleryItem[];
}

export function HorizontalGallery({ content }: { content: HorizontalGalleryContent }) {
  const scrollerRef = useRef<HTMLUListElement>(null);

  const scrollByPage = (direction: -1 | 1) => {
    const node = scrollerRef.current;
    if (!node) {
      return;
    }

    node.scrollBy({ left: direction * node.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section id="walk" className="py-24">
      <div className="mx-auto mb-10 flex max-w-6xl flex-col gap-4 px-6 md:px-10 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl space-y-4">
          <Animated type="textReveal" className="t-label text-primary">
            {content.eyebrow}
          </Animated>
          <Animated type="textReveal" as="h2" className="t-h1">
            {content.heading}
          </Animated>
        </div>
        <div className="flex items-center justify-between gap-6">
          <p className="t-caption text-muted-foreground">{content.hint}</p>
          <div className="hidden gap-4 lg:flex">
            <button type="button" className="t-label text-primary" onClick={() => scrollByPage(-1)}>
              Previous
            </button>
            <button type="button" className="t-label text-primary" onClick={() => scrollByPage(1)}>
              Next
            </button>
          </div>
        </div>
      </div>
      <ul
        ref={scrollerRef}
        tabIndex={0}
        aria-label={content.heading}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            scrollByPage(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            scrollByPage(-1);
          }
        }}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 md:px-10 [scrollbar-width:none]"
      >
        {content.items.map((item) => (
          <li key={item.src} className="min-w-[82vw] snap-center md:min-w-[62vw] lg:min-w-[48vw]">
            <figure>
              <img src={item.src} alt={item.alt} className="aspect-16/10 w-full object-cover" />
              {item.caption ? (
                <figcaption className="t-caption text-muted-foreground mt-3">{item.caption}</figcaption>
              ) : null}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
