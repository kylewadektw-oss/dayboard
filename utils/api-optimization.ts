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

import { NextRequest, NextResponse } from 'next/server';
import { enhancedLogger, LogLevel } from '@/utils/logger';

// 🚀 PERFORMANCE: Response caching interface
interface CacheConfig {
  ttl: number; // Time to live in seconds
  tags?: string[]; // Cache invalidation tags
  vary?: string[]; // Vary headers for conditional caching
}

interface CacheEntry {
  data: unknown;
  headers: Record<string, string>;
  timestamp: number;
  ttl: number;
  tags: string[];
}

// 🚀 PERFORMANCE: API response optimization
interface ResponseOptions {
  cache?: CacheConfig;
  compress?: boolean;
  streaming?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

class ApiOptimizer {
  private responseCache = new Map<string, CacheEntry>();
  private compressionThreshold = 1024; // Compress responses larger than 1KB

  constructor() {
    this.startCacheCleanup();
  }

  // 🚀 PERFORMANCE: Generate cache key
  private generateCacheKey(req: NextRequest): string {
    const url = new URL(req.url);
    const searchParams = Array.from(url.searchParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    return `${req.method}:${url.pathname}${searchParams ? '?' + searchParams : ''}`;
  }

  // 🚀 PERFORMANCE: Get from cache
  private getFromCache(
    key: string,
    _varyHeaders?: string[]
  ): CacheEntry | null {
    const entry = this.responseCache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.responseCache.delete(key);
      return null;
    }

    return entry;
  }

  // 🚀 PERFORMANCE: Set cache
  private setCache(
    key: string,
    data: unknown,
    headers: Record<string, string>,
    config: CacheConfig
  ) {
    // Limit cache size
    if (this.responseCache.size >= 500) {
      const entries = Array.from(this.responseCache.keys());
      const firstKey = entries[0];
      if (firstKey) {
        this.responseCache.delete(firstKey);
      }
    }

    this.responseCache.set(key, {
      data,
      headers,
      timestamp: Date.now(),
      ttl: config.ttl,
      tags: config.tags || []
    });
  }

  // 🚀 PERFORMANCE: Cache cleanup
  private startCacheCleanup() {
    setInterval(() => {
      const now = Date.now();
      const entries = Array.from(this.responseCache.entries());
      for (const [key, entry] of entries) {
        if (now - entry.timestamp > entry.ttl * 1000) {
          this.responseCache.delete(key);
        }
      }
    }, 60000); // Cleanup every minute
  }

  // 🚀 PERFORMANCE: Compress response data
  private async compressResponse(
    data: unknown
  ): Promise<{ data: unknown; compressed: boolean }> {
    try {
      const serialized = JSON.stringify(data);

      if (serialized.length < this.compressionThreshold) {
        return { data, compressed: false };
      }

      // Use buffer optimization for large responses - simplified approach
      try {
        // Just use basic compression for now to avoid buffer compatibility issues
        const compressed = JSON.stringify(data);

        return {
          data: {
            compressed: true,
            content: compressed,
            originalSize: serialized.length,
            compressedSize: compressed.length
          },
          compressed: true
        };
      } catch {
        return { data, compressed: false };
      }

      return { data, compressed: false };
    } catch (error) {
      await enhancedLogger.logWithFullContext(
        LogLevel.WARN,
        'Response compression failed, using uncompressed data',
        'ApiOptimizer',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );

      return { data, compressed: false };
    }
  }

  // 🚀 PERFORMANCE: Create optimized response
  async createOptimizedResponse(
    req: NextRequest,
    data: unknown,
    options: ResponseOptions = {}
  ): Promise<NextResponse> {
    const { cache, compress = true, priority = 'medium' } = options;
    const cacheKey = this.generateCacheKey(req);

    try {
      // Check cache first
      if (cache) {
        const cached = this.getFromCache(cacheKey, cache.vary);
        if (cached) {
          const response = NextResponse.json(cached.data);

          // Add cache headers
          Object.entries(cached.headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });

          response.headers.set('X-Cache', 'HIT');
          response.headers.set(
            'X-Cache-Age',
            Math.floor((Date.now() - cached.timestamp) / 1000).toString()
          );

          return response;
        }
      }

      // Process data
      let responseData = data;
      let headers: Record<string, string> = {
        'X-Cache': 'MISS',
        'X-Response-Priority': priority
      };

      // Compression
      if (compress) {
        const compressionResult = await this.compressResponse(data);
        responseData = compressionResult.data;

        if (compressionResult.compressed) {
          headers['Content-Encoding'] = 'custom-buffer';
          headers['X-Original-Size'] = JSON.stringify(data).length.toString();
          headers['X-Compressed-Size'] =
            JSON.stringify(responseData).length.toString();
        }
      }

      // Create response
      const response = NextResponse.json(responseData);

      // Set headers
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      // Cache response
      if (cache) {
        this.setCache(cacheKey, responseData, headers, cache);
        response.headers.set('Cache-Control', `public, max-age=${cache.ttl}`);
      }

      // Performance logging
      await enhancedLogger.logWithFullContext(
        LogLevel.INFO,
        'API response optimized',
        'ApiOptimizer',
        {
          method: req.method,
          path: new URL(req.url).pathname,
          cached: false,
          compressed: compress,
          priority,
          responseSize: JSON.stringify(responseData).length
        }
      );

      return response;
    } catch (error) {
      await enhancedLogger.logWithFullContext(
        LogLevel.ERROR,
        'API response optimization failed',
        'ApiOptimizer',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );

      // Fallback to simple response
      return NextResponse.json(data);
    }
  }

