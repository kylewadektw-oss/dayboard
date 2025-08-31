import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  swcMinify: true,
  
  // Faster builds in development
  experimental: {
    turbo: {
      resolveAlias: {
        // Reduce bundle analysis time
        canvas: './empty-module.js',
      },
    },
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google avatars
      },
    ],
  },

  // Reduce bundle size
  webpack: (config, { dev, isServer }) => {
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
};

export default nextConfig;
