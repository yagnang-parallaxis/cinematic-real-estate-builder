import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ClonesModule } from "./clones/clones.module";
import { loadEnv } from "./config/env";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: (config) => loadEnv(config),
    }),
    ClonesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
