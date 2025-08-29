import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Completely disable source maps to avoid eval() issues
  productionBrowserSourceMaps: false,
  
  // Configure image optimization for external sources
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google avatars
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // GitHub avatars
        port: '',
        pathname: '/**',
      }
    ],
  },
  
  // Disable webpack devtool completely
  webpack: (config, { dev }) => {
    // Always disable eval-based source maps
    config.devtool = false;
    return config;
  },
  
  // Security-focused configuration
  trailingSlash: false,
  poweredByHeader: false, // Hide Next.js header
  
  // Add headers to handle CSP appropriately for development vs production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Only apply CSP in production, minimal headers in development
          ...(process.env.NODE_ENV === 'production' ? [
            {
              key: 'Content-Security-Policy',
              value: [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline'", // Allow inline scripts but not eval
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: https:",
                "font-src 'self' data:",
                "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
                "frame-src 'none'",
                "base-uri 'self'",
                "form-action 'self'"
              ].join('; ')
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
              value: 'strict-origin-when-cross-origin'
            }
          ] : [
            // Development: Only basic security headers, no CSP
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            }
          ])
        ]
      }
    ];
  },
  
  // Ensure clean URLs
  async rewrites() {
    return [];
  }
};

export default nextConfig;
