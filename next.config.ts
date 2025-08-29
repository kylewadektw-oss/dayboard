import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable source maps in production to avoid eval() issues
  productionBrowserSourceMaps: false,
  
  // Configure headers for enhanced CSP and security
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
                  "script-src 'self' 'nonce-' 'strict-dynamic'", // Use nonce for scripts
                  "style-src 'self' 'unsafe-inline'", // Allow inline styles for CSS-in-JS
                  "img-src 'self' data: https:",
                  "font-src 'self' data:",
                  "connect-src 'self' https://csbwewirwzeitavhvykr.supabase.co wss://csbwewirwzeitavhvykr.supabase.co https://accounts.google.com https://oauth2.googleapis.com",
                  "frame-src 'self' https://accounts.google.com",
                  "object-src 'none'", // Prevent Flash/Java plugins
                  "base-uri 'self'", // Prevent base tag hijacking
                  "form-action 'self'", // Restrict form submissions
                  "frame-ancestors 'none'", // Prevent embedding in iframes
                  "upgrade-insecure-requests", // Force HTTPS
                  "block-all-mixed-content" // Block mixed content
                ].join('; ')
              : [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow eval for development
                  "style-src 'self' 'unsafe-inline'", 
                  "img-src 'self' data: https:",
                  "font-src 'self' data:",
                  "connect-src 'self' https://csbwewirwzeitavhvykr.supabase.co wss://csbwewirwzeitavhvykr.supabase.co https://accounts.google.com https://oauth2.googleapis.com",
                  "frame-src 'self' https://accounts.google.com",
                  "object-src 'none'"
                ].join('; ')
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin'
          }
        ]
      }
    ];
  },
  
  // Optimize webpack for production security
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Disable eval-based source maps in production
      config.devtool = false;
      // Optimize for production builds
      config.optimization = {
        ...config.optimization,
        minimize: true,
        // Prevent code splitting for sensitive routes
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            credentials: {
              test: /[\\/]credentials[\\/]/,
              name: 'credentials',
              chunks: 'all',
              priority: 20,
            }
          }
        }
      };
    }
    return config;
  },
  
  // Security-focused configuration
  trailingSlash: false,
  poweredByHeader: false, // Hide Next.js header
  
  // Ensure clean URLs
  async rewrites() {
    return [];
  },
  
  // Environment variable validation
  env: {
    NODE_ENV: process.env.NODE_ENV,
  }
};

export default nextConfig;
