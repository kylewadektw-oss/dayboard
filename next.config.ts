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
  
  // Add headers to handle CSP appropriately for development vs production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Only apply strict CSP in production
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
            }
          ] : [
            // Development: More permissive CSP to allow dev tools
            {
              key: 'Content-Security-Policy',
              value: [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow eval in dev
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: https:",
                "font-src 'self' data:",
                "connect-src 'self' https://*.supabase.co wss://*.supabase.co ws://localhost:* http://localhost:*",
                "frame-src 'none'",
                "base-uri 'self'",
                "form-action 'self'"
              ].join('; ')
            }
          ]),
          // Additional security headers
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
