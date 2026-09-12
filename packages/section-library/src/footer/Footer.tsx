"use client";

import { Animated } from "@cinematic/animation-engine";

import { HoverSlide } from "../shared/HoverSlide";
import { BrandMark } from "../shared/BrandMark";
import { currentYear, joinLegalLinks } from "./logic";
import type { FooterContent } from "./types";

export function Footer({ content }: { content: FooterContent }) {
  return (
    <section id="footer" data-nav-tone="on-color" className="footer">
      <div className="footer-cta">
        <img src={content.ctaBackgroundSrc} alt="" className="footer-cta-image" aria-hidden="true" />
        <div className="footer-cta-grade" />
        <div className="footer-cta-copy">
          <Animated type="textReveal" config={{ duration: 0.8 }} className="t-label footer-cta-eyebrow">
            {content.ctaEyebrow}
          </Animated>
          <Animated type="textReveal" as="h2" config={{ duration: 1 }} className="t-display footer-cta-heading">
            <span>
              {content.ctaHeadingLines[0]}
              <br />
            </span>
            <span>{content.ctaHeadingLines[1]}</span>
          </Animated>
          <Animated type="fadeUp" config={{ duration: 0.7, delay: 0.1 }} className="t-h5 footer-cta-subheading">
            {content.ctaSubheading}
          </Animated>
          <Animated type="fadeUp" config={{ duration: 0.6, delay: 0.16 }}>
            <a href={content.ctaAction.href} className="footer-cta-action">
              <HoverSlide>{content.ctaAction.label}</HoverSlide>
            </a>
          </Animated>
        </div>
      </div>

      <div className="footer-base">
        <a href="#hero" className="footer-top-link">
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
          <p className="t-caption footer-copyright">
            © {currentYear()} All rights reserved
          </p>
          <p className="t-caption footer-legal-links" aria-label={joinLegalLinks(content.legalLinks)}>
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
