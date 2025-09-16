/**
 * 🚀 PROFILE CACHE - IMMEDIATE PERFORMANCE BOOST
 *
 * This provides a simple in-memory cache for user profiles
 * to reduce database queries from 771k to manageable levels.
 *
 * Expected improvement: 493ms → <10ms for cached profiles
 */

// Simple in-memory cache
const profileCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 1000; // Prevent memory bloat

// Cache statistics for monitoring
let cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  evictions: 0
};

/**
 * Get a cached profile by user ID
 */
export function getCachedProfile(userId) {
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
export function setCachedProfile(userId, data) {
  if (!userId || !data) return;

  profileCache.set(userId, {
    data,
    timestamp: Date.now()
  });

  cacheStats.sets++;

  // Clean up old entries if cache is getting large
  if (profileCache.size > MAX_CACHE_SIZE) {
    cleanupCache();
  }
}

/**
 * Get profile with automatic caching
 */
export async function getProfile(userId, supabase) {
  if (!userId || !supabase) return null;

  // Try cache first
  let profile = getCachedProfile(userId);
  if (profile) {
    return profile;
  }

  // Fetch from database
  const startTime = Date.now();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  const queryTime = Date.now() - startTime;

  // Log slow queries for monitoring
  if (queryTime > 100) {
    console.warn(`Slow profile query: ${queryTime}ms for user ${userId}`);
  }

  if (data && !error) {
    setCachedProfile(userId, data);
    return data;
  }

  if (error) {
    console.error('Profile query error:', error.message);
  }

  return null;
}

/**
 * Get multiple profiles with batch caching
 */
export async function getProfiles(userIds, supabase) {
  if (!userIds || !userIds.length || !supabase) return [];

  const profiles = [];
  const uncachedIds = [];

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
      console.warn(
        `Slow batch profile query: ${queryTime}ms for ${uncachedIds.length} users`
      );
    }

    if (data && !error) {
      // Cache all fetched profiles
      data.forEach((profile) => {
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
export function invalidateProfile(userId) {
  if (profileCache.has(userId)) {
    profileCache.delete(userId);
    cacheStats.evictions++;
  }
}

/**
 * Clear all profile cache
 */
export function clearProfileCache() {
  const size = profileCache.size;
  profileCache.clear();
  cacheStats.evictions += size;
  console.log(`Cleared ${size} profiles from cache`);
}

/**
 * Clean up expired entries
 */
function cleanupCache() {
  const now = Date.now();
  let cleaned = 0;

  for (const [userId, cached] of profileCache.entries()) {
    if (now - cached.timestamp > CACHE_TTL) {
      profileCache.delete(userId);
      cleaned++;
    }
  }

  cacheStats.evictions += cleaned;

  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} expired profile cache entries`);
  }
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats() {
  const hitRate =
    cacheStats.hits + cacheStats.misses > 0
      ? (
          (cacheStats.hits / (cacheStats.hits + cacheStats.misses)) *
          100
        ).toFixed(1)
      : 0;

  return {
    ...cacheStats,
    hitRate: `${hitRate}%`,
    cacheSize: profileCache.size,
    memoryEstimate: `${Math.round(profileCache.size * 0.5)}KB` // Rough estimate
  };
}

/**
 * Reset cache statistics
 */
export function resetCacheStats() {
  cacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    evictions: 0
  };
}

/**
 * Monitor cache performance
 */
export function logCachePerformance() {
  const stats = getCacheStats();
  console.log('Profile Cache Stats:', stats);

  // Alert if hit rate is low
  if (stats.hits + stats.misses > 100 && parseFloat(stats.hitRate) < 70) {
    console.warn('Profile cache hit rate is low:', stats.hitRate);
  }
}

// Optional: Periodic cleanup and stats logging
if (typeof window !== 'undefined') {
  // Browser environment - set up periodic cleanup
  setInterval(() => {
    cleanupCache();
    if (process.env.NODE_ENV === 'development') {
      logCachePerformance();
    }
  }, 60000); // Every minute
}
