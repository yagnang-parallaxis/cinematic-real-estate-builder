"use client";

import { HoverSlide } from "../shared/HoverSlide";
import { Reveal, RevealLines } from "../shared/Reveal";
import { Section } from "../shared/Section";
import { isExternalChannel, normalizeChannels, normalizeSocials } from "./logic";
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
 * Direct-action contact channels and a social row. The harbour chart and
 * circular CTA were retired — the enquiry form still lives in the sitewide modal.
 */
export function Contact({ content }: { content: ContactContent }) {
  const channels = normalizeChannels(content.channels);
  const socials = normalizeSocials(content.socials);
  const lines = content.headingLines ?? [content.heading];

  return (
    <Section id="visit" tone="light" label={content.heading} className="contact">
      <div className="section-shell contact-shell">
        <header className="contact-intro section-measure">
          <Reveal variant="block" className="t-label contact-eyebrow">
            {content.eyebrow}
          </Reveal>
          <RevealLines lines={lines} className="t-h2 contact-heading" delay={0.06} fit="h2" />
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
      </div>
    </Section>
  );
}
