import { Parallax } from "../shared/Parallax";
import { Reveal, RevealLines } from "../shared/Reveal";
import { Section } from "../shared/Section";
import { clampLines } from "./logic";
import type { OvertureContent } from "./types";

/**
 * The bridge out of the hero. A brand-tone plate carries an arched window onto
 * the first interior photograph, which gives the page a graphic boundary
 * between the full-bleed hero and the editorial sections that follow.
 */
export function Overture({ content }: { content: OvertureContent }) {
  const lines = clampLines(content.lines);

  return (
    <Section id="overture" tone="brand" clip className="overture" label={lines.join(" ")}>
      <div className="overture-shell">
        <Reveal variant="block" className="t-label overture-eyebrow">
          {content.eyebrow}
        </Reveal>

        <RevealLines lines={lines} as="h2" className="t-h2 overture-heading" stagger={0.09} />

        <div className="overture-arch">
          <Reveal variant="media" className="overture-arch-frame">
            <Parallax role="image" intensity={0.7}>
              <img src={content.imageSrc} alt={content.imageAlt} />
            </Parallax>
          </Reveal>
        </div>

        {content.caption ? (
          <Reveal variant="block" delay={0.1} className="t-label overture-caption">
            {content.caption}
          </Reveal>
        ) : null}
      </div>
    </Section>
  );
}
