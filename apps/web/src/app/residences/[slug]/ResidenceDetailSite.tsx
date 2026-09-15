"use client";

import type { CloneConfig } from "@cinematic/schemas";
import {
  EnquiryModal,
  findResidence,
  Footer,
  Navigation,
  ResidenceDetail,
  similarResidences,
  type EnquiryContent,
  type ResidenceDetailContent,
} from "@cinematic/section-library";

import { residenceDetailLabels } from "../../../content/residences";
import { cloneResidences, subpageFooter, subpageNavigation } from "../../../lib/clone-chrome";
import { isSectionVisible, useCloneConfig } from "../../../lib/clone-context";

export function ResidenceDetailSite({
  serverConfig,
  slug,
}: {
  serverConfig: CloneConfig;
  slug: string;
}) {
  const config = useCloneConfig(serverConfig);
  const residences = cloneResidences(config);

  /* A live preview may not carry this unit yet; the server's copy still does. */
  const residence =
    findResidence(residences, slug) ?? findResidence(cloneResidences(serverConfig), slug);

  if (!residence) {
    return null;
  }

  const content: ResidenceDetailContent = {
    ...residenceDetailLabels,
    crumbs: [
      { label: "Home", href: "/" },
      { label: "Select a residence", href: "/residences" },
      { label: residence.name },
    ],
    residence,
    similar: similarResidences(residences, residence.slug),
  };

  return (
    <>
      {isSectionVisible(config, "navigation") ? (
        <Navigation
          content={subpageNavigation(config)}
          currentPath={`/residences/${residence.slug}`}
        />
      ) : null}
      <main id="content">
        <ResidenceDetail content={content} />
        {isSectionVisible(config, "footer") ? <Footer content={subpageFooter(config)} /> : null}
      </main>
      {isSectionVisible(config, "enquiry") ? (
        <EnquiryModal content={config.sections.enquiry as EnquiryContent} />
      ) : null}
    </>
  );
}
