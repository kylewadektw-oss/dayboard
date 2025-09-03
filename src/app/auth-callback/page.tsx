'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCallbackPage() {
  const [status, setStatus] = useState('Processing authentication...')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        if (error) {
          setStatus(`Authentication failed: ${error}`)
          setTimeout(() => router.push('/auth-bypass'), 3000)
          return
        }

        if (!code) {
          setStatus('No authorization code received')
          setTimeout(() => router.push('/auth-bypass'), 3000)
          return
        }

        // Verify state
        const storedState = localStorage.getItem('oauth_state')
        if (state !== storedState) {
          setStatus('Invalid state parameter - security check failed')
          setTimeout(() => router.push('/auth-bypass'), 3000)
          return
        }

        setStatus('Exchanging authorization code for access tokens...')

        // Exchange code for tokens via our API
        const response = await fetch('/api/auth/google-callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            code,
            redirectUri: `${window.location.origin}/auth-callback`
          }),
          credentials: 'include'
        })

        if (!response.ok) {
          const errorData = await response.text()
          throw new Error(`Authentication failed: ${response.status} - ${errorData}`)
        }

        const data = await response.json()
        
        if (data.success) {
          setStatus('✅ Authentication successful! Redirecting to dashboard...')
          // Clean up
          localStorage.removeItem('oauth_state')
          // Redirect after a brief success message
          setTimeout(() => {
            router.push('/dashboard')
          }, 1500)
        } else {
          setStatus(`❌ Authentication failed: ${data.error || 'Unknown error'}`)
          setTimeout(() => router.push('/auth-bypass'), 3000)
        }

      } catch (err) {
        console.error('Callback processing error:', err)
        setStatus(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error occurred'}`)
        setTimeout(() => router.push('/auth-bypass'), 3000)
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-6">
        <div className="mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Authentication</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <p className="text-gray-600 text-sm leading-relaxed">{status}</p>
        </div>

        <div className="mt-4 text-xs text-gray-400">
          CSP-compliant authentication flow
        </div>
      </div>
    </div>
  )
}
