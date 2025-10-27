import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Optimize for Netlify
  output: process.env.NETLIFY ? undefined : undefined,
};

export default nextConfig;
