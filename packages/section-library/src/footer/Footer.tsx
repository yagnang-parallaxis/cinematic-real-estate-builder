"use client";

import { HoverSlide } from "../shared/HoverSlide";
import { BrandMark } from "../shared/BrandMark";
import { currentYear, joinLegalLinks } from "./logic";
import type { FooterContent } from "./types";

export function Footer({ content }: { content: FooterContent }) {
  return (
    <section id="footer" data-tone="dark" data-nav-tone="on-dark" className="footer">
      <div className="footer-base">
        <a href={content.topHref ?? "#hero"} className="footer-top-link">
          <HoverSlide>To top</HoverSlide>
        </a>

        <div className="footer-columns">
          <div className="footer-column">
            <h3 className="t-label footer-column-title">Talk to us</h3>
            <a href={content.phoneHref} className="footer-link t-h5">
              <HoverSlide>{content.phone}</HoverSlide>
            </a>
          </div>

          <div className="footer-column">
            <h3 className="t-label footer-column-title">{content.officeLabel}</h3>
            <a href={content.officeMapHref} className="footer-link t-body">
              <HoverSlide>{content.officeAddress}</HoverSlide>
            </a>
          </div>
        </div>

        <div className="footer-legal">
          <p className="t-label footer-brand">{content.brand}</p>
          <p className="t-caption footer-copyright">© {currentYear()} All rights reserved</p>
          <p
            className="t-caption footer-legal-links"
            aria-label={joinLegalLinks(content.legalLinks)}
          >
            {content.legalLinks.map((link, index) => (
              <span key={`${link.label}-${index}`}>
                <a href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
                {index < content.legalLinks.length - 1 ? ", " : null}
              </span>
            ))}
          </p>
        </div>

        <div className="footer-mark">
          <BrandMark className="footer-mark-icon" />
          {content.credit ? (
            <p className="t-caption footer-credit">
              Made by{" "}
              <a href={content.credit.href} target="_blank" rel="noreferrer">
                {content.credit.label}
              </a>
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
