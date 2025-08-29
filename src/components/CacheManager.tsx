'use client'

import { useEffect } from 'react'
import { autoRecoverFromStaleState, updateActivityTimestamp } from '@/lib/cacheUtils'
import { registerServiceWorker } from '@/lib/serviceWorker'

/**
 * Component to manage app-wide cache and prevent loading issues
 */
export default function CacheManager() {
  useEffect(() => {
    // Register service worker for cache management
    registerServiceWorker()
    
    // Check for stale state on mount
    autoRecoverFromStaleState()
    
    // Update activity timestamp
    updateActivityTimestamp()
    
    // Set up interval to update activity timestamp
    const activityInterval = setInterval(() => {
      updateActivityTimestamp()
    }, 60000) // Update every minute
    
    // Listen for user activity
    const handleUserActivity = () => {
      updateActivityTimestamp()
    }
    
    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true })
    })
    
    // Listen for visibility changes to detect when user returns to tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateActivityTimestamp()
        // Check for stale state when returning to tab
        autoRecoverFromStaleState()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Cleanup
    return () => {
      clearInterval(activityInterval)
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity)
      })
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
  
  return null // This component doesn't render anything
}
