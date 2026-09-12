"use client";

import { Animated } from "@cinematic/animation-engine";
import { cn } from "@cinematic/ui";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import type { NavigationContent } from "./types";

function getFocusable(root: HTMLElement) {
  return [
    ...root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ];
}

export function Navigation({
  content,
  currentPath = "/",
}: {
  content: NavigationContent;
  currentPath?: string;
}) {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!content.showProgress) {
      return;
    }

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max <= 0 ? 0 : window.scrollY / max);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [content.showProgress]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const overlay = overlayRef.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    overlay?.querySelector<HTMLElement>("a, button")?.focus();

    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const trapFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !overlayRef.current) {
      return;
    }

    const nodes = getFocusable(overlayRef.current);
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

  const closeAndReturn = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <>
      <a
        href="#content"
        className="t-label bg-primary text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <header className="fixed inset-x-0 top-0 z-50">
        <nav
          aria-label="Primary"
          className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-10"
        >
          <a href={content.homeHref} className="t-label text-foreground">
            {content.brand}
          </a>
          <ul className="hidden items-center gap-8 lg:flex">
            {content.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={cn(
                    "t-label text-muted-foreground hover:text-foreground transition-colors",
                    currentPath === link.href && "text-foreground",
                  )}
                  aria-current={currentPath === link.href ? "page" : undefined}
                >
                  {link.label}
                </a>
              </li>
            ))}
            {content.contact ? (
              <li>
                <a href={content.contact.href} className="t-label text-muted-foreground">
                  {content.contact.label}
                </a>
              </li>
            ) : null}
            {content.cta ? (
              <li>
                <a href={content.cta.href} className="t-label text-primary">
                  {content.cta.label}
                </a>
              </li>
            ) : null}
          </ul>
          <button
            ref={triggerRef}
            type="button"
            className="t-label text-foreground lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </nav>
        {content.showProgress ? (
          <div className="bg-border h-px w-full" aria-hidden="true">
            <div className="bg-primary h-full" style={{ width: `${progress * 100}%` }} />
          </div>
        ) : null}
      </header>
      {open ? (
        <div
          ref={overlayRef}
          id={menuId}
          className="bg-background fixed inset-0 z-40 flex flex-col justify-end px-6 py-10 lg:hidden"
          onKeyDown={trapFocus}
        >
          <Animated type="menuReveal" config={{ duration: 0.45, direction: "up" }}>
            <p className="t-caption text-muted-foreground mb-10 max-w-xs">
              {content.mobileTagline}
            </p>
            <ul className="space-y-5">
              {content.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="t-h2" onClick={closeAndReturn}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            {content.cta ? (
              <a href={content.cta.href} className="t-label text-primary mt-10 inline-block">
                {content.cta.label}
              </a>
            ) : null}
          </Animated>
        </div>
      ) : null}
    </>
  );
}
