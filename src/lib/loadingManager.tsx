import { useEffect, useRef, useState } from 'react'
import { clearAppCache, updateActivityTimestamp } from './cacheUtils'

interface LoadingTimeoutOptions {
  timeout?: number // milliseconds
  onTimeout?: () => void
  enableAutoRecovery?: boolean
}

/**
 * Hook to prevent infinite loading states
 */
export function useLoadingTimeout({
  timeout = 10000, // 10 seconds default
  onTimeout,
  enableAutoRecovery = true
}: LoadingTimeoutOptions = {}) {
  const [hasTimedOut, setHasTimedOut] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const startLoading = () => {
    setIsLoading(true)
    setHasTimedOut(false)
    updateActivityTimestamp()
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setHasTimedOut(true)
      setIsLoading(false)
      
      if (onTimeout) {
        onTimeout()
      } else if (enableAutoRecovery) {
        console.warn('Loading timeout detected, attempting recovery...')
        clearAppCache()
        // Reload without cache
        window.location.reload()
      }
    }, timeout)
  }

  const stopLoading = () => {
    setIsLoading(false)
    setHasTimedOut(false)
    updateActivityTimestamp()
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const resetTimeout = () => {
    setHasTimedOut(false)
    if (isLoading) {
      startLoading()
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    isLoading,
    hasTimedOut,
    startLoading,
    stopLoading,
    resetTimeout
  }
}

/**
 * Component to show when loading times out
 */
export function LoadingTimeoutFallback({ onRetry }: { onRetry: () => void }) {
  const handleClearCacheAndRetry = () => {
    clearAppCache()
    onRetry()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md">
        <div className="text-yellow-600 mb-2">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-yellow-800 mb-2">
          Loading Taking Too Long?
        </h3>
        <p className="text-yellow-700 mb-4">
          The page seems to be stuck loading. This might be due to cached data.
        </p>
        <div className="space-y-2">
          <button
            onClick={onRetry}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={handleClearCacheAndRetry}
            className="w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
          >
            Clear Cache & Retry
          </button>
        </div>
      </div>
    </div>
  )
}
