import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // ✅ Allows build to succeed even if there are TS errors
    ignoreBuildErrors: true,
  },
  
};
export default nextConfig;
