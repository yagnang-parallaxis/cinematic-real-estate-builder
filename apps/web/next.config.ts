import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  transpilePackages: [
    "@cinematic/animation-engine",
    "@cinematic/schemas",
    "@cinematic/section-library",
    "@cinematic/types",
    "@cinematic/ui",
  ],
};

export default nextConfig;
