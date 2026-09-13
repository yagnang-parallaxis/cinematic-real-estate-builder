import {
  bedroomOptions,
  EnquiryModal,
  Footer,
  Navigation,
  parseBedroomsParam,
  parseSortParam,
  parseTypeParam,
  ResidenceGrid,
  typeOptions,
} from "@cinematic/section-library";
import type { Metadata } from "next";

import { enquiry } from "../../content/enquiry";
import { residenceGrid, residences } from "../../content/residences";
import { subpageFooter, subpageNavigation } from "../../content/site";

export const metadata: Metadata = {
  title: "Select a residence — Aurelia Residences",
  description:
    "Eighteen homes above a quiet northern harbour: six garden residences, eight over the quay, and four under the roof.",
};

export default async function ResidencesPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string | string[];
    bedrooms?: string | string[];
    sort?: string | string[];
  }>;
}) {
  const params = await searchParams;

  /*
   * The filters are resolved on the server against what the inventory actually
   * holds, so a link from the homepage ("/residences?type=garden") arrives
   * already filtered and a stale link falls back to the full listing.
   */
  const knownTypes = typeOptions(residences).map((type) => type.id);
  const knownBedrooms = bedroomOptions(residences);

  return (
    <>
      <Navigation content={subpageNavigation} currentPath="/residences" />
      <main id="content">
        <ResidenceGrid
          content={{ ...residenceGrid, residences }}
          initialType={parseTypeParam(params.type, knownTypes)}
          initialBedrooms={parseBedroomsParam(params.bedrooms, knownBedrooms)}
          initialSort={parseSortParam(params.sort)}
        />
        <Footer content={subpageFooter} />
      </main>
      <EnquiryModal content={enquiry} />
    </>
  );
}
