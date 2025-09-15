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

import { useState, useCallback, useMemo } from 'react';
import { enhancedLogger, LogLevel } from '@/utils/logger';

interface Magic8BallQuestion {
  id: string;
  household_id: string;
  asked_by: string;
  question: string;
  answer: string;
  theme: string;
  created_at: string;
  profiles?: {
    display_name?: string;
    first_name?: string;
  };
}

interface Magic8BallStats {
  totalQuestions: number;
  todaysQuestions: number;
  weeklyQuestions: number;
  mostActiveUser: string;
  mostPopularTheme: string;
  userCounts: Record<string, number>;
}

interface UseMagic8BallReturn {
  // State
  loading: boolean;
  error: string | null;
  
  // Methods
  saveQuestion: (question: string, answer: string, theme: string, householdId: string) => Promise<boolean>;
  getHistory: (householdId: string) => Promise<Magic8BallQuestion[]>;
  getStats: (householdId: string) => Promise<Magic8BallStats | null>;
  deleteQuestion: (questionId: string) => Promise<boolean>;
}

// 🚀 Performance Optimization: Simple caching implementation
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class Magic8BallCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn: ttl
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.timestamp > entry.expiresIn;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  invalidate(pattern: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern)
    );
    keysToDelete.forEach(key => this.cache.delete(key));
  }
  
  clear(): void {
    this.cache.clear();
  }
}

// 🎯 Singleton cache instance
const magic8BallCache = new Magic8BallCache();

// 🚀 Request deduplication map
const pendingRequests = new Map<string, Promise<unknown>>();

// Helper function for type-safe promise retrieval
function getPendingRequest<T>(key: string): Promise<T> | undefined {
  const promise = pendingRequests.get(key);
  return promise as Promise<T> | undefined;
}

// 🎯 Optimized hook with caching and deduplication
export const useMagic8Ball = (): UseMagic8BallReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🚀 Memoized cache keys generator
  const getCacheKeys = useMemo(() => ({
    history: (householdId: string) => `magic8ball_history_${householdId}`,
    stats: (householdId: string) => `magic8ball_stats_${householdId}`,
  }), []);

  // 🎯 Optimized save with cache invalidation
  const saveQuestion = useCallback(async (
    question: string, 
    answer: string, 
    theme: string, 
    householdId: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/magic8ball', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          answer,
          theme,
          household_id: householdId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save question');
      }

      // 🚀 Performance: Invalidate cache after successful save
      magic8BallCache.invalidate(householdId);

      await enhancedLogger.logWithFullContext(LogLevel.INFO, "Magic 8-Ball question saved via optimized hook", "useMagic8Ball", {
        question,
        theme,
        householdId,
        cacheInvalidated: true
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      await enhancedLogger.logWithFullContext(LogLevel.ERROR, "Failed to save Magic 8-Ball question via hook", "useMagic8Ball", {
        error: errorMessage,
        question,
        theme,
        householdId
      });

      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 🚀 Optimized getHistory with caching and deduplication
  const getHistory = useCallback(async (householdId: string): Promise<Magic8BallQuestion[]> => {
    const cacheKey = getCacheKeys.history(householdId);
    
    // 🎯 Check cache first
    const cachedData = magic8BallCache.get<Magic8BallQuestion[]>(cacheKey);
    if (cachedData) {
      await enhancedLogger.logWithFullContext(LogLevel.DEBUG, "Magic 8-Ball history served from cache", "useMagic8Ball", {
        householdId,
        cacheHit: true,
        questionCount: cachedData.length
      });
      return cachedData;
    }

    // 🚀 Check for pending request (deduplication)
    if (pendingRequests.has(cacheKey)) {
      await enhancedLogger.logWithFullContext(LogLevel.DEBUG, "Magic 8-Ball history request deduplicated", "useMagic8Ball", {
        householdId
      });
      const pending = getPendingRequest<Magic8BallQuestion[]>(cacheKey);
      return pending || [];
    }

    const requestPromise = (async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/magic8ball?action=history&household_id=${householdId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch history');
        }

        const data = await response.json();
        const questions = data.questions || [];

        // 🚀 Cache the result
        magic8BallCache.set(cacheKey, questions, 3 * 60 * 1000); // 3 minutes for history

        await enhancedLogger.logWithFullContext(LogLevel.DEBUG, "Magic 8-Ball history fetched and cached", "useMagic8Ball", {
          householdId,
          questionCount: questions.length,
          cached: true
        });

        return questions;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        
        await enhancedLogger.logWithFullContext(LogLevel.ERROR, "Failed to fetch Magic 8-Ball history via hook", "useMagic8Ball", {
          error: errorMessage,
          householdId
        });

        return [];
      } finally {
        setLoading(false);
        pendingRequests.delete(cacheKey);
      }
    })();

    // 🎯 Store the pending request
    pendingRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  }, [getCacheKeys]);

  // 🚀 Optimized getStats with caching and deduplication
  const getStats = useCallback(async (householdId: string): Promise<Magic8BallStats | null> => {
    const cacheKey = getCacheKeys.stats(householdId);
    
    // 🎯 Check cache first
    const cachedData = magic8BallCache.get<Magic8BallStats>(cacheKey);
    if (cachedData) {
      await enhancedLogger.logWithFullContext(LogLevel.DEBUG, "Magic 8-Ball stats served from cache", "useMagic8Ball", {
        householdId,
        cacheHit: true
      });
      return cachedData;
    }

    // 🚀 Check for pending request (deduplication)
    if (pendingRequests.has(cacheKey)) {
      const pending = getPendingRequest<Magic8BallStats | null>(cacheKey);
      return pending || null;
    }

    const requestPromise = (async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/magic8ball?action=stats&household_id=${householdId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch stats');
        }

        const data = await response.json();

        // 🚀 Cache the result with longer TTL for stats
        magic8BallCache.set(cacheKey, data, 10 * 60 * 1000); // 10 minutes for stats

        await enhancedLogger.logWithFullContext(LogLevel.DEBUG, "Magic 8-Ball stats fetched and cached", "useMagic8Ball", {
          householdId,
          cached: true
        });

        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        
        await enhancedLogger.logWithFullContext(LogLevel.ERROR, "Failed to fetch Magic 8-Ball stats via hook", "useMagic8Ball", {
          error: errorMessage,
          householdId
        });

        return null;
      } finally {
        setLoading(false);
        pendingRequests.delete(cacheKey);
      }
    })();

    // 🎯 Store the pending request
    pendingRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  }, [getCacheKeys]);

  // 🚀 Optimized delete with cache invalidation
  const deleteQuestion = useCallback(async (questionId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/magic8ball?id=${questionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete question');
      }

      // 🚀 Performance: Clear all cache entries since we don't know the household_id
      magic8BallCache.clear();

      await enhancedLogger.logWithFullContext(LogLevel.INFO, "Magic 8-Ball question deleted via optimized hook", "useMagic8Ball", {
        questionId,
        cacheCleared: true
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      await enhancedLogger.logWithFullContext(LogLevel.ERROR, "Failed to delete Magic 8-Ball question via hook", "useMagic8Ball", {
        error: errorMessage,
        questionId
      });

      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    saveQuestion,
    getHistory,
    getStats,
    deleteQuestion,
  };
};