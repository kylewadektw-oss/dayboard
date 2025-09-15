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

import { useState, useCallback } from 'react';
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
  userCounts: Record<string, { questions: number; lastQuestion: string }>;
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

export const useMagic8Ball = (): UseMagic8BallReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      await enhancedLogger.logWithFullContext(LogLevel.INFO, "Magic 8-Ball question saved via hook", "useMagic8Ball", {
        question,
        theme,
        householdId
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

  const getHistory = useCallback(async (householdId: string): Promise<Magic8BallQuestion[]> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/magic8ball?action=history&household_id=${householdId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch history');
      }

      const data = await response.json();
      return data.questions || [];
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
    }
  }, []);

  const getStats = useCallback(async (householdId: string): Promise<Magic8BallStats | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/magic8ball?action=stats&household_id=${householdId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch stats');
      }

      const data = await response.json();
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
    }
  }, []);

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

      await enhancedLogger.logWithFullContext(LogLevel.INFO, "Magic 8-Ball question deleted via hook", "useMagic8Ball", {
        questionId
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