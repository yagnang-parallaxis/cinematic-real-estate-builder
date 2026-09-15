/**
 * Seeds `data/clones/aurelia` from the Aurelia content modules in `apps/web`.
 *
 * The TS content under `apps/web/src/content` is the authoring input for the
 * template only. Once this has run, `apps/web` renders from the clone config,
 * so there is no second runtime content path.
 *
 * Run with:  node --experimental-strip-types scripts/seed-aurelia-clone.mts
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { amenityBrowser } from "../apps/web/src/content/amenity-browser.ts";
import { storyArch } from "../apps/web/src/content/arch.ts";
import { assurance } from "../apps/web/src/content/assurance.ts";
import { concept } from "../apps/web/src/content/concept.ts";
import { contact } from "../apps/web/src/content/contact.ts";
import { enquiry } from "../apps/web/src/content/enquiry.ts";
import { interiors } from "../apps/web/src/content/interiors.ts";
import { location } from "../apps/web/src/content/location.ts";
import { closingView, residenceFigures } from "../apps/web/src/content/passages.ts";
import { residenceGrid, residences } from "../apps/web/src/content/residences.ts";
import {
  architecture,
  footer,
  hero,
  loading,
  navigation,
  residenceTypes,
  story,
} from "../apps/web/src/content/site.ts";
import { vista } from "../apps/web/src/content/vista.ts";
import { assembleClone } from "../apps/web/src/lib/clone-assembly.ts";
/*
 * The schema is read from source rather than from `@cinematic/schemas`: this
 * script runs outside any workspace package, so the built package is not on its
 * resolution path.
 */
import { cloneConfigSchema, cloneMetaSchema } from "../packages/schemas/src/clone-config.ts";

const SLUG = "aurelia";
const HERE = dirname(fileURLToPath(import.meta.url));
const CLONE_DIR = resolve(HERE, "..", "data", "clones", SLUG);

async function existingCreatedAt(path: string): Promise<string | undefined> {
  try {
    const parsed = cloneMetaSchema.partial().parse(JSON.parse(await readFile(path, "utf8")));
    return parsed.createdAt;
  } catch {
    return undefined;
  }
}

const config = cloneConfigSchema.parse(
  assembleClone({
    loading,
    navigation,
    hero,
    arch: storyArch,
    story,
    vista,
    concept,
    location,
    residenceTypes,
    amenityBrowser,
    interiors,
    architecture,
    assurance,
    residenceFigures,
    closingView,
    contact,
    footer,
    enquiry,
    residenceListing: residenceGrid,
    residences,
  }),
);

const metaPath = resolve(CLONE_DIR, "meta.json");
const now = new Date().toISOString();

const meta = cloneMetaSchema.parse({
  name: config.identity.projectName,
  slug: SLUG,
  createdAt: (await existingCreatedAt(metaPath)) ?? now,
  updatedAt: now,
  template: "aurelia",
});

await mkdir(resolve(CLONE_DIR, "assets"), { recursive: true });
await writeFile(metaPath, `${JSON.stringify(meta, null, 2)}\n`, "utf8");
await writeFile(resolve(CLONE_DIR, "config.json"), `${JSON.stringify(config, null, 2)}\n`, "utf8");

console.log(
  `Seeded ${SLUG}: ${Object.keys(config.sections).length} sections, ${config.residences.items.length} residences → ${CLONE_DIR}`,
);
