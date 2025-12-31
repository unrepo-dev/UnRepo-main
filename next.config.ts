import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

export default nextConfig;
