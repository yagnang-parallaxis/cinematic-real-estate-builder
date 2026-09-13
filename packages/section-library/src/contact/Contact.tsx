"use client";

import { CircleCta } from "../shared/CircleCta";
import { HoverSlide } from "../shared/HoverSlide";
import { Parallax } from "../shared/Parallax";
import { Reveal, RevealLines } from "../shared/Reveal";
import { Section } from "../shared/Section";
import { useEnquiry } from "../enquiry/EnquiryProvider";
import { clampPin, isExternalChannel, normalizeChannels, normalizeSocials } from "./logic";
import type { ContactContent, ContactSocialNetwork } from "./types";

export type {
  ContactChannel,
  ContactChannelKind,
  ContactContent,
  ContactCta,
  ContactMap,
  ContactPin,
  ContactSocial,
  ContactSocialNetwork,
} from "./types";

function HarborChart() {
  return (
    <svg
      className="contact-chart"
      viewBox="0 0 1600 900"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect className="contact-chart-land" width="1600" height="900" />
      <path
        className="contact-chart-water"
        d="M0 390C210 330 360 250 560 280C760 312 860 430 1040 410C1220 390 1360 300 1600 340V900H0V390Z"
      />
      <path
        className="contact-chart-coast"
        d="M-20 400C200 338 358 256 562 286C758 316 864 436 1042 416C1224 396 1364 306 1620 348"
      />
      <path
        className="contact-chart-path"
        d="M180 790C310 640 470 560 640 500C760 454 840 430 928 378"
      />
      <circle className="contact-chart-node" cx="180" cy="790" r="4" />
      <circle className="contact-chart-yard" cx="928" cy="378" r="14" />
      <text className="contact-chart-label" x="64" y="120">
        Norhavn
      </text>
      <text className="contact-chart-caption" x="64" y="154">
        North Harbour
      </text>
      <text className="contact-chart-caption" x="154" y="830">
        The quay
      </text>
      <g className="contact-chart-compass" transform="translate(1488 110)">
        <circle cx="0" cy="0" r="26" />
        <path d="M0 -16V16M-16 0H16" />
        <text x="0" y="-36">
          N
        </text>
      </g>
    </svg>
  );
}

function SocialMark({ network }: { network: ContactSocialNetwork }) {
  if (network === "linkedin") {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1.5" y="1.5" width="13" height="13" rx="1.2" stroke="currentColor" />
        <path d="M5 12V7M5 5.2V5" stroke="currentColor" strokeLinecap="round" />
        <path d="M8 12V9.2c0-1.2.8-2.2 2-2.2s2 1 2 2.2V12" stroke="currentColor" />
      </svg>
    );
  }

  if (network === "facebook") {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" />
        <path d="M9.4 5.2H8.2c-.6 0-1 .4-1 1V7.4h2l-.3 1.8H7.2V13" stroke="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" rx="3.4" stroke="currentColor" />
      <circle cx="8" cy="8" r="2.6" stroke="currentColor" />
      <circle cx="11.3" cy="4.7" r="0.7" fill="currentColor" />
    </svg>
  );
}

/**
 * Direct-action contact channels, a social row, and an illustrated harbour
 * chart with one pulsing office pin. The enquiry form itself lives in the
 * sitewide modal — the circular CTA only opens it.
 */
export function Contact({ content }: { content: ContactContent }) {
  const { open } = useEnquiry();
  const channels = normalizeChannels(content.channels);
  const socials = normalizeSocials(content.socials);
  const pin = clampPin(content.pin);
  const lines = content.headingLines ?? [content.heading];

  return (
    <Section id="visit" tone="light" label={content.heading} className="contact">
      <div className="section-shell contact-shell">
        <header className="contact-intro section-measure">
          <Reveal variant="block" className="t-label contact-eyebrow">
            {content.eyebrow}
          </Reveal>
          <RevealLines lines={lines} className="t-h2 contact-heading" delay={0.06} />
        </header>

        {channels.length ? (
          <Reveal as="ul" variant="block" stagger={0.06} className="contact-channels">
            {channels.map((channel) => {
              const external = isExternalChannel(channel.kind);

              return (
                <li key={channel.id} className="contact-channel" data-kind={channel.kind}>
                  <p className="t-label contact-channel-label">{channel.label}</p>
                  <a
                    href={channel.href}
                    className="contact-channel-value t-body"
                    target={external ? "_blank" : undefined}
                    rel={external ? "noreferrer" : undefined}
                  >
                    <HoverSlide align="start">
                      {channel.kind === "email" && channel.value.includes("@") ? (
                        <>
                          {channel.value.slice(0, channel.value.indexOf("@") + 1)}
                          <wbr />
                          {channel.value.slice(channel.value.indexOf("@") + 1)}
                        </>
                      ) : (
                        channel.value
                      )}
                    </HoverSlide>
                  </a>
                </li>
              );
            })}
          </Reveal>
        ) : null}

        {socials.length ? (
          <Reveal as="ul" variant="block" stagger={0.05} delay={0.1} className="contact-socials">
            {socials.map((social) => (
              <li key={social.id} className="contact-social">
                <a
                  href={social.href}
                  className="contact-social-link"
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${social.label} (opens in a new tab)`}
                >
                  <SocialMark network={social.network} />
                </a>
              </li>
            ))}
          </Reveal>
        ) : null}

        <div className="contact-map">
          <div className="contact-map-track">
            <div className="contact-map-frame">
              <Parallax role="image" className="contact-map-bed">
                <img src={content.map.src} alt={content.map.alt} className="contact-map-image" />
                <HarborChart />
              </Parallax>

              <div className="contact-pin" style={{ top: `${pin.y}%`, left: `${pin.x}%` }}>
                <span className="contact-pin-dot" />
                <span className="contact-pin-pulse" />
                <span className="contact-pin-pulse contact-pin-pulse-late" />
                <div className="contact-pin-card">
                  <p className="t-label contact-pin-label">{pin.label}</p>
                  <p className="t-caption contact-pin-hours">{pin.hours}</p>
                </div>
              </div>
            </div>
          </div>

          <p className="drag-hint t-label contact-map-hint">{content.dragHint}</p>
        </div>

        <Reveal variant="block" delay={0.08} threshold={0.01} className="contact-action">
          <CircleCta
            label={content.cta.label}
            size="md"
            onClick={() => open(content.cta.source ?? "contact")}
          />
        </Reveal>
      </div>
    </Section>
  );
}
