"use client";

import { Animated } from "@cinematic/animation-engine";
import { cn } from "@cinematic/ui";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { BrandMark, BrandRing, ScrollChevron } from "./BrandMark";
import { HoverSlide } from "./HoverSlide";
import {
  formatProgressLabel,
  overlayLinks,
  readSectionTones,
  resolveNavTone,
  scrollProgress,
} from "./logic";
import type { NavigationContent, NavigationLink, NavTone } from "./types";

function getFocusable(root: HTMLElement) {
  return [
    ...root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ];
}

function linkText(link: NavigationLink) {
  if (link.lines) {
    return (
      <>
        {link.lines[0]}
        <br />
        {link.lines[1]}
      </>
    );
  }

  return link.label;
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
  const [tone, setTone] = useState<NavTone>("on-dark");
  const overlayRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const menuLinks = overlayLinks(content);
  const progressLabel = formatProgressLabel(progress);

  useEffect(() => {
    const sync = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollProgress(window.scrollY, max));
      setTone(resolveNavTone(readSectionTones(), window.scrollY + 48));
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

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
      <a href="#content" className="nav-skip t-label sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:px-4 focus:py-2">
        Skip to content
      </a>
      <div className="nav-chrome" data-nav-contrast={tone}>
        <a
          href={content.homeHref}
          className="nav-logo"
          aria-label={`${content.brand} — back to top`}
        >
          <BrandRing className="nav-logo-ring" />
          <BrandMark className="nav-logo-mark" />
        </a>

        <nav aria-label="Primary" className="nav-rail">
          <div className="nav-rail-desk">
            {content.primary ? (
              <a
                href={content.primary.href}
                className="nav-primary"
                aria-current={currentPath === content.primary.href ? "page" : undefined}
              >
                <HoverSlide className="t-h6">{linkText(content.primary)}</HoverSlide>
              </a>
            ) : null}
            {content.cta ? (
              <a href={content.cta.href} className="nav-action">
                <HoverSlide className="t-label">{content.cta.label}</HoverSlide>
              </a>
            ) : null}
            {content.contact ? (
              <a href={content.contact.href} className="nav-action nav-action-tight">
                <HoverSlide className="t-label">{content.contact.label}</HoverSlide>
              </a>
            ) : null}
          </div>

          <button
            ref={triggerRef}
            type="button"
            className="nav-menu-btn"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
          >
            <HoverSlide className="t-label">{open ? "Close" : "Menu"}</HoverSlide>
            <span className={cn("nav-menu-ico", open && "is-open")} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </nav>

        {content.showProgress ? (
          <>
            <div className="nav-progress" aria-hidden="true">
              <div className="nav-progress-track" style={{ ["--progress" as string]: `${progress * 100}%` }}>
                <div className="nav-progress-fill" />
                <div className="nav-progress-rest" />
                <div className="nav-progress-thumb">
                  <span className="t-label">{progressLabel}</span>
                </div>
              </div>
            </div>
            <a href="#content" className="nav-scroll">
              <ScrollChevron className="nav-scroll-arrow" />
              <span className="t-label">{content.scrollLabel ?? "Scroll"}</span>
            </a>
          </>
        ) : null}
      </div>

      {open ? (
        <div
          ref={overlayRef}
          id={menuId}
          className="nav-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={content.overlayTitle ?? "Menu"}
          onKeyDown={trapFocus}
        >
          <Animated type="fadeUp" config={{ duration: 0.45, distance: 24 }} className="nav-overlay-panel">
            <div className="nav-overlay-title">
              {content.overlayAccent ? (
                <p className="t-accent nav-overlay-accent">{content.overlayAccent}</p>
              ) : null}
              <p className="t-h1">{content.overlayTitle ?? "Menu"}</p>
            </div>
            <ul className="nav-overlay-list">
              {menuLinks.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <a
                    href={link.href}
                    className="nav-overlay-link"
                    aria-current={currentPath === link.href ? "page" : undefined}
                    onClick={closeAndReturn}
                  >
                    <HoverSlide className="t-h6" align="center">
                      {link.label}
                    </HoverSlide>
                  </a>
                </li>
              ))}
            </ul>
            <div className="nav-overlay-mark">
              <BrandMark />
            </div>
          </Animated>
        </div>
      ) : null}
    </>
  );
}
