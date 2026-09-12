import {
  Amenities,
  Architecture,
  Gallery,
  Hero,
  HorizontalGallery,
  LoadingScreen,
  Navigation,
  Residences,
  Storytelling,
} from "@cinematic/section-library";

import {
  amenities,
  architecture,
  gallery,
  hero,
  loading,
  navigation,
  residences,
  story,
  walk,
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
        <Architecture content={architecture} />
        <Amenities content={amenities} />
        <Gallery content={gallery} />
        <HorizontalGallery content={walk} />
        <Residences content={residences} />
      </main>
    </>
  );
}
