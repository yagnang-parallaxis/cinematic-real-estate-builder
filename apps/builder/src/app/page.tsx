import { PACKAGE_NAME as sectionLibrary } from "@cinematic/section-library";
import { PACKAGE_NAME as typesPackage } from "@cinematic/types";
import { Button } from "@cinematic/ui";

import { env } from "../env";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6">
      <p className="text-muted-foreground text-sm uppercase tracking-[0.2em]">Builder</p>
      <h1 className="text-4xl font-semibold tracking-tight">Cinematic Builder</h1>
      <p className="text-muted-foreground">
        Visual builder scaffold. Workspace packages are wired; authoring features are not
        implemented yet.
      </p>
      <p className="text-muted-foreground text-sm">API origin: {env.NEXT_PUBLIC_API_URL}</p>
      <ul className="text-muted-foreground space-y-1 text-sm">
        <li>{typesPackage}</li>
        <li>{sectionLibrary}</li>
      </ul>
      <Button type="button" variant="secondary">
        Scaffold ready
      </Button>
    </main>
  );
}
