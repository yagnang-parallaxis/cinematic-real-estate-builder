import {
  Amenities,
  Architecture,
  Footer,
  Hero,
  LoadingScreen,
  Navigation,
  ResidenceTypes,
  Storytelling,
} from "@cinematic/section-library";

import {
  amenities,
  architecture,
  footer,
  hero,
  loading,
  navigation,
  residenceTypes,
  story,
} from "../content/site";

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
        <Hero content={hero} />
        <Storytelling content={story} />
        <ResidenceTypes content={residenceTypes} />
        <Architecture content={architecture} />
        <Amenities content={amenities} />
        <Footer content={footer} />
      </main>
    </>
  );
}
