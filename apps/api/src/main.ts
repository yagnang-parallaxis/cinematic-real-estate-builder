import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { loadEnv } from "./config/env";

async function bootstrap() {
  const env = loadEnv();
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: env.CORS_ORIGINS.split(",").map((origin) => origin.trim()),
    /* The builder reads the export's filename off the download response. */
    exposedHeaders: ["Content-Disposition"],
  });

  await app.listen(env.API_PORT, env.API_HOST);
}

void bootstrap();
