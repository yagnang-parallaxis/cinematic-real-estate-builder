import { apiEnvSchema, type ApiEnv } from "@cinematic/schemas";

export type { ApiEnv };

export function loadEnv(source: Record<string, unknown> = process.env): ApiEnv {
  return apiEnvSchema.parse(source);
}
