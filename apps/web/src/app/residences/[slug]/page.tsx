import {
  EnquiryModal,
  findResidence,
  Footer,
  Navigation,
  ResidenceDetail,
  similarResidences,
  type ResidenceDetailContent,
} from "@cinematic/section-library";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { enquiry } from "../../../content/enquiry";
import { residenceDetailLabels, residences } from "../../../content/residences";
import { subpageFooter, subpageNavigation } from "../../../content/site";

export function generateStaticParams() {
  return residences.map((residence) => ({ slug: residence.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const residence = findResidence(residences, slug);

  if (!residence) {
    return { title: "Residence not found — Aurelia Residences" };
  }

  return {
    title: `${residence.name} — Aurelia Residences`,
    description: `${residence.typeLabel}, ${residence.bedrooms} bedrooms, ${residence.interiorSqm} m² inside and ${residence.outdoorSqm} m² of ${residence.outdoorLabel.toLowerCase()}. ${residence.block} block, ${residence.floorLabel.toLowerCase()}.`,
  };
}

export default async function ResidencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const residence = findResidence(residences, slug);

  if (!residence) {
    notFound();
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
      <Navigation content={subpageNavigation} currentPath={`/residences/${residence.slug}`} />
      <main id="content">
        <ResidenceDetail content={content} />
        <Footer content={subpageFooter} />
      </main>
      <EnquiryModal content={enquiry} />
    </>
  );
}
