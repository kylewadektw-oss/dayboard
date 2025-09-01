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

  // Add security headers with permissive CSP for development tools
  async headers() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: isDevelopment 
              ? [
                  // Very permissive for development
                  "default-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data: https:",
                  "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data: https:",
                  "style-src 'self' 'unsafe-inline' https: blob: data:",
                  "img-src 'self' data: https: blob:",
                  "font-src 'self' data: https: blob:",
                  "connect-src 'self' https: wss: ws: blob: data:",
                  "worker-src 'self' blob: data: https:",
                  "child-src 'self' blob: https:",
                  "frame-src 'self' https:",
                  "object-src 'self' blob: data:",
                  "media-src 'self' blob: data: https:",
                ].join('; ')
              : [
                  // Production CSP (more restrictive)
                  "default-src 'self' 'unsafe-eval' 'unsafe-inline'",
                  "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data: https:",
                  "style-src 'self' 'unsafe-inline' https:",
                  "img-src 'self' data: https: blob:",
                  "font-src 'self' data: https:",
                  "connect-src 'self' https: wss: ws: blob: data:",
                  "worker-src 'self' blob: data:",
                  "child-src 'self' blob:",
                  "frame-src 'self'",
                  "object-src 'self'",
                  "media-src 'self' blob: data:",
                ].join('; '),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
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
