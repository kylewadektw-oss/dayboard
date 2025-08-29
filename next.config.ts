import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable source maps in production to avoid eval() issues
  productionBrowserSourceMaps: false,
  
  // Headers temporarily disabled for development
  // async headers() {
  //   return [];
  // },
  
  // Optimize webpack for production security
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Disable eval-based source maps in production
      config.devtool = false;
    }
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
