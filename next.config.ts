import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["192.168.1.3", "192.168.1.3:3000"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
