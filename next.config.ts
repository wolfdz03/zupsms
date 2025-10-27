import type { NextConfig } from "next";

const nextConfig: NextConfig = {typescript: {
    // ✅ allows production builds to complete even if there are type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // ✅ allows production builds to complete even if there are lint errors
    ignoreDuringBuilds: true,
  },
};
export default nextConfig;
