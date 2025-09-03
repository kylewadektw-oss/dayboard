'use client'

import { useState } from 'react'

export default function TestAuthPage() {
  const [result, setResult] = useState<string>('')

  const testSupabaseClient = async () => {
    try {
      // Test if Supabase client causes CSP violations
      const { createClient } = await import('@supabase/supabase-js')
      
      // Note: Creating client but not using it to test creation vs usage
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      setResult('Supabase client created successfully - no CSP violations detected')
    } catch (error) {
      setResult(`Error creating Supabase client: ${error}`)
    }
  }

  const testSupabaseAuth = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      // This is where CSP violations typically occur
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      
      if (error) throw error
      setResult('OAuth initiated successfully - no CSP violations')
    } catch (error) {
      setResult(`Error with OAuth: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          CSP Test Page
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Testing for CSP violations with Supabase
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <button
              onClick={testSupabaseClient}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Test Supabase Client Creation
            </button>
            
            <button
              onClick={testSupabaseAuth}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Test Supabase OAuth (Where CSP Error Occurs)
            </button>

            {result && (
              <div className="mt-4 p-4 border rounded-md bg-gray-50">
                <p className="text-sm text-gray-700">{result}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
