/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 *
 * Copyright (c) 2025 BentLo Labs LLC (developer@bentlolabs.com)
 *
 * This file is part of Dayboard, a proprietary household command center application.
 *
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 *
 * For licensing inquiries: developer@bentlolabs.com
 *
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Auto-detect site URL for deployments with flexible port detection
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NODE_ENV === 'development'
          ? `http://localhost:${process.env.PORT || 3000}`
          : '',
    NEXT_PUBLIC_BASE_URL:
      process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NODE_ENV === 'development'
          ? `http://localhost:${process.env.PORT || 3000}`
          : ''
  },

  // 🚀 PERFORMANCE: Enhanced image optimization
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365 // 1 year cache
  },

  // 🚀 PERFORMANCE: Optimized webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Development optimizations
    if (dev) {
      config.cache = false;
      // Faster development builds
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false
      };
    }

    // Production optimizations
    if (!dev && !isServer) {
      // Enhanced bundle splitting
      if (config.optimization && config.optimization.splitChunks) {
        const existingCacheGroups =
          config.optimization.splitChunks.cacheGroups || {};

        config.optimization.splitChunks = {
          ...config.optimization.splitChunks,
          chunks: 'all',
          maxInitialRequests: 20,
          maxAsyncRequests: 20,
          cacheGroups: {
            ...existingCacheGroups,
            // 🚀 PERFORMANCE: Vendor libraries splitting
            lucideReact: {
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
              name: 'lucide-react',
              chunks: 'all',
              priority: 30
            },
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              name: 'supabase',
              chunks: 'all',
              priority: 30
            },
            // 🚀 PERFORMANCE: App-specific splitting
            dashboard: {
              test: /[\\/]components[\\/]dashboard[\\/]/,
              name: 'dashboard',
              chunks: 'all',
              priority: 25
            },
            meals: {
              test: /[\\/]components[\\/]meals[\\/]/,
              name: 'meals',
              chunks: 'all',
              priority: 25
            },
            budget: {
              test: /[\\/]components[\\/]budget[\\/]/,
              name: 'budget',
              chunks: 'all',
              priority: 25
            },
            lists: {
              test: /[\\/]components[\\/]lists[\\/]/,
              name: 'lists',
              chunks: 'all',
              priority: 25
            },
            // Large utility files
            logger: {
              test: /[\\/]utils[\\/]logger\.ts$/,
              name: 'logger',
              chunks: 'all',
              priority: 20
            },
            dbTypes: {
              test: /[\\/]types_db\.ts$/,
              name: 'db-types',
              chunks: 'all',
              priority: 20
            },
            performance: {
              test: /[\\/]utils[\\/](performance|buffer-optimization)\.ts$/,
              name: 'performance-utils',
              chunks: 'all',
              priority: 20
            }
          }
        };
      }

      // 🚀 PERFORMANCE: Tree shaking optimizations
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;

      // 🚀 PERFORMANCE: Module concatenation
      config.optimization.concatenateModules = true;
    }

    return config;
  },

  // 🚀 PERFORMANCE: Enhanced experimental features
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@supabase/supabase-js',
      'date-fns',
      'lodash'
    ],
    // Enable modern bundling
    esmExternals: true,
    // Optimize CSS
    optimizeCss: true
  },

  // 🚀 PERFORMANCE: Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn']
          }
        : false
  },

  // 🚀 PERFORMANCE: Output configuration
  output: 'standalone',

  // 🚀 PERFORMANCE: Headers for caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          }
        ]
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
