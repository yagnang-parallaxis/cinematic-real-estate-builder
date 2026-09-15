"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { Reveal } from "../shared/Reveal";
import { Section } from "../shared/Section";
import { lockScroll } from "../shared/scroll-lock";
import {
  clampRotationMs,
  cycleWordIndex,
  formatCounter,
  nextImageIndex,
  normaliseImages,
  previousImageIndex,
  splitGallery,
} from "./logic";
import type { InteriorImage, InteriorsContent } from "./types";

export type { InteriorImage, InteriorsContent } from "./types";

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

function focusableWithin(root: HTMLElement | null): HTMLElement[] {
  if (!root) {
    return [];
  }
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (node) => node.getAttribute("aria-hidden") !== "true",
  );
}

export function Interiors({ content }: { content: InteriorsContent }) {
  const images = normaliseImages(content.images);
  const { primary, secondary } = splitGallery(images);
  const wordCount = content.rotatingWords.length;
  const rotationMs = clampRotationMs(content.rotationMs);
  const captionId = useId();

  const [wordIndex, setWordIndex] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;

  const headingRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const element = headingRef.current;
    if (!element || wordCount < 2 || isOpen) {
      return;
    }

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Without an observer the word simply rotates; the interval is the fallback.
    let onScreen = typeof IntersectionObserver === "undefined";
    let timer: ReturnType<typeof setInterval> | undefined;

    const sync = () => {
      const shouldRotate = onScreen && !calm.matches;
      if (shouldRotate && !timer) {
        timer = setInterval(
          () => setWordIndex((current) => cycleWordIndex(current, wordCount)),
          rotationMs,
        );
      } else if (!shouldRotate && timer) {
        clearInterval(timer);
        timer = undefined;
      }
    };

    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            (entries) => {
              onScreen = entries.some((entry) => entry.isIntersecting);
              sync();
            },
            { threshold: 0.2 },
          );

    observer?.observe(element);
    calm.addEventListener("change", sync);
    sync();

    return () => {
      observer?.disconnect();
      calm.removeEventListener("change", sync);
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isOpen, rotationMs, wordCount]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const trigger = triggerRef.current;
    const unlock = lockScroll();
    closeRef.current?.focus();

    return () => {
      unlock();
      trigger?.focus();
    };
  }, [isOpen]);

  const close = () => setOpenIndex(null);

  const page = (step: 1 | -1) => {
    setOpenIndex((current) => {
      if (current === null) {
        return current;
      }
      return step === 1
        ? nextImageIndex(current, images.length)
        : previousImageIndex(current, images.length);
    });
  };

  const onDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      page(1);
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      page(-1);
      return;
    }
    if (event.key !== "Tab") {
      return;
    }

    const focusable = focusableWithin(dialogRef.current);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) {
      return;
    }

    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const renderShot = (image: InteriorImage, index: number, role: "primary" | "secondary") => (
    <button
      key={image.id}
      type="button"
      className="interiors-shot"
      data-role={role}
      aria-haspopup="dialog"
      onClick={(event) => {
        triggerRef.current = event.currentTarget;
        setOpenIndex(index);
      }}
    >
      <Reveal as="span" variant="media" className="interiors-shot-frame">
        <img src={image.src} alt={image.alt} className="interiors-shot-image" loading="lazy" />
      </Reveal>
      <span className="interiors-shot-expand" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none" className="interiors-shot-icon">
          <path d="M6 1H1v5M10 1h5v5M10 15h5v-5M6 15H1v-5" stroke="currentColor" />
        </svg>
        <span className="t-label">{content.expandLabel}</span>
      </span>
      <span className="t-label interiors-shot-room">{image.room}</span>
    </button>
  );

  if (!primary) {
    return null;
  }

  const current = openIndex === null ? null : images[openIndex];

  return (
    <Section id="interiors" tone="light-deep" label={content.galleryLabel} className="interiors">
      <div className="interiors-plate" aria-hidden="true" />

      <div className="section-shell interiors-shell">
        <div className="interiors-intro">
          <Reveal variant="block" className="t-label interiors-eyebrow">
            {content.eyebrow}
          </Reveal>

          <div ref={headingRef} className="interiors-heading-wrap">
            <Reveal as="h2" variant="mask" className="t-h1 interiors-heading">
              {content.headingPrefix}{" "}
              <span className="interiors-word">
                {content.rotatingWords.map((word, index) => (
                  <span
                    key={word}
                    className="t-accent interiors-word-item"
                    data-active={index === wordIndex ? "true" : undefined}
                    aria-hidden={index === wordIndex ? undefined : "true"}
                  >
                    {word}
                  </span>
                ))}
              </span>
            </Reveal>
          </div>

          <Reveal variant="block" delay={0.1} className="interiors-body">
            <p className="t-body">{content.body}</p>
          </Reveal>
        </div>

        <div className="interiors-gallery">
          {renderShot(primary, 0, "primary")}
          {secondary.map((image, index) => renderShot(image, index + 1, "secondary"))}
        </div>

        <p className="drag-hint t-label interiors-hint">
          <span className="interiors-hint-rule" aria-hidden="true" />
          {content.dragHint}
        </p>
      </div>

      {current ? (
        <div
          ref={dialogRef}
          className="interiors-lightbox"
          data-tone="dark"
          data-lenis-prevent
          role="dialog"
          aria-modal="true"
          aria-label={content.lightboxLabel}
          aria-describedby={captionId}
          onKeyDown={onDialogKeyDown}
        >
          <button
            type="button"
            className="interiors-lightbox-scrim"
            tabIndex={-1}
            aria-hidden="true"
            onClick={close}
          />

          <div className="interiors-lightbox-shell">
            <div className="interiors-lightbox-bar">
              <p className="t-label interiors-lightbox-counter" aria-live="polite">
                {formatCounter(openIndex ?? 0, images.length)}
              </p>
              <button
                ref={closeRef}
                type="button"
                className="interiors-lightbox-close"
                onClick={close}
              >
                <span className="t-label">{content.closeLabel}</span>
                <svg viewBox="0 0 16 16" fill="none" className="interiors-lightbox-cross">
                  <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" />
                </svg>
              </button>
            </div>

            <figure className="interiors-lightbox-figure">
              <img
                key={current.id}
                src={current.src}
                alt={current.alt}
                className="interiors-lightbox-image"
              />
              <figcaption id={captionId} className="t-body interiors-lightbox-caption">
                {current.caption}
              </figcaption>
            </figure>

            <div className="interiors-lightbox-controls">
              <button
                type="button"
                className="interiors-lightbox-step"
                aria-label={content.previousLabel}
                onClick={() => page(-1)}
              >
                <svg viewBox="0 0 24 12" fill="none" className="interiors-lightbox-arrow">
                  <path d="M23 6H1M7 1L1 6l6 5" stroke="currentColor" />
                </svg>
              </button>
              <button
                type="button"
                className="interiors-lightbox-step"
                data-direction="next"
                aria-label={content.nextLabel}
                onClick={() => page(1)}
              >
                <svg viewBox="0 0 24 12" fill="none" className="interiors-lightbox-arrow">
                  <path d="M23 6H1M7 1L1 6l6 5" stroke="currentColor" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Section>
  );
}
