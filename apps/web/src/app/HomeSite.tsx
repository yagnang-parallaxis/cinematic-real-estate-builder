"use client";

import type { CloneConfig } from "@cinematic/schemas";
import {
  AmenityBrowser,
  Architecture,
  Assurance,
  Concept,
  Contact,
  EnquiryModal,
  Footer,
  HomeOpen,
  Interiors,
  Location,
  LoadingScreen,
  Navigation,
  ResidenceTypes,
  Statement,
  Storytelling,
  type AmenityBrowserContent,
  type ArchitectureContent,
  type ArchRevealContent,
  type AssuranceContent,
  type ConceptContent,
  type ContactContent,
  type EnquiryContent,
  type FooterContent,
  type HeroContent,
  type LoadingContent,
  type InteriorsContent,
  type LocationContent,
  type NavigationContent,
  type ResidenceTypesContent,
  type StatementContent,
  type StoryContent,
  type VistaContent,
  Vista,
} from "@cinematic/section-library";

import { isSectionVisible, useCloneConfig } from "../lib/clone-context";

/**
 * The homepage stack, rendered from a clone config.
 *
 * Every section is a client component already, so composing here rather than in
 * the route lets the preview swap content in place: the config comes from
 * context when the builder has pushed one, and from the server otherwise.
 *
 * Section payloads are opaque in the schema — the builder writes them as JSON —
 * so the section-library types are re-applied at this render boundary.
 */
export function HomeSite({
  serverConfig,
  forceLoader = false,
}: {
  serverConfig: CloneConfig;
  forceLoader?: boolean;
}) {
  const config = useCloneConfig(serverConfig);
  const s = config.sections;
  const visible = (key: Parameters<typeof isSectionVisible>[1]) => isSectionVisible(config, key);

  return (
    <>
      {visible("loading") ? (
        <LoadingScreen content={s.loading as LoadingContent} forceVisible={forceLoader} />
      ) : null}
      {visible("navigation") ? <Navigation content={s.navigation as NavigationContent} /> : null}
      <main id="content">
        {visible("hero") ? (
          <HomeOpen
            hero={s.hero as HeroContent}
            arch={s.arch as ArchRevealContent}
            /*
             * The branded gate is a once-only overlay, not a page chapter. The
             * plate itself only holds the page still until the document has
             * arrived; the gate then plays and leaves.
             */
            curtain={visible("loading") ? (s.loading as LoadingContent) : undefined}
          />
        ) : null}
        {visible("story") ? <Storytelling content={s.story as StoryContent} /> : null}
        {visible("vista") ? <Vista content={s.vista as VistaContent} /> : null}
        {visible("concept") ? <Concept content={s.concept as ConceptContent} /> : null}
        {visible("location") ? <Location content={s.location as LocationContent} /> : null}
        {visible("residenceTypes") ? (
          <ResidenceTypes content={s.residenceTypes as ResidenceTypesContent} />
        ) : null}
        {visible("residenceFigures") ? (
          <Statement content={s.residenceFigures as StatementContent} />
        ) : null}
        {visible("amenityBrowser") ? (
          <AmenityBrowser content={s.amenityBrowser as AmenityBrowserContent} />
        ) : null}
        {visible("interiors") ? <Interiors content={s.interiors as InteriorsContent} /> : null}
        {visible("architecture") ? (
          <Architecture content={s.architecture as ArchitectureContent} />
        ) : null}
        {visible("assurance") ? <Assurance content={s.assurance as AssuranceContent} /> : null}
        {visible("closingView") ? <Statement content={s.closingView as StatementContent} /> : null}
        {visible("contact") ? <Contact content={s.contact as ContactContent} /> : null}
        {visible("footer") ? <Footer content={s.footer as FooterContent} /> : null}
      </main>
      {visible("enquiry") ? <EnquiryModal content={s.enquiry as EnquiryContent} /> : null}
    </>
  );
}
