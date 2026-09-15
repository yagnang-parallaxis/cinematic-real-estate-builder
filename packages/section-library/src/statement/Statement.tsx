import { cn } from "@cinematic/ui";

import { CircleCta } from "../shared/CircleCta";
import { Parallax } from "../shared/Parallax";
import { Reveal, RevealLines } from "../shared/Reveal";
import { Section } from "../shared/Section";
import {
  clampFigures,
  clampStatementLines,
  hasAccents,
  headingClass,
  headingTier,
  isOverMedia,
} from "./logic";
import type { StatementContent } from "./types";

/**
 * The page's editorial punctuation. Between the interactive sections, a single
 * statement is given a full block of its own — as a held sentence, as a claim
 * answered by figures, or as a closing line over a photograph.
 */
export function Statement({ content }: { content: StatementContent }) {
  const lines = clampStatementLines(content.lines);
  const figures = clampFigures(content.figures);
  const overMedia = isOverMedia(content.variant);

  return (
    <Section
      id={content.id}
      tone={content.tone}
      clip
      className={cn("statement", `statement-${content.variant}`)}
      label={lines.join(" ")}
    >
      {overMedia && content.imageSrc ? (
        <div className="statement-bed" aria-hidden="true">
          <Parallax role="image">
            <img src={content.imageSrc} alt="" />
          </Parallax>
          <div className="section-scrim section-scrim-top" />
          <div className="section-scrim section-scrim-centre" />
          <div className="section-scrim section-scrim-bottom" />
        </div>
      ) : null}

      <div className={cn("statement-shell", overMedia && "on-media-text")}>
        {content.eyebrow ? (
          <Reveal variant="block" className="t-label statement-eyebrow">
            {content.eyebrow}
          </Reveal>
        ) : null}

        {hasAccents(content) ? (
          <div className="statement-accents" aria-hidden="true">
            {content.imageSrc ? (
              <Parallax
                role="bed"
                intensity={0.8}
                className="statement-accent statement-accent-l decor-safe"
              >
                <Reveal variant="media">
                  <img src={content.imageSrc} alt="" />
                </Reveal>
              </Parallax>
            ) : null}
            {content.secondaryImageSrc ? (
              <Parallax
                role="accent"
                intensity={0.8}
                className="statement-accent statement-accent-r decor-safe"
              >
                <Reveal variant="media" delay={0.08}>
                  <img src={content.secondaryImageSrc} alt="" />
                </Reveal>
              </Parallax>
            ) : null}
          </div>
        ) : null}

        <RevealLines
          lines={lines}
          as="h2"
          stagger={0.09}
          className={cn(headingClass(content.variant), "statement-heading")}
          fit={headingTier(content.variant)}
        />

        {content.body ? (
          <Reveal variant="block" delay={0.12} className="t-body statement-body">
            {content.body}
          </Reveal>
        ) : null}

        {/*
         * The row is not `statement-figures`: the section already carries that
         * class as its variant, and sharing the name made the section itself a
         * flex row, which broke the heading's measure.
         */}
        {figures.length ? (
          <Reveal variant="block" stagger={0.08} delay={0.14} className="statement-figure-row">
            {figures.map((figure) => (
              <div key={figure.label} className="statement-figure">
                <p className="t-h4 statement-figure-value">{figure.value}</p>
                <p className="t-label statement-figure-label">{figure.label}</p>
              </div>
            ))}
          </Reveal>
        ) : null}

        {content.action ? (
          <Reveal variant="block" delay={0.18} className="statement-action">
            <CircleCta label={content.action.label} href={content.action.href} size="md" />
          </Reveal>
        ) : null}
      </div>
    </Section>
  );
}
