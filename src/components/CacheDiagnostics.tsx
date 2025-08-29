'use client'

import { useState, useEffect } from 'react'

export default function CacheDiagnostics() {
  const [isVisible, setIsVisible] = useState(false)
  const [diagnostics, setDiagnostics] = useState<any>({})

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return

    const runDiagnostics = () => {
      const diag = {
        timestamp: new Date().toISOString(),
        localStorage: typeof window !== 'undefined' ? Object.keys(localStorage).length : 0,
        sessionStorage: typeof window !== 'undefined' ? Object.keys(sessionStorage).length : 0,
        serviceWorker: 'serviceWorker' in navigator,
        online: typeof window !== 'undefined' ? navigator.onLine : false,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown'
      }
      setDiagnostics(diag)
    }

    runDiagnostics()
    const interval = setInterval(runDiagnostics, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
      >
        Cache Info
      </button>
      
      {isVisible && (
        <div className="mt-2 bg-black bg-opacity-90 text-white p-3 rounded text-xs max-w-sm overflow-hidden">
          <div className="font-bold mb-2">Cache Diagnostics</div>
          <div>Time: {diagnostics.timestamp}</div>
          <div>LocalStorage items: {diagnostics.localStorage}</div>
          <div>SessionStorage items: {diagnostics.sessionStorage}</div>
          <div>Service Worker: {diagnostics.serviceWorker ? '✅' : '❌'}</div>
          <div>Online: {diagnostics.online ? '✅' : '❌'}</div>
          <div>URL: {diagnostics.url}</div>
          <button
            onClick={() => {
              localStorage.clear()
              sessionStorage.clear()
              window.location.reload()
            }}
            className="mt-2 bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
          >
            Clear All & Reload
          </button>
        </div>
      )}
    </div>
  )
}
