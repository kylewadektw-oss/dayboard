/**
 * 🚀 DAYBOARD PERFORMANCE OPTIMIZATION
 * 
 * Simple Database Optimization Utilities
 * Provides essential caching and performance improvements
 * without complex type conflicts
 */

import { createClient } from '@/utils/supabase/client';

// Simple cache interface
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

// Simple cache implementation
class SimpleCache {
  private cache = new Map<string, CacheEntry>();
  
  set(key: string, data: any, ttl: number = 300000) { // 5 minute default
    // Limit cache size
    if (this.cache.size >= 1000) {
      const firstKey = Array.from(this.cache.keys())[0];
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  clear() {
    this.cache.clear();
  }
  
  invalidatePattern(pattern: string) {
    const keysToDelete: string[] = [];
    for (const key of Array.from(this.cache.keys())) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Simple optimized database client
class SimpleDatabaseClient {
  private client = createClient();
  private queryCache = new SimpleCache();
  
  constructor() {
    // Clean expired cache entries every minute
    if (typeof window !== 'undefined') {
      setInterval(() => {
        const now = Date.now();
        const keysToDelete: string[] = [];
        
        for (const [key, entry] of Array.from(this.queryCache['cache'].entries())) {
          if (now - entry.timestamp > entry.ttl) {
            keysToDelete.push(key);
          }
        }
        
        keysToDelete.forEach(key => this.queryCache['cache'].delete(key));
      }, 60000);
    }
  }
  
  // Cached query method
  async cachedQuery(
    table: string, 
    query: string = '*', 
    options: { cache?: boolean; ttl?: number } = {}
  ) {
    const { cache = true, ttl = 300000 } = options;
    const cacheKey = `${table}:${query}:${JSON.stringify(options)}`;
    
    // Try cache first
    if (cache) {
      const cached = this.queryCache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    try {
      // Execute query
      const { data, error } = await this.client
        .from(table as any)
        .select(query);
      
      const result = { data, error };
      
      // Cache successful results
      if (cache && data && !error) {
        this.queryCache.set(cacheKey, result, ttl);
      }
      
      return result;
    } catch (error) {
      return { data: null, error };
    }
  }
  
  // Get raw client for complex operations
  getRawClient() {
    return this.client;
  }
  
  // Clear cache
  clearCache() {
    this.queryCache.clear();
  }
  
  // Invalidate cache pattern
  invalidateCache(pattern: string) {
    this.queryCache.invalidatePattern(pattern);
  }
}

// Export singleton instance
export const optimizedDb = new SimpleDatabaseClient();
export default optimizedDb;