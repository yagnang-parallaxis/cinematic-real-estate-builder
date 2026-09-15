import { findResidence } from "@cinematic/section-library";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { cloneResidences } from "../../../lib/clone-chrome";
import { ClonePreviewProvider } from "../../../lib/clone-context";
import { getCloneConfig } from "../../../lib/load-clone";
import { PreviewBridge } from "../../PreviewBridge";
import { ThemeStyleTag } from "../../ThemeStyleTag";
import { ResidenceDetailSite } from "./ResidenceDetailSite";

export async function generateStaticParams() {
  const config = await getCloneConfig();
  return cloneResidences(config).map((residence) => ({ slug: residence.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const config = await getCloneConfig();
  const residence = findResidence(cloneResidences(config), slug);
  const project = config.identity.projectName;

  if (!residence) {
    return { title: `Residence not found — ${project}` };
  }

  return {
    title: `${residence.name} — ${project}`,
    description: `${residence.typeLabel}, ${residence.bedrooms} bedrooms, ${residence.interiorSqm} m² inside and ${residence.outdoorSqm} m² of ${residence.outdoorLabel.toLowerCase()}. ${residence.block} block, ${residence.floorLabel.toLowerCase()}.`,
  };
}

export default async function ResidencePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ clone?: string; preview?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const config = await getCloneConfig(query.clone);

  if (!findResidence(cloneResidences(config), slug)) {
    notFound();
  }

  return (
    <>
      <ThemeStyleTag theme={config.theme} />
      <ClonePreviewProvider serverConfig={config}>
        {query.preview === "1" ? <PreviewBridge /> : null}
        <ResidenceDetailSite serverConfig={config} slug={slug} />
      </ClonePreviewProvider>
    </>
  );
}
