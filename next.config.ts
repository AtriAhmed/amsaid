import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagsapi.com",
        pathname: "/**",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
