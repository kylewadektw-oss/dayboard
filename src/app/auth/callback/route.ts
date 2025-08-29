import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/profile'

  console.log('Auth callback called with:', { 
    code: !!code, 
    next,
    allParams: Object.fromEntries(searchParams.entries())
  })

  if (code) {
    try {
      // Create a Supabase client for server-side auth (don't use rate limiting here)
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            flowType: 'pkce'
          }
        }
      )

      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      console.log('Code exchange result:', { 
        hasSession: !!data?.session, 
        hasUser: !!data?.user,
        error: error?.message 
      })
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(new URL(`/signin?error=${encodeURIComponent(error.message)}`, origin))
      }

      if (data?.session) {
        // Successful authentication - redirect to the intended page
        console.log('Successful auth, redirecting to:', next)
        return NextResponse.redirect(new URL(next, origin))
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/signin?error=callback_error', origin))
    }
  }

  // If no code or error occurred, redirect to signin
  console.log('No code parameter found in callback URL')
  return NextResponse.redirect(new URL('/signin?error=no_code', origin))
}
