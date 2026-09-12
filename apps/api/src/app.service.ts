import { healthResponseSchema, type HealthResponse } from "@cinematic/schemas";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  health(): HealthResponse {
    return healthResponseSchema.parse({ status: "ok" });
  }
}
