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
    ],
  },

  // Security headers including environment-aware CSP
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: isDev 
              ? // Development CSP - allows eval() for Next.js dev tools
                "default-src * 'unsafe-eval' 'unsafe-inline' 'unsafe-hashes'; script-src * 'self' 'unsafe-eval' 'unsafe-inline' 'unsafe-hashes' data: blob: https: http: ws: wss: https://accounts.google.com https://accounts.youtube.com https://apis.google.com https://www.google.com https://ssl.gstatic.com https://www.gstatic.com; style-src * 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://www.google.com https://fonts.googleapis.com; img-src * 'self' data: blob: https: http: https://accounts.google.com https://www.google.com; connect-src * 'self' ws: wss: https: http: https://accounts.google.com https://apis.google.com; font-src * 'self' data: https: https://fonts.gstatic.com; frame-src * 'self' https: https://accounts.google.com https://www.google.com; object-src 'none'; base-uri 'self';"
              : // Production CSP - more restrictive, no eval()
                "default-src 'self'; script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com https://www.google.com https://ssl.gstatic.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://accounts.google.com https://www.google.com https://fonts.googleapis.com; img-src 'self' data: blob: https: https://accounts.google.com https://www.google.com; connect-src 'self' https: wss: https://accounts.google.com https://apis.google.com; font-src 'self' data: https: https://fonts.gstatic.com; frame-src 'self' https://accounts.google.com https://www.google.com; object-src 'none'; base-uri 'self';"
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
    ];
  },

  // Development optimizations
  experimental: {
    // Enable other experimental features if needed
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
