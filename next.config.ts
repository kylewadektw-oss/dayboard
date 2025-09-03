import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration (replaces experimental.turbo)
  turbopack: {
    resolveAlias: {
      // Reduce bundle analysis time
      canvas: './empty-module.js',
    },
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google avatars
      },
      {
        protocol: 'https',
        hostname: 'www.themealdb.com', // Meal images
      },
    ],
  },

  // Security headers - Completely disable CSP for now
  async headers() {
    return [];
  },

  // Development optimizations
  experimental: {
    // Force cache invalidation - empty files removed
    turbo: {}
  },

  // Webpack optimizations - avoid eval in production
  webpack: (config, { dev, isServer }) => {
    // Force no eval in production
    if (!dev) {
      config.devtool = false;
    }
    
    if (dev && !isServer) {
      // Faster development builds
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            chunks: 'all',
            test: /node_modules/,
            name: 'vendor',
          },
        },
      };
    }
    return config;
  },

  // Disable source maps in production to avoid eval
  productionBrowserSourceMaps: false,
};

export default nextConfig;
