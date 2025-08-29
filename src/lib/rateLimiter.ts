// Rate limiting utilities to prevent 429 errors

interface RequestCache {
  [key: string]: {
    timestamp: number;
    data: any;
    expiry: number;
  };
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private cache: RequestCache = {};
  private readonly maxRequests: number;
  private readonly timeWindow: number; // in milliseconds
  private readonly cacheTimeout: number; // in milliseconds

  constructor(maxRequests = 10, timeWindow = 60000, cacheTimeout = 30000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.cacheTimeout = cacheTimeout;
  }

  /**
   * Check if we can make a request for the given key
   */
  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the time window
    const recentRequests = requests.filter(time => now - time < this.timeWindow);
    this.requests.set(key, recentRequests);
    
    return recentRequests.length < this.maxRequests;
  }

  /**
   * Record a request for the given key
   */
  recordRequest(key: string): void {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    requests.push(now);
    this.requests.set(key, requests);
  }

  /**
   * Get cached data if available and not expired
   */
  getCachedData(key: string): any | null {
    const cached = this.cache[key];
    if (!cached) return null;
    
    const now = Date.now();
    if (now > cached.expiry) {
      delete this.cache[key];
      return null;
    }
    
    return cached.data;
  }

  /**
   * Cache data for the given key
   */
  setCachedData(key: string, data: any): void {
    this.cache[key] = {
      timestamp: Date.now(),
      data: data,
      expiry: Date.now() + this.cacheTimeout
    };
  }

  /**
   * Wait for the specified time
   */
  async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get time until next request is allowed
   */
  getTimeUntilNextRequest(key: string): number {
    const requests = this.requests.get(key) || [];
    if (requests.length < this.maxRequests) return 0;
    
    const oldestRequest = Math.min(...requests);
    const timeUntilReset = this.timeWindow - (Date.now() - oldestRequest);
    return Math.max(0, timeUntilReset);
  }

  /**
   * Clear all cached data and request history
   */
  clear(): void {
    this.requests.clear();
    this.cache = {};
  }
}

// Global rate limiter instance
export const globalRateLimiter = new RateLimiter(15, 60000, 30000); // 15 requests per minute, 30s cache

/**
 * Rate-limited fetch wrapper
 */
export async function rateLimitedFetch(
  url: string, 
  options: RequestInit = {},
  retries = 3
): Promise<Response> {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  
  // Check cache first
  const cachedData = globalRateLimiter.getCachedData(cacheKey);
  if (cachedData) {
    return new Response(JSON.stringify(cachedData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Check rate limit
  if (!globalRateLimiter.canMakeRequest(url)) {
    const waitTime = globalRateLimiter.getTimeUntilNextRequest(url);
    if (waitTime > 0) {
      console.warn(`Rate limited. Waiting ${waitTime}ms before retry`);
      await globalRateLimiter.wait(Math.min(waitTime, 5000)); // Max 5s wait
    }
  }
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Record the request
      globalRateLimiter.recordRequest(url);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Cache-Control': 'no-cache',
          'X-Request-ID': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
      });
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
        
        console.warn(`Rate limited (429). Waiting ${waitTime}ms before retry ${attempt + 1}/${retries}`);
        await globalRateLimiter.wait(waitTime);
        continue;
      }
      
      // Cache successful responses
      if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
        try {
          const data = await response.clone().json();
          globalRateLimiter.setCachedData(cacheKey, data);
        } catch {
          // Ignore caching errors
        }
      }
      
      return response;
    } catch (error) {
      lastError = error as Error;
      console.error(`Request failed (attempt ${attempt + 1}/${retries}):`, error);
      
      if (attempt < retries - 1) {
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        await globalRateLimiter.wait(waitTime);
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

/**
 * Debounced function executor
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttled function executor
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
