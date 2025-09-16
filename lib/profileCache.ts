/**
 * Dayboard - Family Management Platform
 * 
 * © 2025 BentLo Labs LLC. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This source code is the proprietary and confidential property of BentLo Labs LLC.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * @company BentLo Labs LLC
 * @product Dayboard
 * @license Proprietary
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// Generic types - adjust based on your actual profile structure
interface Profile {
  id: string;
  user_id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  household_id?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown; // Allow additional fields
}

type Supabase = SupabaseClient;

interface CachedProfile {
  data: Profile;
  timestamp: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  evictions: number;
}

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 1000;

// Cache storage and statistics
const profileCache = new Map<string, CachedProfile>();
let cacheStats: CacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  evictions: 0
};

/**
 * Get a cached profile by user ID
 */
export function getCachedProfile(userId: string): Profile | null {
  if (!userId) return null;
  
  const cached = profileCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    cacheStats.hits++;
    return cached.data;
  }
  
  // Remove expired entry
  if (cached) {
    profileCache.delete(userId);
  }
  
  cacheStats.misses++;
  return null;
}

/**
 * Cache a profile
 */
export function setCachedProfile(userId: string, data: Profile): void {
  if (!userId || !data) return;
  
  profileCache.set(userId, {
    data,
    timestamp: Date.now()
  });
  
  cacheStats.sets++;
  
  // Clean up if cache is getting large
  if (profileCache.size > MAX_CACHE_SIZE) {
    cleanupCache();
  }
}

/**
 * Get profile with automatic caching
 */
export async function getProfile(userId: string, supabase: Supabase): Promise<Profile | null> {
  if (!userId || !supabase) return null;
  
  // Try cache first
  const cached = getCachedProfile(userId);
  if (cached) {
    return cached;
  }
  
  // Fetch from database
  const startTime = Date.now();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  const queryTime = Date.now() - startTime;
  
  // Log slow queries
  if (queryTime > 100) {
    console.warn(`Slow profile query: ${queryTime}ms for user ${userId}`);
  }
  
  if (data && !error) {
    setCachedProfile(userId, data);
    return data;
  }
  
  if (error && error.code !== 'PGRST116') { // Ignore "not found" errors
    console.error('Profile query error:', error.message);
  }
  
  return null;
}

/**
 * Get multiple profiles with batch optimization
 */
export async function getProfiles(userIds: string[], supabase: Supabase): Promise<Profile[]> {
  if (!userIds?.length || !supabase) return [];
  
  const profiles: Profile[] = [];
  const uncachedIds: string[] = [];
  
  // Check cache for each user
  for (const userId of userIds) {
    const cached = getCachedProfile(userId);
    if (cached) {
      profiles.push(cached);
    } else {
      uncachedIds.push(userId);
    }
  }
  
  // Fetch uncached profiles in batch
  if (uncachedIds.length > 0) {
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('user_id', uncachedIds);
    
    const queryTime = Date.now() - startTime;
    
    if (queryTime > 200) {
      console.warn(`Slow batch profile query: ${queryTime}ms for ${uncachedIds.length} users`);
    }
    
    if (data && !error) {
      // Cache all fetched profiles
      data.forEach(profile => {
        setCachedProfile(profile.user_id, profile);
        profiles.push(profile);
      });
    }
  }
  
  return profiles;
}

/**
 * Invalidate a specific profile cache
 */
export function invalidateProfile(userId: string): void {
  if (profileCache.has(userId)) {
    profileCache.delete(userId);
    cacheStats.evictions++;
  }
}

/**
 * Update a cached profile
 */
export function updateCachedProfile(userId: string, updates: Partial<Profile>): void {
  const cached = profileCache.get(userId);
  if (cached) {
    cached.data = { ...cached.data, ...updates };
    cached.timestamp = Date.now();
  }
}

/**
 * Clear all profile cache
 */
export function clearProfileCache(): void {
  const size = profileCache.size;
  profileCache.clear();
  cacheStats.evictions += size;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`Cleared ${size} profiles from cache`);
  }
}

/**
 * Clean up expired entries
 */
function cleanupCache(): void {
  const now = Date.now();
  let cleaned = 0;
  
  // Use Array.from to avoid iterator issues
  const entries = Array.from(profileCache.entries());
  for (const [userId, cached] of entries) {
    if (now - cached.timestamp > CACHE_TTL) {
      profileCache.delete(userId);
      cleaned++;
    }
  }
  
  cacheStats.evictions += cleaned;
  
  if (cleaned > 0 && process.env.NODE_ENV === 'development') {
    console.log(`Cleaned up ${cleaned} expired profile cache entries`);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const total = cacheStats.hits + cacheStats.misses;
  const hitRate = total > 0 ? (cacheStats.hits / total * 100).toFixed(1) : '0';
    
  return {
    ...cacheStats,
    hitRate: `${hitRate}%`,
    cacheSize: profileCache.size,
    memoryEstimate: `${Math.round(profileCache.size * 0.5)}KB`
  };
}

/**
 * Reset cache statistics
 */
export function resetCacheStats(): void {
  cacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    evictions: 0
  };
}

/**
 * Hook for React components to get cached profile
 */
export function useCachedProfile(userId: string): Profile | null {
  return getCachedProfile(userId);
}

/**
 * Monitor and log cache performance
 */
export function logCachePerformance(): void {
  const stats = getCacheStats();
  console.log('Profile Cache Performance:', stats);
  
  // Alert if hit rate is low
  const hitRateNum = parseFloat(stats.hitRate);
  if (cacheStats.hits + cacheStats.misses > 100 && hitRateNum < 70) {
    console.warn(`Low profile cache hit rate: ${stats.hitRate} - Consider increasing cache TTL or fixing cache invalidation`);
  }
  
  // Alert if cache is getting too large
  if (profileCache.size > MAX_CACHE_SIZE * 0.8) {
    console.warn(`Profile cache is ${profileCache.size}/${MAX_CACHE_SIZE} entries - Consider cleanup`);
  }
}

// Development helpers
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Periodic cleanup and monitoring
  setInterval(() => {
    cleanupCache();
    logCachePerformance();
  }, 60000); // Every minute
  
  // Expose cache to window for debugging
  (window as Window & { 
    profileCache?: {
      stats: typeof getCacheStats;
      clear: typeof clearProfileCache;
      size: () => number;
      get: typeof getCachedProfile;
      invalidate: typeof invalidateProfile;
    };
  }).profileCache = {
    stats: getCacheStats,
    clear: clearProfileCache,
    size: () => profileCache.size,
    get: getCachedProfile,
    invalidate: invalidateProfile
  };
}
