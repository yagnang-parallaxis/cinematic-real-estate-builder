"use client";

import { Animated } from "@cinematic/animation-engine";

import { Reveal } from "../shared/Reveal";
import { hasVistaPlate, vistaCite } from "./logic";
import type { VistaContent } from "./types";

export type { VistaContent } from "./types";

function QuoteMark() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="vista-mark">
      <path
        d="M23.232 30.912C23.232 34.752 20.544 38.208 16.32 38.208C11.328 38.208 5.76 33.984 5.76 22.272C5.76 14.016 9.408 6.144 19.392 6.144C19.968 6.144 23.616 6.336 23.616 7.488C23.616 7.872 23.424 8.64 22.656 8.64C21.888 8.64 20.928 8.256 19.008 8.256C11.904 8.256 8.64 14.4 8.64 20.928C8.64 23.808 9.984 25.536 12.096 25.536C14.016 25.536 14.592 23.808 17.472 23.808C20.736 23.808 23.232 26.88 23.232 30.912ZM43.2 30.912C43.2 34.752 40.512 38.208 36.096 38.208C31.296 38.208 25.536 33.984 25.536 22.272C25.536 14.016 29.376 6.144 39.36 6.144C39.936 6.144 43.584 6.336 43.584 7.488C43.584 7.872 43.392 8.64 42.624 8.64C41.664 8.64 40.704 8.256 38.976 8.256C31.68 8.256 28.608 14.4 28.608 20.928C28.608 23.808 29.952 25.536 32.064 25.536C33.984 25.536 34.56 23.808 37.248 23.808C40.704 23.808 43.2 26.88 43.2 30.912Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Vista({ content }: { content: VistaContent }) {
  if (!hasVistaPlate(content)) {
    return null;
  }

  const cite = vistaCite(content);

  return (
    <section id="vista" data-tone="color" data-nav-tone="on-media" className="vista">
      <div className="vista-stage">
        <Animated
          type="parallax"
          config={{ intensity: 0.28, direction: "up" }}
          className="vista-media"
        >
          <img src={content.imageSrc} alt={content.imageAlt} className="vista-image" />
        </Animated>

        <div className="vista-copy">
          <Reveal variant="block" className="vista-quote">
            <QuoteMark />
            <span className="vista-rule" aria-hidden="true" />
            <blockquote>
              <p className="t-h4 vista-quote-text">{content.quote}</p>
              {cite.length > 0 ? (
                <footer className="vista-cite">
                  {cite.map((line) => (
                    <span key={line} className="t-label">
                      {line}
                    </span>
                  ))}
                </footer>
              ) : null}
            </blockquote>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
