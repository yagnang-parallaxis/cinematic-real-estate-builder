import { LoadingScreen, Navigation } from "@cinematic/section-library";

import { loading, navigation } from "../content/site";

const roles = [
  {
    role: "Label",
    className: "t-label",
    sample: "Aurelia Residences",
  },
  {
    role: "Display",
    className: "t-display",
    sample: "Quiet rooms above the water.",
  },
  {
    role: "Heading 1",
    className: "t-h1",
    sample: "A coastal house, edited slowly.",
  },
  {
    role: "Lead",
    className: "t-lead text-muted-foreground",
    sample:
      "Eighteen residences on a narrow harbor plot. Stone, timber, and long rooms that hold the afternoon.",
  },
] as const;

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
      <main
        id="content"
        className="mx-auto flex min-h-[160vh] max-w-5xl flex-col gap-12 px-6 pb-24 pt-28 md:px-12"
      >
        <header className="max-w-2xl space-y-4">
          <p className="t-label text-primary">Prototype</p>
          <h1 className="t-h1">Aurelia, a public-site draft.</h1>
        </header>
        <ol className="space-y-10">
          {roles.map((item) => (
            <li
              key={item.role}
              className="border-border grid gap-3 border-t pt-6 md:grid-cols-[8rem_1fr]"
            >
              <p className="t-caption text-muted-foreground">{item.role}</p>
              <p className={item.className}>{item.sample}</p>
            </li>
          ))}
        </ol>
      </main>
    </>
  );
}
