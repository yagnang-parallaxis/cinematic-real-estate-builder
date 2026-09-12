import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  transpilePackages: [
    "@cinematic/animation-engine",
    "@cinematic/schemas",
    "@cinematic/section-library",
    "@cinematic/types",
    "@cinematic/ui",
  ],
};

export default nextConfig;
