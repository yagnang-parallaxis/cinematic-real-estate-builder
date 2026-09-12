import { Hero, LoadingScreen, Navigation } from "@cinematic/section-library";

import { hero, loading, navigation } from "../content/site";

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
      </main>
    </>
  );
}
