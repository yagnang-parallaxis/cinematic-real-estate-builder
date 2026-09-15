"use client";

import type { CloneConfig } from "@cinematic/schemas";
import {
  EnquiryModal,
  Footer,
  Navigation,
  ResidenceGrid,
  type EnquiryContent,
  type ResidenceGridContent,
  type ResidenceSort,
} from "@cinematic/section-library";

import { cloneResidences, subpageFooter, subpageNavigation } from "../../lib/clone-chrome";
import { isSectionVisible, useCloneConfig } from "../../lib/clone-context";

export function ResidencesSite({
  serverConfig,
  initialType,
  initialBedrooms,
  initialSort,
}: {
  serverConfig: CloneConfig;
  initialType: string | "all";
  initialBedrooms: number | "all";
  initialSort: ResidenceSort;
}) {
  const config = useCloneConfig(serverConfig);
  const residences = cloneResidences(config);
  const listing = config.residences.listing as Omit<ResidenceGridContent, "residences">;

  return (
    <>
      {isSectionVisible(config, "navigation") ? (
        <Navigation content={subpageNavigation(config)} currentPath="/residences" />
      ) : null}
      <main id="content">
        <ResidenceGrid
          content={{ ...listing, residences }}
          initialType={initialType}
          initialBedrooms={initialBedrooms}
          initialSort={initialSort}
        />
        {isSectionVisible(config, "footer") ? <Footer content={subpageFooter(config)} /> : null}
      </main>
      {isSectionVisible(config, "enquiry") ? (
        <EnquiryModal content={config.sections.enquiry as EnquiryContent} />
      ) : null}
    </>
  );
}
