import {
  Architecture,
  Hero,
  LoadingScreen,
  Navigation,
  Storytelling,
} from "@cinematic/section-library";

import { architecture, hero, loading, navigation, story } from "../content/site";

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
      </main>
    </>
  );
}
