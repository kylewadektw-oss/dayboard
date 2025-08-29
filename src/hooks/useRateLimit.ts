import { useCallback, useRef, useState } from 'react';
import { globalRateLimiter, debounce } from '../lib/rateLimiter';

/**
 * Hook to manage rate-limited API calls
 */
export function useRateLimitedRequest<T>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const makeRequest = useCallback(async (
    requestFn: () => Promise<T>,
    cacheKey?: string
  ): Promise<T | null> => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check cache first if cacheKey is provided
    if (cacheKey) {
      const cached = globalRateLimiter.getCachedData(cacheKey);
      if (cached) {
        setData(cached);
        setError(null);
        return cached;
      }
    }

    // Check rate limiting
    if (cacheKey && !globalRateLimiter.canMakeRequest(cacheKey)) {
      const waitTime = globalRateLimiter.getTimeUntilNextRequest(cacheKey);
      if (waitTime > 5000) { // If we need to wait more than 5 seconds, show cached data
        const cached = globalRateLimiter.getCachedData(cacheKey);
        if (cached) {
          setData(cached);
          setError(null);
          return cached;
        }
      }
    }

    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      // Record the request
      if (cacheKey) {
        globalRateLimiter.recordRequest(cacheKey);
      }

      const result = await requestFn();
      
      // Cache the result
      if (cacheKey && result) {
        globalRateLimiter.setCachedData(cacheKey, result);
      }

      setData(result);
      setIsLoading(false);
      return result;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, don't update state
        return null;
      }

      const errorMessage = err instanceof Error ? err.message : 'Request failed';
      setError(errorMessage);
      setIsLoading(false);
      
      // If we have cached data, return it instead of failing
      if (cacheKey) {
        const cached = globalRateLimiter.getCachedData(cacheKey);
        if (cached) {
          setData(cached);
          setError(null);
          return cached;
        }
      }
      
      throw err;
    }
  }, []);

  const clearCache = useCallback((cacheKey: string) => {
    globalRateLimiter.setCachedData(cacheKey, null);
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    data,
    isLoading,
    error,
    makeRequest,
    clearCache,
    reset
  };
}

/**
 * Hook for debounced requests (useful for search, input changes, etc.)
 */
export function useDebouncedRequest<T>(delay: number = 300) {
  const { makeRequest: originalMakeRequest, ...rest } = useRateLimitedRequest<T>();

  const debouncedMakeRequest = useCallback(
    debounce((requestFn: () => Promise<T>, cacheKey?: string) => {
      originalMakeRequest(requestFn, cacheKey);
    }, delay),
    [originalMakeRequest, delay]
  );

  return {
    ...rest,
    makeRequest: debouncedMakeRequest
  };
}

/**
 * Hook to check rate limiting status
 */
export function useRateLimitStatus() {
  const [rateLimitStatus, setRateLimitStatus] = useState<{
    canMakeRequest: boolean;
    timeUntilNextRequest: number;
  }>({ canMakeRequest: true, timeUntilNextRequest: 0 });

  const checkStatus = useCallback((key: string) => {
    const canMakeRequest = globalRateLimiter.canMakeRequest(key);
    const timeUntilNextRequest = globalRateLimiter.getTimeUntilNextRequest(key);
    
    setRateLimitStatus({ canMakeRequest, timeUntilNextRequest });
    
    return { canMakeRequest, timeUntilNextRequest };
  }, []);

  return {
    rateLimitStatus,
    checkStatus
  };
}
