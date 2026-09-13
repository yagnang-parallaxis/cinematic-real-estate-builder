"use client";

import { Animated } from "@cinematic/animation-engine";
import { cn } from "@cinematic/ui";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { EnquiryTrigger } from "../enquiry/EnquiryTrigger";
import { useEnquiry } from "../enquiry/EnquiryProvider";
import { BrandMark, BrandSeal, ScrollChevron } from "../shared/BrandMark";
import { HoverSlide } from "../shared/HoverSlide";
import {
  formatSectionIndex,
  overlayLinks,
  readSectionTones,
  resolveNavTone,
  resolveSectionIndex,
  scrollProgress,
  sealDirectionFromVelocity,
  sealSpinRate,
  stepSealAngle,
} from "./logic";
import type { SealDirection } from "./logic";
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
  const { open: openEnquiry } = useEnquiry();
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tone, setTone] = useState<NavTone>("on-dark");
  const [sceneIndex, setSceneIndex] = useState(1);
  const overlayRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const menuLinks = overlayLinks(content);
  const sceneLabel = formatSectionIndex(sceneIndex);

  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const logo = document.querySelector<HTMLElement>(".nav-logo");

    const syncChrome = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const sections = readSectionTones();
      const probeY = window.scrollY + 48;
      setProgress(scrollProgress(window.scrollY, max));
      setTone(resolveNavTone(sections, probeY));
      setSceneIndex(resolveSectionIndex(sections, probeY));
    };

    let angle = 0;
    let direction: SealDirection = 1;
    let velocity = 0;
    let lastY = window.scrollY;
    let lastScrollT = performance.now();
    let lastTickT = lastScrollT;
    let lastScrollAt = lastScrollT;
    let frame = 0;

    const writeTurn = (value: number) => {
      logo?.style.setProperty("--seal-turn", `${value.toFixed(2)}deg`);
    };

    const sampleScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      const dt = now - lastScrollT;
      if (dt > 0) {
        const instant = ((y - lastY) / dt) * 1000;
        velocity = velocity * 0.65 + instant * 0.35;
      }
      lastY = y;
      lastScrollT = now;
      lastScrollAt = now;
      syncChrome();
    };

    const tick = (now: number) => {
      const dt = Math.min(48, now - lastTickT);
      lastTickT = now;

      if (now - lastScrollAt > 90) {
        velocity *= 0.86;
        if (Math.abs(velocity) < 2) {
          velocity = 0;
        }
      }

      if (!calm.matches) {
        direction = sealDirectionFromVelocity(velocity, direction);
        angle = stepSealAngle(angle, sealSpinRate(velocity, direction), dt);
        writeTurn(angle);
      } else {
        writeTurn(0);
      }

      frame = requestAnimationFrame(tick);
    };

    syncChrome();
    writeTurn(0);
    frame = requestAnimationFrame(tick);
    window.addEventListener("scroll", sampleScroll, { passive: true });
    window.addEventListener("resize", syncChrome);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", sampleScroll);
      window.removeEventListener("resize", syncChrome);
      logo?.style.removeProperty("--seal-turn");
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
      <a
        href="#content"
        className="nav-skip t-label sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <div className="nav-chrome" data-nav-contrast={tone}>
        <a href={content.homeHref} className="nav-logo" aria-label={`${content.brand} — back to top`}>
          <BrandSeal label={content.sealLabel ?? content.brand} className="nav-logo-seal" />
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
              <EnquiryTrigger source="navigation" className="nav-action">
                <HoverSlide className="t-label">{content.cta.label}</HoverSlide>
              </EnquiryTrigger>
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
                  <span className="t-label">{sceneLabel}</span>
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
              {menuLinks.map((link) => {
                const opensEnquiry =
                  Boolean(content.cta) &&
                  link.label === content.cta?.label &&
                  link.href === content.cta?.href;

                return (
                  <li key={`${link.label}-${link.href}`}>
                    {opensEnquiry ? (
                      <button
                        type="button"
                        className="nav-overlay-link"
                        aria-haspopup="dialog"
                        onClick={() => {
                          closeAndReturn();
                          openEnquiry("navigation-menu");
                        }}
                      >
                        <HoverSlide className="t-h6" align="center">
                          {link.label}
                        </HoverSlide>
                      </button>
                    ) : (
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
                    )}
                  </li>
                );
              })}
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
