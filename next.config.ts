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

  // Security headers - Allow Next.js requirements while maintaining security
  async headers() {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel.app https://vercel.live",
                "style-src 'self' 'unsafe-inline'", 
                "img-src 'self' data: https:",
                "connect-src 'self' https://*.supabase.co https://*.googleapis.com https://accounts.google.com https://*.vercel.app",
                "frame-src 'self' https://accounts.google.com",
                "font-src 'self' data:",
                "object-src 'none'",
                "base-uri 'self'"
              ].join('; ')
            }
          ],
        },
      ];
    }
    return []; // No headers in development
    return []; // No headers in development
  },

  // Development optimizations
  experimental: {
    // Force cache invalidation - empty files removed
    turbo: {}
  },

  // Webpack optimizations
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
