import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  
  if (code) {
    try {
      console.log('Processing auth callback with code:', code);
      
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(`${origin}/signin?error=${encodeURIComponent(error.message)}`);
      }
      
      console.log('Successfully exchanged code for session');
      return NextResponse.redirect(`${origin}/profile`);
    } catch (error) {
      console.error('Unexpected error in auth callback:', error);
      return NextResponse.redirect(`${origin}/signin?error=unexpected_error`);
    }
  }
  
  // No code provided
  console.error('No code provided in auth callback');
  return NextResponse.redirect(`${origin}/signin?error=no_code`);
}