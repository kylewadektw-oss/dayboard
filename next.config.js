/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kyle.wade.ktw@gmail.com)
 * 
 * This file is part of Dayboard, a proprietary household command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: kyle.wade.ktw@gmail.com
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */


/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Auto-detect site URL for deployments with flexible port detection
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 
                         process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                         process.env.NODE_ENV === 'development' ? `http://localhost:${process.env.PORT || 3000}` : '',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 
                         process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                         process.env.NODE_ENV === 'development' ? `http://localhost:${process.env.PORT || 3000}` : '',
  },
  images: {
    domains: [], // Removed Google OAuth profile images domain
  },
  
  // Simplified webpack optimization to avoid conflicts
  webpack: (config, { dev, isServer }) => {
    // Only apply optimizations in production builds
    if (!dev && !isServer) {
      // Optimize bundle splitting for large files without breaking existing config
      if (config.optimization && config.optimization.splitChunks) {
        const existingCacheGroups = config.optimization.splitChunks.cacheGroups || {};
        
        config.optimization.splitChunks.cacheGroups = {
          ...existingCacheGroups,
          // Separate chunk for large logging utilities
          logger: {
            test: /[\\/]utils[\\/]logger\.ts$/,
            name: 'logger',
            chunks: 'all',
            priority: 20,
          },
          // Separate chunk for database types
          dbTypes: {
            test: /[\\/]types_db\.ts$/,
            name: 'db-types', 
            chunks: 'all',
            priority: 20,
          },
        };
      }
    }

    return config;
  },
  
  // Remove experimental CSS optimization that requires 'critters'
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },
  
  // async headers() {
  //   // CSP completely disabled for OAuth debugging
  //   return [];
  // }
}

module.exports = nextConfig
