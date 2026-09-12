"use client";

import { Animated } from "@cinematic/animation-engine";
import { useMemo, useState } from "react";

export type ResidenceStatus = "Available" | "Reserved" | "Sold";

export interface ResidenceCard {
  id: string;
  name: string;
  type: string;
  bedrooms: number;
  area: string;
  outdoor?: string;
  status: ResidenceStatus;
  imageSrc: string;
  imageAlt: string;
}

export interface ResidencesContent {
  eyebrow: string;
  heading: string;
  empty: string;
  residences: ResidenceCard[];
}

export function Residences({ content }: { content: ResidencesContent }) {
  const types = useMemo(
    () => ["All", ...new Set(content.residences.map((item) => item.type))],
    [content.residences],
  );
  const [filter, setFilter] = useState("All");
  const visible =
    filter === "All"
      ? content.residences
      : content.residences.filter((item) => item.type === filter);

  return (
    <section id="residences" className="mx-auto max-w-6xl px-6 py-24 md:px-10">
      <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl space-y-4">
          <Animated type="textReveal" className="t-label text-primary">
            {content.eyebrow}
          </Animated>
          <Animated type="textReveal" as="h2" className="t-h1">
            {content.heading}
          </Animated>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <label className="t-caption text-muted-foreground flex items-center gap-3">
            Type
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="t-label bg-background border-border text-foreground border px-3 py-2"
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <p className="t-caption text-muted-foreground" aria-live="polite">
            {visible.length} {visible.length === 1 ? "residence" : "residences"}
          </p>
        </div>
      </div>
      {visible.length === 0 ? (
        <p className="t-body text-muted-foreground">{content.empty}</p>
      ) : (
        <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <li key={item.id}>
              <article className="group flex flex-col gap-4">
                <div className="overflow-hidden">
                  <img
                    src={item.imageSrc}
                    alt={item.imageAlt}
                    className="aspect-4/3 w-full object-cover transition-transform duration-700 lg:group-hover:scale-[1.02]"
                  />
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="t-label text-primary">{item.name}</p>
                    <h3 className="t-h4 mt-2">{item.type}</h3>
                  </div>
                  <p className="t-caption text-muted-foreground">{item.status}</p>
                </div>
                <dl className="t-caption text-muted-foreground grid grid-cols-2 gap-2">
                  <div>
                    <dt className="sr-only">Bedrooms</dt>
                    <dd>{item.bedrooms} bedrooms</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Interior area</dt>
                    <dd>{item.area}</dd>
                  </div>
                  {item.outdoor ? (
                    <div className="col-span-2">
                      <dt className="sr-only">Outdoor area</dt>
                      <dd>{item.outdoor}</dd>
                    </div>
                  ) : null}
                </dl>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
