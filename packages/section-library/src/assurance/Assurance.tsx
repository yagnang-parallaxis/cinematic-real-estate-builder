"use client";

import { useRef, useState, type KeyboardEvent } from "react";

import { HoverSlide } from "../shared/HoverSlide";
import { Reveal, RevealLines } from "../shared/Reveal";
import { Section } from "../shared/Section";
import {
  initialOpenRows,
  moveFocusIndex,
  normalizeRows,
  rowHeaderId,
  rowPanelId,
  toggleOpenRows,
} from "./logic";
import type { AssuranceContent } from "./types";

export type { AssuranceContent, AssuranceImage, AssuranceLink, AssuranceRow } from "./types";

function LinkArrow() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" className="assurance-link-arrow">
      <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/**
 * The calmest block on the page: no parallax, no pinning, nothing scroll-coupled.
 * Rows expand through `grid-template-rows: 0fr → 1fr`, so each panel animates to
 * its own content height without a measured pixel value.
 */
export function Assurance({ content }: { content: AssuranceContent }) {
  const rows = normalizeRows(content.rows);
  const exclusive = content.exclusive ?? false;
  const [open, setOpen] = useState<string[]>(() =>
    initialOpenRows(rows, content.defaultOpenIds, exclusive),
  );
  const triggers = useRef<Array<HTMLButtonElement | null>>([]);

  if (rows.length === 0) {
    return null;
  }

  const lines = content.headingLines ?? [content.heading];

  const onHeaderKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = moveFocusIndex(index, rows.length, event.key);
    if (next === null) {
      return;
    }
    event.preventDefault();
    triggers.current[next]?.focus();
  };

  return (
    <Section id="assurance" tone="light" label={content.eyebrow}>
      <div className="section-shell assurance">
        <header className="assurance-intro section-measure">
          <Reveal as="p" variant="block" className="t-label assurance-eyebrow">
            {content.eyebrow}
          </Reveal>
          <RevealLines lines={lines} className="t-h3 assurance-heading" delay={0.06} />
          <Reveal variant="block" delay={0.12}>
            <p className="t-lead assurance-lead">{content.intro}</p>
          </Reveal>
        </header>

        <div className="assurance-body">
          <Reveal as="ul" variant="block" stagger={0.06} className="assurance-rows">
            {rows.map((row, index) => {
              const isOpen = open.includes(row.id);

              return (
                <li key={row.id} className="assurance-row" data-open={isOpen ? "true" : "false"}>
                  <h3 className="assurance-row-heading">
                    <button
                      ref={(node) => {
                        triggers.current[index] = node;
                      }}
                      type="button"
                      id={rowHeaderId(row.id)}
                      className="assurance-row-trigger"
                      aria-expanded={isOpen}
                      aria-controls={rowPanelId(row.id)}
                      onClick={() =>
                        setOpen((current) => toggleOpenRows(current, row.id, exclusive))
                      }
                      onKeyDown={(event) => onHeaderKeyDown(event, index)}
                    >
                      <span className="t-h5 assurance-row-title">{row.title}</span>
                      <span className="assurance-mark" aria-hidden="true">
                        <span className="assurance-mark-stroke" />
                        <span className="assurance-mark-stroke" />
                      </span>
                    </button>
                  </h3>

                  <div
                    id={rowPanelId(row.id)}
                    role="region"
                    aria-labelledby={rowHeaderId(row.id)}
                    aria-hidden={isOpen ? undefined : true}
                    inert={!isOpen}
                    className="assurance-panel"
                  >
                    <div className="assurance-panel-inner">
                      <div className="assurance-panel-body">
                        <p className="t-body assurance-detail">{row.detail}</p>
                        {row.link ? (
                          <a
                            href={row.link.href}
                            target="_blank"
                            rel="noreferrer"
                            className="t-label assurance-link"
                            aria-label={`${row.link.label} (opens in a new tab)`}
                          >
                            <HoverSlide align="start">{row.link.label}</HoverSlide>
                            <LinkArrow />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </Reveal>

          {content.image ? (
            <aside className="assurance-aside">
              <figure className="assurance-figure">
                <Reveal variant="media" className="assurance-frame">
                  <img
                    src={content.image.src}
                    alt={content.image.alt}
                    className="assurance-image"
                  />
                </Reveal>
                {content.image.caption ? (
                  <figcaption className="t-caption assurance-caption">
                    {content.image.caption}
                  </figcaption>
                ) : null}
              </figure>
            </aside>
          ) : null}
        </div>

        {content.note ? (
          <Reveal variant="block">
            <p className="t-caption assurance-note">{content.note}</p>
          </Reveal>
        ) : null}
      </div>
    </Section>
  );
}
