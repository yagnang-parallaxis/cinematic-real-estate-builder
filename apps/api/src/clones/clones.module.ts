import { Module } from "@nestjs/common";

import { ClonesController } from "./clones.controller";
import { ClonesService } from "./clones.service";
import { ClonesStore } from "./clones.store";

@Module({
  controllers: [ClonesController],
  providers: [ClonesService, ClonesStore],
})
export class ClonesModule {}
// reload 1789432968
// reload 1789432978
