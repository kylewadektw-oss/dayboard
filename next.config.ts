import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable source maps in production to avoid eval() issues
  productionBrowserSourceMaps: false,
  
  // Configure headers for CSP
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'production' 
              ? [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-inline'", // Remove unsafe-eval in production
                  "style-src 'self' 'unsafe-inline'",
                  "img-src 'self' data: https:",
                  "font-src 'self' data:",
                  "connect-src 'self' https://csbwewirwzeitavhvykr.supabase.co wss://csbwewirwzeitavhvykr.supabase.co https://accounts.google.com https://oauth2.googleapis.com",
                  "frame-src 'self' https://accounts.google.com"
                ].join('; ')
              : [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow eval for development
                  "style-src 'self' 'unsafe-inline'", 
                  "img-src 'self' data: https:",
                  "font-src 'self' data:",
                  "connect-src 'self' https://csbwewirwzeitavhvykr.supabase.co wss://csbwewirwzeitavhvykr.supabase.co https://accounts.google.com https://oauth2.googleapis.com",
                  "frame-src 'self' https://accounts.google.com"
                ].join('; ')
          }
        ]
      }
    ];
  },
  
  // Optimize webpack for production
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Disable eval-based source maps in production
      config.devtool = false;
      // Optimize for production builds
      config.optimization = {
        ...config.optimization,
        minimize: true,
      };
    }
    return config;
  },
  
  // Add trailing slash handling to avoid routing issues
  trailingSlash: false,
  
  // Ensure clean URLs
  async rewrites() {
    return [];
  }
};

export default nextConfig;
