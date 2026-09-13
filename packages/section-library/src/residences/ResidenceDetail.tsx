"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { useEnquiry } from "../enquiry/EnquiryProvider";
import { CircleCta } from "../shared/CircleCta";
import { HoverSlide } from "../shared/HoverSlide";
import { Reveal, RevealLines } from "../shared/Reveal";
import { Section } from "../shared/Section";
import {
  formatArea,
  formatBedrooms,
  formatCounter,
  formatFloor,
  formatOutdoor,
  isEnquirable,
  nextImageIndex,
  previousImageIndex,
  residenceMedia,
  statusLabel,
} from "./logic";
import type { Residence, ResidenceDetailContent } from "./types";

export type { ResidenceDetailContent } from "./types";

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

function focusableWithin(root: HTMLElement | null): HTMLElement[] {
  if (!root) {
    return [];
  }
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (node) => node.getAttribute("aria-hidden") !== "true",
  );
}

type InfoTab = "info" | "benefits";

export function ResidenceDetail({ content }: { content: ResidenceDetailContent }) {
  const { residence } = content;
  const { open: openEnquiry } = useEnquiry();

  const media = residenceMedia(residence, {
    schematic: "Key plan",
    plan: "Floor plan",
  });
  const planIndex = media.length - 1;

  const [tab, setTab] = useState<InfoTab>("info");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;
  const current = openIndex === null ? null : media[openIndex];

  const captionId = useId();
  const infoPanelId = useId();
  const benefitsPanelId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const trigger = triggerRef.current;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [isOpen]);

  const close = () => setOpenIndex(null);

  const page = (step: 1 | -1) => {
    setOpenIndex((index) => {
      if (index === null) {
        return index;
      }
      return step === 1
        ? nextImageIndex(index, media.length)
        : previousImageIndex(index, media.length);
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

  const specs: { label: string; value: string }[] = [
    {
      label: content.bedroomsLabel,
      value: formatBedrooms(residence.bedrooms, "bedroom", "bedrooms"),
    },
    {
      label: content.bathroomsLabel,
      value: formatBedrooms(residence.bathrooms, "bathroom", "bathrooms"),
    },
    { label: content.interiorLabel, value: formatArea(residence.interiorSqm) },
    {
      label: content.outdoorLabel,
      value: `${formatArea(residence.outdoorSqm)} ${residence.outdoorLabel.toLowerCase()}`,
    },
    { label: content.blockLabel, value: `${residence.block} block` },
    {
      label: content.floorLabel,
      value: residence.floorLabel || formatFloor(residence.floor),
    },
    { label: content.orientationLabel, value: residence.orientation },
    { label: content.completionLabel, value: residence.completion },
  ];

  return (
    <>
      <Section
        id="residence"
        tone="light"
        label={residence.name}
        className="residence-detail"
        seam={content.similar.length > 0 ? "light-deep" : "dark"}
      >
        <div className="section-shell residence-detail-shell">
          <nav aria-label="Breadcrumb" className="residence-crumbs">
            <ol className="residence-crumbs-list">
              {content.crumbs.map((crumb, index) => (
                <li key={`${crumb.label}-${index}`} className="t-label residence-crumb">
                  {crumb.href ? (
                    <a href={crumb.href} className="residence-crumb-link">
                      <HoverSlide>{crumb.label}</HoverSlide>
                    </a>
                  ) : (
                    <span aria-current="page">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <header className="residence-detail-head">
            <Reveal variant="block" className="residence-detail-kicker">
              <span className="t-label">{residence.typeLabel}</span>
              <span className="t-caption residence-detail-kicker-date">
                {content.completionLabel}: {residence.completion}
              </span>
            </Reveal>

            <RevealLines
              as="h1"
              lines={[residence.name]}
              className="t-display residence-detail-name"
            />

            <Reveal variant="block" delay={0.08} className="residence-detail-place">
              <p className="t-body">
                {residence.block} block · {residence.floorLabel} · {residence.orientation}
              </p>
              <p className="t-label residence-detail-status" data-status={residence.status}>
                <span className="residence-detail-dot" aria-hidden="true" />
                {content.statusLabel}: {statusLabel(residence.status)}
              </p>
            </Reveal>
          </header>

          {/*
           * Media comes first in the document so the compact layout reads
           * media-then-info in source order, not only visually. On desktop the
           * grid places the info column back on the left.
           */}
          <div className="residence-detail-split">
            <section className="residence-media" aria-label={content.mediaLabel}>
              <ul className="residence-media-list">
                {media.map((item, index) => (
                  <li
                    key={item.id}
                    className="residence-media-item"
                    data-role={
                      item.fit === "contain" ? "drawing" : index === 0 ? "primary" : "photo"
                    }
                    data-fit={item.fit}
                  >
                    <button
                      type="button"
                      className="residence-media-button"
                      aria-haspopup="dialog"
                      onClick={(event) => {
                        triggerRef.current = event.currentTarget;
                        setOpenIndex(index);
                      }}
                    >
                      <Reveal
                        as="span"
                        variant={item.fit === "cover" ? "media" : "block"}
                        threshold={0.05}
                        className="residence-media-frame"
                      >
                        <img
                          src={item.src}
                          alt={item.fit === "contain" ? item.alt : ""}
                          className="residence-media-image"
                          data-fit={item.fit}
                          loading={index === 0 ? "eager" : "lazy"}
                        />
                      </Reveal>
                      <span className="residence-media-meta">
                        <span className="t-label residence-media-label">{item.label}</span>
                        <span className="t-caption residence-media-expand" aria-hidden="true">
                          {content.expandLabel}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <p className="drag-hint t-label residence-media-hint">
                <span className="residence-media-hint-rule" aria-hidden="true" />
                {content.dragHint}
              </p>
            </section>

            {/*
             * Scrolls in its own right on desktop. `tabIndex` keeps it reachable
             * by keyboard; `data-lenis-prevent` hands the wheel to the column
             * rather than to the page's virtual scroll.
             */}
            <section
              className="residence-info"
              aria-label={content.infoLabel}
              tabIndex={0}
              data-lenis-prevent
            >
              <dl className="residence-specs">
                {specs.map((spec) => (
                  <div key={spec.label} className="residence-spec">
                    <dt className="t-label residence-spec-label">{spec.label}</dt>
                    <dd className="t-h5 residence-spec-value">{spec.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="residence-tabs">
                <div className="residence-tablist" role="tablist" aria-label={content.infoLabel}>
                  {(
                    [
                      ["info", content.infoTabLabel, infoPanelId],
                      ["benefits", content.benefitsTabLabel, benefitsPanelId],
                    ] as const
                  ).map(([id, label, panelId]) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      id={`${panelId}-tab`}
                      className="residence-tab t-label"
                      aria-selected={tab === id}
                      aria-controls={panelId}
                      tabIndex={tab === id ? 0 : -1}
                      onClick={() => setTab(id)}
                    >
                      {label}
                      <span className="residence-tab-rule" aria-hidden="true" />
                    </button>
                  ))}
                </div>

                <div
                  id={infoPanelId}
                  role="tabpanel"
                  aria-labelledby={`${infoPanelId}-tab`}
                  className="residence-tabpanel"
                  hidden={tab !== "info"}
                >
                  <p className="t-body residence-description">{residence.description}</p>
                </div>

                <div
                  id={benefitsPanelId}
                  role="tabpanel"
                  aria-labelledby={`${benefitsPanelId}-tab`}
                  className="residence-tabpanel"
                  hidden={tab !== "benefits"}
                >
                  <h2 className="t-label residence-features-title">{content.featuresLabel}</h2>
                  <ul className="residence-features">
                    {residence.features.map((feature) => (
                      <li key={feature} className="t-body residence-feature">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="residence-actions">
                <button
                  type="button"
                  className="residence-plan-link t-label"
                  aria-haspopup="dialog"
                  onClick={(event) => {
                    triggerRef.current = event.currentTarget;
                    setOpenIndex(planIndex);
                  }}
                >
                  <HoverSlide>{content.viewPlanLabel}</HoverSlide>
                </button>

                {isEnquirable(residence.status) ? (
                  <CircleCta
                    label={content.ctaLabel}
                    size="md"
                    onClick={() => openEnquiry(`residence-${residence.slug}`)}
                  />
                ) : (
                  <p className="t-body residence-sold-note">
                    {residence.name} is sold. {content.ctaLabel} about the others.
                  </p>
                )}

                <a href={content.backHref} className="residence-back t-label">
                  <HoverSlide>{content.backLabel}</HoverSlide>
                </a>
              </div>
            </section>
          </div>
        </div>

        {current ? (
          <div
            ref={dialogRef}
            className="residence-lightbox"
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
              className="residence-lightbox-scrim"
              tabIndex={-1}
              aria-hidden="true"
              onClick={close}
            />

            <div className="residence-lightbox-shell">
              <div className="residence-lightbox-bar">
                <p className="t-label residence-lightbox-counter" aria-live="polite">
                  {formatCounter(openIndex ?? 0, media.length)}
                </p>
                <button
                  ref={closeRef}
                  type="button"
                  className="residence-lightbox-close"
                  onClick={close}
                >
                  <span className="t-label">{content.closeLabel}</span>
                  <svg viewBox="0 0 16 16" fill="none" className="residence-lightbox-cross">
                    <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" />
                  </svg>
                </button>
              </div>

              <figure className="residence-lightbox-figure">
                <img
                  key={current.id}
                  src={current.src}
                  alt={current.alt}
                  className="residence-lightbox-image"
                  /* A drawing is always contained; a photograph may be too. */
                  data-fit={current.fit}
                />
                <figcaption id={captionId} className="t-body residence-lightbox-caption">
                  {current.caption}
                </figcaption>
              </figure>

              <div className="residence-lightbox-controls">
                <button
                  type="button"
                  className="residence-lightbox-step"
                  aria-label={content.previousLabel}
                  onClick={() => page(-1)}
                >
                  <svg viewBox="0 0 24 12" fill="none" className="residence-lightbox-arrow">
                    <path d="M23 6H1M7 1L1 6l6 5" stroke="currentColor" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="residence-lightbox-step"
                  data-direction="next"
                  aria-label={content.nextLabel}
                  onClick={() => page(1)}
                >
                  <svg viewBox="0 0 24 12" fill="none" className="residence-lightbox-arrow">
                    <path d="M23 6H1M7 1L1 6l6 5" stroke="currentColor" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </Section>

      {content.similar.length > 0 ? (
        <Section
          tone="light-deep"
          label={content.similarEyebrow}
          className="residence-similar"
          seam="dark"
        >
          <div className="section-shell residence-similar-shell">
            <header className="residence-similar-head">
              <Reveal variant="block" className="t-label residence-similar-eyebrow">
                {content.similarEyebrow}
              </Reveal>
              <RevealLines
                lines={content.similarHeadingLines}
                className="t-h2 residence-similar-heading"
              />
            </header>

            <ul className="residence-similar-list" aria-label={content.similarEyebrow}>
              {content.similar.map((other, index) => (
                <SimilarCard key={other.slug} residence={other} delay={index * 0.06} />
              ))}
            </ul>
          </div>
        </Section>
      ) : null}
    </>
  );
}

function SimilarCard({ residence, delay }: { residence: Residence; delay: number }) {
  return (
    <li className="residence-similar-item">
      <Reveal variant="block" delay={delay} threshold={0.05}>
        <a href={`/residences/${residence.slug}`} className="residence-similar-card">
          <span className="residence-similar-plate">
            <img
              src={residence.schematic.src}
              alt=""
              className="residence-similar-schematic"
              loading="lazy"
            />
          </span>
          <span className="t-label residence-similar-type">{residence.typeLabel}</span>
          <span className="residence-similar-id">
            <span className="t-caption" aria-hidden="true">
              №
            </span>
            <span className="t-h4">{residence.number}</span>
          </span>
          <span className="t-caption residence-similar-figures">
            {formatBedrooms(residence.bedrooms, "bed", "bed")} · {formatArea(residence.interiorSqm)}{" "}
            · {formatOutdoor(residence.outdoorSqm)} {residence.outdoorLabel.toLowerCase()}
          </span>
          <span className="t-label residence-similar-status" data-status={residence.status}>
            <span className="residence-similar-dot" aria-hidden="true" />
            {statusLabel(residence.status)}
          </span>
        </a>
      </Reveal>
    </li>
  );
}
