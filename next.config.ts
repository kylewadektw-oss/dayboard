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
    // Remove turbo from experimental (now top-level)
  },

  // Webpack optimizations - ELIMINATE ALL EVAL USAGE
  webpack: (config, { dev, isServer }) => {
    // FORCE no eval in ALL environments
    config.devtool = false;
    
    // Ensure no eval-based transforms
    if (config.optimization) {
      config.optimization.minimize = !dev;
    }
    
    if (dev && !isServer) {
      // Faster development builds without eval
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

  // DISABLE ALL SOURCE MAPS to prevent eval
  productionBrowserSourceMaps: false,
};

export default nextConfig;
