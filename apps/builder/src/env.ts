import { nextPublicEnvSchema } from "@cinematic/schemas";

export const env = nextPublicEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});
