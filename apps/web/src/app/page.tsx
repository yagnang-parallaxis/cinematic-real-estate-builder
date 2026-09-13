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
  Vista,
} from "@cinematic/section-library";

import { amenityBrowser } from "../content/amenity-browser";
import { storyArch } from "../content/arch";
import { contact } from "../content/contact";
import { assurance } from "../content/assurance";
import { concept } from "../content/concept";
import { enquiry } from "../content/enquiry";
import { interiors } from "../content/interiors";
import { location } from "../content/location";
import { closingView, residenceFigures } from "../content/passages";
import {
  architecture,
  footer,
  hero,
  loading,
  navigation,
  residenceTypes,
  story,
} from "../content/site";
import { vista } from "../content/vista";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ loader?: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      <LoadingScreen content={loading} forceVisible={params.loader === "1"} />
      <Navigation content={navigation} />
      <main id="content">
        <HomeOpen hero={hero} arch={storyArch} />
        <Storytelling content={story} />
        <Vista content={vista} />
        <Concept content={concept} />
        <Location content={location} />
        <ResidenceTypes content={residenceTypes} />
        <Statement content={residenceFigures} />
        <AmenityBrowser content={amenityBrowser} />
        <Interiors content={interiors} />
        <Architecture content={architecture} />
        <Assurance content={assurance} />
        <Statement content={closingView} />
        <Contact content={contact} />
        <Footer content={footer} />
      </main>
      <EnquiryModal content={enquiry} />
    </>
  );
}