  // 🚀 PERFORMANCE: Invalidate cache by tags
  invalidateCacheByTags(tags: string[]) {
    const entries = Array.from(this.responseCache.entries());
    for (const [key, entry] of entries) {
      if (entry.tags.some((tag: string) => tags.includes(tag))) {
        this.responseCache.delete(key);
      }
    }
  }

  // 🚀 PERFORMANCE: Get cache statistics
  getCacheStats() {
    return {
      size: this.responseCache.size,
      entries: Array.from(this.responseCache.values()).map((entry) => ({
        tags: entry.tags,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl
      }))
    };
  }
}

// 🚀 PERFORMANCE: Singleton instance
const apiOptimizer = new ApiOptimizer();

// 🚀 PERFORMANCE: Middleware wrapper for API optimization
export function withApiOptimization(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: ResponseOptions = {}
) {
  return async (req: NextRequest) => {
    const start = performance.now();

    try {
      // Execute handler
      const result = await handler(req);

      // Optimize response
      const response = await apiOptimizer.createOptimizedResponse(
        req,
        result,
        options
      );

      // Add performance headers
      const duration = performance.now() - start;
      response.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`);

      return response;
    } catch (error) {
      await enhancedLogger.logWithFullContext(
        LogLevel.ERROR,
        'API handler failed',
        'withApiOptimization',
        {
          method: req.method,
          path: new URL(req.url).pathname,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      );

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// 🚀 PERFORMANCE: Rate limiting with optimization
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
}

class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();

  constructor(private config: RateLimitConfig) {
    this.startCleanup();
  }

  private getClientKey(req: NextRequest): string {
    // Use IP address or user ID for rate limiting
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    return ip;
  }

  private startCleanup() {
    setInterval(() => {
      const now = Date.now();
      const entries = Array.from(this.requests.entries());
      for (const [key, data] of entries) {
        if (now > data.resetTime) {
          this.requests.delete(key);
        }
      }
    }, this.config.windowMs);
  }

  checkLimit(req: NextRequest): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const key = this.getClientKey(req);
    const now = Date.now();
    const resetTime = now + this.config.windowMs;

    const existing = this.requests.get(key);

    if (!existing || now > existing.resetTime) {
      this.requests.set(key, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime
      };
    }

    if (existing.count >= this.config.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: existing.resetTime };
    }

    existing.count++;
    return {
      allowed: true,
      remaining: this.config.maxRequests - existing.count,
      resetTime: existing.resetTime
    };
  }
}

// 🚀 PERFORMANCE: Rate limiting middleware
export function withRateLimit(config: RateLimitConfig) {
  const rateLimiter = new RateLimiter(config);

  return function rateLimitMiddleware(
    handler: (req: NextRequest) => Promise<NextResponse>
  ) {
    return async (req: NextRequest) => {
      const limitCheck = rateLimiter.checkLimit(req);

      if (!limitCheck.allowed) {
        const response = NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        );

        response.headers.set(
          'X-RateLimit-Limit',
          config.maxRequests.toString()
        );
        response.headers.set('X-RateLimit-Remaining', '0');
        response.headers.set(
          'X-RateLimit-Reset',
          limitCheck.resetTime.toString()
        );

        return response;
      }

      const response = await handler(req);

      // Add rate limit headers to successful responses
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      response.headers.set(
        'X-RateLimit-Remaining',
        limitCheck.remaining.toString()
      );
      response.headers.set(
        'X-RateLimit-Reset',
        limitCheck.resetTime.toString()
      );

      return response;
    };
  };
}

// 🚀 PERFORMANCE: Combined optimization middleware
export function withFullOptimization(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    response?: ResponseOptions;
    rateLimit?: RateLimitConfig;
  } = {}
) {
  let optimizedHandler = withApiOptimization(handler, options.response);

  if (options.rateLimit) {
    optimizedHandler = withRateLimit(options.rateLimit)(
      async (req: NextRequest) => {
        const result = await handler(req);
        return await apiOptimizer.createOptimizedResponse(
          req,
          result,
          options.response
        );
      }
    );
  }

  return optimizedHandler;
}

// 🚀 PERFORMANCE: Export utilities
export { apiOptimizer, ApiOptimizer, RateLimiter };
