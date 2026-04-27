import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.yildiztenis.com",
      },
    ],
  },
};

export default nextConfig;
