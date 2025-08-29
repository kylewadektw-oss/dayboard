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
  
  // Disable webpack devtool completely to avoid eval() usage
  webpack: (config, { dev, isServer }) => {
    // Completely disable source maps and eval usage in development
    if (dev) {
      config.devtool = false;
      
      // Disable all eval-based optimizations
      config.optimization = {
        ...config.optimization,
        minimize: false,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
      
      // Ensure no eval in module concatenation
      config.optimization.concatenateModules = false;
    }
    
    return config;
  },
  
  // Security-focused configuration
  trailingSlash: false,
  poweredByHeader: false, // Hide Next.js header
  
  // Add headers to handle CSP appropriately for development vs production
  async headers() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // In development, avoid CSP entirely to prevent eval() issues with dev tools
    if (isDevelopment) {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            },
            // Cache control to prevent stale data issues
            {
              key: 'Cache-Control',
              value: 'no-cache, no-store, must-revalidate'
            },
            {
              key: 'Pragma',
              value: 'no-cache'
            },
            {
              key: 'Expires',
              value: '0'
            },
            // Explicitly allow eval in development for dev tools
            {
              key: 'Content-Security-Policy',
              value: "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'"
            }
          ]
        }
      ];
    }
    
    // Production: Strict CSP for security
    return [
      {
        source: '/(.*)',
        headers: [
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
