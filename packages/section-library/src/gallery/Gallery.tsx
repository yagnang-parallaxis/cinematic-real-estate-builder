"use client";

import { Animated } from "@cinematic/animation-engine";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

export interface GalleryItem {
  src: string;
  alt: string;
  caption?: string;
}

export interface GalleryContent {
  eyebrow: string;
  heading: string;
  hint: string;
  items: GalleryItem[];
}

function getFocusable(root: HTMLElement) {
  return [
    ...root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ];
}

export function Gallery({ content }: { content: GalleryContent }) {
  const [active, setActive] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const headingId = useId();
  const item = active === null ? null : content.items[active];

  useEffect(() => {
    if (active === null) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();

    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setActive(null);
        lastTrigger.current?.focus();
      }
      if (event.key === "ArrowRight") {
        setActive((index) => (index === null ? 0 : (index + 1) % content.items.length));
      }
      if (event.key === "ArrowLeft") {
        setActive((index) =>
          index === null ? 0 : (index - 1 + content.items.length) % content.items.length,
        );
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [active, content.items.length]);

  const trapFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !dialogRef.current) {
      return;
    }

    const nodes = getFocusable(dialogRef.current);
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (!first || !last) {
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <section id="gallery" className="mx-auto max-w-6xl px-6 py-24 md:px-10">
      <div className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl space-y-4">
          <Animated type="textReveal" className="t-label text-primary">
            {content.eyebrow}
          </Animated>
          <Animated type="textReveal" as="h2" className="t-h1">
            {content.heading}
          </Animated>
        </div>
        <p className="t-caption text-muted-foreground lg:hidden">{content.hint}</p>
      </div>
      <ul className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
        {content.items.map((entry, index) => (
          <li
            key={entry.src}
            className={
              index === 0
                ? "min-w-[82%] snap-center lg:col-span-2 lg:min-w-0"
                : "min-w-[72%] snap-center lg:min-w-0"
            }
          >
            <button
              type="button"
              className="group relative block w-full overflow-hidden text-left"
              onClick={(event) => {
                lastTrigger.current = event.currentTarget;
                setActive(index);
              }}
            >
              <img
                src={entry.src}
                alt={entry.alt}
                className={`${index === 0 ? "aspect-4/3 lg:aspect-16/10" : "aspect-4/3"} w-full object-cover transition-transform duration-700 lg:group-hover:scale-[1.03]`}
              />
              {entry.caption ? <span className="sr-only">{entry.caption}</span> : null}
            </button>
          </li>
        ))}
      </ul>
      {item ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
          className="fixed inset-0 z-[80] flex flex-col bg-background p-6"
          onKeyDown={trapFocus}
        >
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
            <p id={headingId} className="t-caption text-muted-foreground">
              {active! + 1} of {content.items.length}
            </p>
            <button
              type="button"
              className="t-label text-foreground"
              onClick={() => {
                setActive(null);
                lastTrigger.current?.focus();
              }}
            >
              Close
            </button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center gap-4 py-6">
            <button
              type="button"
              className="t-label text-muted-foreground hidden lg:inline-flex"
              onClick={() =>
                setActive((index) =>
                  index === null ? 0 : (index - 1 + content.items.length) % content.items.length,
                )
              }
            >
              Previous
            </button>
            <figure className="flex max-h-full max-w-5xl flex-col items-center gap-4">
              <img src={item.src} alt={item.alt} className="max-h-[72vh] w-auto object-contain" />
              {item.caption ? (
                <figcaption className="t-caption text-muted-foreground">{item.caption}</figcaption>
              ) : null}
            </figure>
            <button
              type="button"
              className="t-label text-muted-foreground hidden lg:inline-flex"
              onClick={() =>
                setActive((index) => (index === null ? 0 : (index + 1) % content.items.length))
              }
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
