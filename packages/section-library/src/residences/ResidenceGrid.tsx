"use client";

import { useEffect, useId, useMemo, useState } from "react";

import { HoverSlide } from "../shared/HoverSlide";
import { Reveal, RevealLines } from "../shared/Reveal";
import { Section } from "../shared/Section";
import {
  bedroomOptions,
  buildListingQuery,
  filterSignature,
  formatArea,
  formatBedrooms,
  formatFloor,
  formatOutdoor,
  formatResultCount,
  isFiltered,
  selectResidences,
  statusLabel,
} from "./logic";
import type { Residence, ResidenceFilters, ResidenceGridContent, ResidenceSort } from "./types";

export type { ResidenceGridContent } from "./types";

/** Cards past this point still reveal, they just stop waiting their turn. */
const MAX_STAGGER_STEPS = 8;

export function ResidenceGrid({
  content,
  initialType = "all",
  initialBedrooms = "all",
  initialSort = "relevant",
}: {
  content: ResidenceGridContent;
  /** Read from `?type=` on the server, so a link from the homepage lands filtered. */
  initialType?: string | "all";
  initialBedrooms?: number | "all";
  initialSort?: ResidenceSort;
}) {
  const [filters, setFilters] = useState<ResidenceFilters>({
    type: initialType,
    bedrooms: initialBedrooms,
  });
  const [sort, setSort] = useState<ResidenceSort>(initialSort);

  const typeSelectId = useId();
  const bedroomSelectId = useId();
  const sortSelectId = useId();

  const beds = useMemo(() => bedroomOptions(content.residences), [content.residences]);
  const results = useMemo(
    () => selectResidences(content.residences, filters, sort),
    [content.residences, filters, sort],
  );
  const signature = filterSignature(filters, sort);

  /*
   * Keep the URL in step so the filtered listing can be shared or reloaded,
   * without a navigation: changing a filter re-flows the grid in place.
   */
  useEffect(() => {
    const query = buildListingQuery(filters, sort);
    const next = `${window.location.pathname}${query}`;
    if (next !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, "", next);
    }
  }, [filters, sort]);

  const reset = () => {
    setFilters({ type: "all", bedrooms: "all" });
    setSort("relevant");
  };

  return (
    <Section
      id="residences"
      tone="light"
      label={content.eyebrow}
      className="residence-grid"
      seam="dark"
    >
      <div className="section-shell residence-grid-shell">
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

        <header className="residence-grid-head">
          <Reveal variant="block" className="t-label residence-grid-eyebrow">
            {content.eyebrow}
          </Reveal>
          <RevealLines
            as="h1"
            lines={content.headingLines}
            className="t-h1 residence-grid-heading"
            fit="h1"
          />
          <Reveal variant="block" delay={0.1} className="residence-grid-intro">
            <p className="t-body">{content.intro}</p>
          </Reveal>
        </header>

        <div className="residence-grid-controls" role="group" aria-label={content.controlsLabel}>
          <p className="t-label residence-grid-count" role="status" aria-live="polite">
            {formatResultCount(results.length, {
              one: content.countOne,
              many: content.countMany,
              none: content.countNone,
            })}
          </p>

          <div className="residence-grid-fields">
            <div className="residence-field">
              <label className="t-label residence-field-label" htmlFor={typeSelectId}>
                {content.typeLabel}
              </label>
              <select
                id={typeSelectId}
                className="t-body residence-field-select"
                value={filters.type}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, type: event.target.value }))
                }
              >
                <option value="all">{content.allLabel}</option>
                {content.types.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="residence-field">
              <label className="t-label residence-field-label" htmlFor={bedroomSelectId}>
                {content.bedroomsLabel}
              </label>
              <select
                id={bedroomSelectId}
                className="t-body residence-field-select"
                value={String(filters.bedrooms)}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    bedrooms:
                      event.target.value === "all"
                        ? "all"
                        : Number.parseInt(event.target.value, 10),
                  }))
                }
              >
                <option value="all">{content.allLabel}</option>
                {beds.map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </div>

            <div className="residence-field">
              <label className="t-label residence-field-label" htmlFor={sortSelectId}>
                {content.sortLabel}
              </label>
              <select
                id={sortSelectId}
                className="t-body residence-field-select"
                value={sort}
                onChange={(event) => setSort(event.target.value as ResidenceSort)}
              >
                {content.sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="residence-reset t-label"
              onClick={reset}
              disabled={!isFiltered(filters, sort)}
            >
              <HoverSlide>{content.resetLabel}</HoverSlide>
            </button>
          </div>
        </div>

        {results.length === 0 ? (
          <Reveal variant="block" className="residence-grid-empty">
            <p className="t-h4 residence-grid-empty-heading">{content.emptyHeading}</p>
            <p className="t-body residence-grid-empty-body">{content.emptyBody}</p>
            <button type="button" className="residence-grid-empty-reset t-label" onClick={reset}>
              <HoverSlide>{content.resetLabel}</HoverSlide>
            </button>
          </Reveal>
        ) : (
          <ul className="residence-grid-list" aria-label={content.listLabel}>
            {results.map((residence, index) => (
              <ResidenceCard
                /* Re-keying on the controls replays the entry reveal as the grid re-flows. */
                key={`${signature}-${residence.slug}`}
                residence={residence}
                content={content}
                delay={Math.min(index, MAX_STAGGER_STEPS) * 0.05}
              />
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}

function ResidenceCard({
  residence,
  content,
  delay,
}: {
  residence: Residence;
  content: ResidenceGridContent;
  delay: number;
}) {
  return (
    <li className="residence-card-item">
      <Reveal variant="block" delay={delay} threshold={0.05} className="residence-card-reveal">
        <a href={`/residences/${residence.slug}`} className="residence-card">
          <span className="residence-card-plate">
            {/*
             * The key plan repeats what the card's own text already says, so it
             * is decorative here; it carries its full description on the
             * residence page, where it stands on its own.
             */}
            <img
              src={residence.schematic.src}
              alt=""
              className="residence-card-schematic"
              loading="lazy"
            />
          </span>

          <span className="residence-card-body">
            <span className="residence-card-top">
              <span className="t-label residence-card-type">{residence.typeLabel}</span>
              <span className="t-caption residence-card-completion">{residence.completion}</span>
            </span>

            <span className="residence-card-id">
              <span className="t-caption residence-card-hash" aria-hidden="true">
                №
              </span>
              <span className="t-h3 residence-card-number">{residence.number}</span>
            </span>

            <span className="t-caption residence-card-place">
              {residence.block} block · {residence.floorLabel || formatFloor(residence.floor)}
            </span>

            <span className="residence-card-figures">
              <span className="t-label residence-card-figure">
                {formatBedrooms(
                  residence.bedrooms,
                  content.bedroomsSuffixOne,
                  content.bedroomsSuffixMany,
                )}
              </span>
              <span className="t-label residence-card-figure">
                {formatArea(residence.interiorSqm)}
              </span>
              <span className="t-label residence-card-figure residence-card-outdoor">
                {formatOutdoor(residence.outdoorSqm)} {residence.outdoorLabel.toLowerCase()}
              </span>
            </span>

            <span className="residence-card-foot">
              {/* Words first: the dot beside them is a second signal, never the only one. */}
              <span className="t-label residence-card-status" data-status={residence.status}>
                <span className="residence-card-dot" aria-hidden="true" />
                {statusLabel(residence.status)}
              </span>
              <span className="t-label residence-card-cta">
                <HoverSlide>{content.cardCtaLabel}</HoverSlide>
              </span>
            </span>
          </span>
        </a>
      </Reveal>
    </li>
  );
}
