"use client";

import { type CSSProperties } from "react";

import { useFitText } from "../shared/useFitText";
import { lockupChars } from "./logic";

/**
 * The brand lockup: the wordmark a line at a time, with the place script
 * hanging off its last baseline.
 *
 * Shared by the hero and the opening curtain so the two are one drawing rather
 * than two that have to agree. Only the hero's is the document's heading — the
 * curtain's is the same lettering used as a plate, so it takes a paragraph and
 * the page keeps exactly one `h1`.
 *
 * @param titled  Whether this instance is the document heading.
 */
export function Lockup({
  lines,
  place,
  titled = true,
}: {
  lines: string[];
  place?: string;
  titled?: boolean;
}) {
  const Wordmark = titled ? "h1" : "p";
  const leadLine = lines[0] ?? "";
  const cascadeChars = lockupChars(lines[1] ?? "");
  /*
   * The lockup aspires to the full display tier and is pulled back only as far
   * as the name needs, so the wordmark spans the measure at every width.
   */
  const [lockupRef, fit, fitReady] = useFitText<HTMLDivElement>(
    ".hero-title-line-inner, .hero-title-cascade",
    lines.join("|"),
  );

  return (
    <div
      ref={lockupRef}
      className="hero-lockup"
      data-fit-ready={fitReady ? "true" : undefined}
      style={{ "--hero-fit": fit } as CSSProperties}
    >
      <Wordmark className="t-display hero-title">
        <span className="hero-title-line">
          <span className="hero-title-line-inner">{leadLine}</span>
        </span>
        {cascadeChars.length > 0 ? (
          <span className="hero-title-line hero-title-cascade">
            {cascadeChars.map((glyph, index) => (
              <span
                key={`${glyph}-${index}`}
                className="hero-title-char"
                style={{ "--char": index } as CSSProperties}
              >
                {glyph === " " ? "\u00a0" : glyph}
              </span>
            ))}
          </span>
        ) : null}
      </Wordmark>
      {place ? <p className="hero-place">{place}</p> : null}
    </div>
  );
}
