import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
} from "@nestjs/common";
import type { Response } from "express";

import { createCloneSchema, ClonesService } from "./clones.service";

@Controller("clones")
export class ClonesController {
  constructor(private readonly clones: ClonesService) {}

  @Get()
  list() {
    return this.clones.list();
  }

  @Post()
  create(@Body() body: unknown) {
    const parsed = createCloneSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: "Invalid clone",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    return this.clones.create(parsed.data);
  }

  @Get(":slug")
  get(@Param("slug") slug: string) {
    return this.clones.get(slug);
  }

  @Put(":slug")
  update(@Param("slug") slug: string, @Body() body: unknown) {
    return this.clones.update(slug, body);
  }

  @Get(":slug/prerequisites")
  prerequisites(@Param("slug") slug: string) {
    return this.clones.prerequisites(slug);
  }

  @Post(":slug/export")
  async export(
    @Param("slug") slug: string,
    @Query("format") format: string | undefined,
    @Res() response: Response,
  ): Promise<void> {
    /* Thrown before anything is written, so the error filter still owns the response. */
    const archive = await this.clones.exportArchive(slug, format ?? "next");

    response.setHeader("Content-Type", "application/zip");
    response.setHeader("Content-Disposition", `attachment; filename="${slug}-site.zip"`);
    archive.pipe(response);
  }
}
