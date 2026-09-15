import { nextPublicEnvSchema } from "@cinematic/schemas";

export const env = nextPublicEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  /* Where the previewed site is served from; the iframe points at it. */
  NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL,
});
