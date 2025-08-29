import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Completely disable source maps to avoid eval() issues
  productionBrowserSourceMaps: false,
  
  // Disable webpack devtool completely
  webpack: (config, { dev }) => {
    // Always disable eval-based source maps
    config.devtool = false;
    return config;
  },
  
  // Security-focused configuration
  trailingSlash: false,
  poweredByHeader: false, // Hide Next.js header
  
  // Ensure clean URLs
  async rewrites() {
    return [];
  }
};

export default nextConfig;
