import {
  bedroomOptions,
  parseBedroomsParam,
  parseSortParam,
  parseTypeParam,
  typeOptions,
} from "@cinematic/section-library";
import type { Metadata } from "next";

import { cloneResidences } from "../../lib/clone-chrome";
import { ClonePreviewProvider } from "../../lib/clone-context";
import { getCloneConfig } from "../../lib/load-clone";
import { PreviewBridge } from "../PreviewBridge";
import { ThemeStyleTag } from "../ThemeStyleTag";
import { ResidencesSite } from "./ResidencesSite";

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
    clone?: string;
    preview?: string;
  }>;
}) {
  const params = await searchParams;
  const config = await getCloneConfig(params.clone);
  const residences = cloneResidences(config);

  /*
   * The filters are resolved on the server against what the inventory actually
   * holds, so a link from the homepage ("/residences?type=garden") arrives
   * already filtered and a stale link falls back to the full listing.
   */
  const knownTypes = typeOptions(residences).map((type) => type.id);
  const knownBedrooms = bedroomOptions(residences);

  return (
    <>
      <ThemeStyleTag theme={config.theme} />
      <ClonePreviewProvider serverConfig={config}>
        {params.preview === "1" ? <PreviewBridge /> : null}
        <ResidencesSite
          serverConfig={config}
          initialType={parseTypeParam(params.type, knownTypes)}
          initialBedrooms={parseBedroomsParam(params.bedrooms, knownBedrooms)}
          initialSort={parseSortParam(params.sort)}
        />
      </ClonePreviewProvider>
    </>
  );
}
