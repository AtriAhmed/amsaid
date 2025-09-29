import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["pdf-parse"],
  images: {
    localPatterns: [
      {
        pathname: "/api/media/**",
      },
      {
        pathname: "/src/assets/**",
      },
    ],
  },
};

export default nextConfig;
