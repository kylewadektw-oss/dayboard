// Cache utilities to prevent stale data issues
import { clearServiceWorkerCache } from './serviceWorker'

/**
 * Generate a cache-busting timestamp
 */
export function generateCacheBuster(): string {
  return Date.now().toString();
}

/**
 * Clear all local storage data related to the app
 */
export function clearAppCache(): void {
  try {
    // Clear localStorage items that might cause issues
    const keysToRemove = [
      'sb-csbwewirwzeitavhvykr-auth-token',
      'dayboard-user-profile',
      'dayboard-household-data',
      'nextjs-cache'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear service worker cache
    clearServiceWorkerCache();
    
    console.log('App cache cleared successfully');
  } catch (error) {
    console.error('Error clearing app cache:', error);
  }
}

/**
 * Add cache-busting headers to fetch requests
 */
export function addCacheBustingHeaders(headers: Record<string, string> = {}): Record<string, string> {
  return {
    ...headers,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Timestamp': Date.now().toString()
  };
}

/**
 * Detect if the app is stuck in a loading state
 */
export function detectStaleState(): boolean {
  try {
    const lastActivity = localStorage.getItem('app-last-activity');
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (lastActivity && (now - parseInt(lastActivity)) > fiveMinutes) {
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Update last activity timestamp
 */
export function updateActivityTimestamp(): void {
  try {
    localStorage.setItem('app-last-activity', Date.now().toString());
  } catch (error) {
    console.error('Error updating activity timestamp:', error);
  }
}

/**
 * Auto-clear cache if stale state detected
 */
export function autoRecoverFromStaleState(): void {
  if (detectStaleState()) {
    console.warn('Stale state detected, clearing cache...');
    clearAppCache();
    // Force reload without cache
    window.location.reload();
  }
}
