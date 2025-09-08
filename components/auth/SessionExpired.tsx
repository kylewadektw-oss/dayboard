'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { enhancedLogger, LogLevel } from '../../utils/logger';

interface SessionExpiredProps {
  onRetry?: () => void;
}

export default function SessionExpired({ onRetry }: SessionExpiredProps) {
  const router = useRouter();

  useEffect(() => {
    // Log session expiry with full context
    enhancedLogger.logWithFullContext(
      LogLevel.WARN, 
      'User session expired - showing session expired page', 
      'SessionExpired',
      {
        hasRetryCallback: !!onRetry,
        timestamp: new Date().toISOString()
      }
    );

    // Track this step in user journey
    enhancedLogger.trackJourneyStep('Session Expired Page Displayed', {
      source: 'SessionExpired Component',
      hasRetryOption: !!onRetry
    });
  }, [onRetry]);

  const handleSignIn = async () => {
    await enhancedLogger.logWithFullContext(
      LogLevel.INFO,
      'User clicked Sign In Again from session expired page',
      'SessionExpired'
    );
    
    router.push('/signin');
  };

  const handleRetry = async () => {
    await enhancedLogger.logWithFullContext(
      LogLevel.INFO,
      'User clicked Try Again from session expired page',
      'SessionExpired',
      { hasCustomRetry: !!onRetry }
    );

    if (onRetry) {
      onRetry();
    } else {
      await enhancedLogger.trackJourneyStep('Page Reload Attempted', {
        reason: 'Session expired retry'
      });
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Session Expired
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your session has expired. Please sign in again to continue.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleSignIn}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
          >
            Sign In Again
          </button>

          <button
            onClick={handleRetry}
            className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            If this problem persists, please clear your browser cache and cookies.
          </p>
        </div>
      </div>
    </div>
  );
}
