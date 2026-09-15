import {
  blankCloneFrom,
  cloneConfigSchema,
  evaluatePrerequisites,
  prerequisitesComplete,
  z,
  type CloneConfig,
  type CloneMeta,
  type PrerequisiteItem,
} from "@cinematic/schemas";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from "@nestjs/common";
import type { Archiver } from "archiver";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ClonesStore, EXPORT_TEMPLATE_ROOT, isValidSlug, WEB_PUBLIC_ROOT } from "./clones.store";

const nodeRequire = createRequire(__filename);
const { ZipArchive } = nodeRequire("archiver") as {
  ZipArchive: new (options?: { zlib?: { level?: number } }) => Archiver;
};

export const TEMPLATE_SLUG = "aurelia";

export const createCloneSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be kebab-case"),
  template: z.enum(["aurelia", "blank"]).default("aurelia"),
  brand: z.string().min(1).optional(),
  place: z.string().min(1).optional(),
});

export type CreateCloneInput = z.infer<typeof createCloneSchema>;

export interface CloneSummary {
  meta: CloneMeta;
  prerequisites: { total: number; complete: number; ready: boolean };
}

export const EXPORT_FORMATS = ["next", "static"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

@Injectable()
export class ClonesService {
  constructor(private readonly store: ClonesStore) {}

  async list(): Promise<CloneSummary[]> {
    const slugs = await this.store.listSlugs();
    const summaries: CloneSummary[] = [];

    for (const slug of slugs) {
      const meta = await this.store.readMeta(slug);
      const config = await this.store.readConfig(slug);
      if (!meta || !config) {
        continue;
      }

      const items = evaluatePrerequisites(config);
      summaries.push({
        meta,
        prerequisites: {
          total: items.length,
          complete: items.filter((item) => item.status === "complete").length,
          ready: items.every((item) => item.status === "complete"),
        },
      });
    }

    return summaries;
  }

  async get(slug: string): Promise<{ meta: CloneMeta; config: CloneConfig }> {
    this.assertSlug(slug);

    const meta = await this.store.readMeta(slug);
    const config = await this.store.readConfig(slug);
    if (!meta || !config) {
      throw new NotFoundException(`No clone "${slug}"`);
    }

    return { meta, config };
  }

  async create(input: CreateCloneInput): Promise<{ meta: CloneMeta; config: CloneConfig }> {
    const { name, slug, template } = input;
    this.assertSlug(slug);

    if (await this.store.has(slug)) {
      throw new ConflictException(`Clone "${slug}" already exists`);
    }

    const source = await this.store.readConfig(TEMPLATE_SLUG);
    if (!source) {
      throw new ConflictException(
        `The "${TEMPLATE_SLUG}" template has not been seeded yet — run "pnpm seed:clone"`,
      );
    }

    const brand = input.brand ?? name.split(/\s+/)[0] ?? name;
    const config =
      template === "aurelia"
        ? {
            ...source,
            identity: {
              ...source.identity,
              projectName: name,
              brand,
              place: input.place ?? source.identity.place,
            },
          }
        : blankCloneFrom(source, {
            projectName: name,
            brand,
            place: input.place ?? "",
          });

    const now = new Date().toISOString();
    const meta: CloneMeta = { name, slug, createdAt: now, updatedAt: now, template };

    await this.store.write(slug, meta, config);
    return { meta, config };
  }

  async update(slug: string, body: unknown): Promise<{ meta: CloneMeta; config: CloneConfig }> {
    const { meta } = await this.get(slug);

    const parsed = cloneConfigSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: "Invalid clone config",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const next: CloneMeta = { ...meta, updatedAt: new Date().toISOString() };
    await this.store.write(slug, next, parsed.data);
    return { meta: next, config: parsed.data };
  }

  async prerequisites(slug: string): Promise<{ items: PrerequisiteItem[]; ready: boolean }> {
    const { config } = await this.get(slug);
    return { items: evaluatePrerequisites(config), ready: prerequisitesComplete(config) };
  }

  /**
   * The zip is the deliverable the buyer receives: the validated config, the
   * assets it points at, and the notes for dropping it into the cinematic
   * template. Static export is a phase-2 format and is refused here.
   */
  async exportArchive(slug: string, format: string): Promise<Archiver> {
    if (format !== "next") {
      throw new NotImplementedException(
        `Export format "${format}" is not available yet — use "next"`,
      );
    }

    const { config } = await this.get(slug);
    const items = evaluatePrerequisites(config);
    const missing = items.filter((item) => item.status !== "complete");

    if (missing.length > 0) {
      throw new ConflictException({
        message: "Prerequisites are not complete",
        prerequisites: missing.map((item) => item.id),
      });
    }

    const readme = (await readFile(join(EXPORT_TEMPLATE_ROOT, "README.md"), "utf8")).replaceAll(
      "{{PROJECT_NAME}}",
      config.identity.projectName,
    );
    const pkg = JSON.parse(
      await readFile(join(EXPORT_TEMPLATE_ROOT, "package.json"), "utf8"),
    ) as Record<string, unknown>;
    pkg.name = slug;
    pkg.description = `${config.identity.projectName} — exported from the Cinematic Builder.`;

    const archive = new ZipArchive({ zlib: { level: 9 } });

    archive.append(readme, { name: "README.md" });
    archive.append(`${JSON.stringify(pkg, null, 2)}\n`, { name: "package.json" });
    archive.append(`${JSON.stringify(config, null, 2)}\n`, { name: "site.config.json" });
    /* Files, never symlinks: the buyer unzips this outside the monorepo. */
    archive.directory(WEB_PUBLIC_ROOT, "public");

    if (await this.store.hasAssets(slug)) {
      archive.directory(this.store.assetsDir(slug), "public/assets");
    }

    void archive.finalize();
    return archive;
  }

  private assertSlug(slug: string): void {
    if (!isValidSlug(slug)) {
      throw new BadRequestException(`"${slug}" is not a valid clone slug`);
    }
  }
}
