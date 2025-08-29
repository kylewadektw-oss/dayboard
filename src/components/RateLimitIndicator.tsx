import { useEffect, useState } from 'react';
import { useRateLimitStatus } from '../hooks/useRateLimit';

interface RateLimitIndicatorProps {
  requestKey?: string;
  showWhenLimited?: boolean;
}

export default function RateLimitIndicator({ 
  requestKey = 'default', 
  showWhenLimited = true 
}: RateLimitIndicatorProps) {
  const { rateLimitStatus, checkStatus } = useRateLimitStatus();
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Check status immediately
    checkStatus(requestKey);

    // Set up interval to check status and update countdown
    const interval = setInterval(() => {
      const status = checkStatus(requestKey);
      if (!status.canMakeRequest && status.timeUntilNextRequest > 0) {
        setCountdown(Math.ceil(status.timeUntilNextRequest / 1000));
      } else {
        setCountdown(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [requestKey, checkStatus]);

  // Only show when rate limited and configured to show
  if (!showWhenLimited || rateLimitStatus.canMakeRequest || countdown === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
      <div className="flex items-center space-x-2">
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>
          Rate limited. Next request available in {countdown} second{countdown !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}

/**
 * Component to show when too many requests have been made
 */
export function TooManyRequestsMessage() {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Too Many Requests
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              We're receiving too many requests right now. Please wait a moment before trying again.
              This helps keep the app running smoothly for everyone.
            </p>
          </div>
          <div className="mt-3">
            <div className="flex space-x-2">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-100 px-2 py-1 text-xs font-medium text-red-800 rounded hover:bg-red-200"
              >
                Refresh Page
              </button>
              <button
                onClick={() => {
                  // Clear localStorage and sessionStorage
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
                className="bg-red-100 px-2 py-1 text-xs font-medium text-red-800 rounded hover:bg-red-200"
              >
                Clear Cache & Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
