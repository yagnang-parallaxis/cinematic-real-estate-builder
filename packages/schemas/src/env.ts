import type { NodeEnvironment } from "@cinematic/types";
import { z } from "zod";

const nodeEnvValues = [
  "development",
  "test",
  "production",
] as const satisfies readonly NodeEnvironment[];
const nodeEnvSchema = z.enum(nodeEnvValues).default("development");

export const apiEnvSchema = z.object({
  NODE_ENV: nodeEnvSchema,
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  API_HOST: z.string().min(1).default("0.0.0.0"),
  DATABASE_URL: z.string().min(1).optional(),
  REDIS_URL: z.string().min(1).optional(),
  CORS_ORIGINS: z.string().min(1).default("http://localhost:3000,http://localhost:3001"),
  CLONE_DATA_DIR: z
    .string()
    .optional()
    .transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined)),
});

export const nextPublicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:4000"),
  NEXT_PUBLIC_WEB_URL: z.string().url().default("http://localhost:3000"),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;
export type NextPublicEnv = z.infer<typeof nextPublicEnvSchema>;
