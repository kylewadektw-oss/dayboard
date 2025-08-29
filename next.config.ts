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
    // Completely disable source maps and eval usage
    config.devtool = false;
    
    // Ensure no eval-based optimizations
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: false
      };
    }
    
    return config;
  },
  
  // Security-focused configuration
  trailingSlash: false,
  poweredByHeader: false, // Hide Next.js header
  
  // Add headers to handle CSP appropriately for development vs production
  async headers() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return [
      {
        source: '/(.*)',
        headers: [
          // Development: No CSP restrictions to avoid eval() issues
          // Production: Strict CSP for security
          ...(isDevelopment ? [
            // Development headers - minimal restrictions
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            }
          ] : [
            // Production headers - strict security
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
