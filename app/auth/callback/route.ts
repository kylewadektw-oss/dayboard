/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kyle.wade.ktw@gmail.com)
 * 
 * This file is part of Dayboard, a proprietary household command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: kyle.wade.ktw@gmail.com
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */


import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getErrorRedirect, getStatusRedirect } from '@/utils/helpers';
import { serverAuthLogger } from '@/utils/server-logger';

export async function GET(request: NextRequest) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the `@supabase/ssr` package. It exchanges an auth code for the user's session.
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  serverAuthLogger.info(`🔄 Auth callback received`, { 
    url: requestUrl.toString(), 
    hasCode: !!code,
    origin: requestUrl.origin 
  });

  if (code) {
    const supabase = await createClient();

    serverAuthLogger.info(`🔑 Exchanging code for session`);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      serverAuthLogger.error(`❌ Code exchange failed`, { error: error.message }, error);
      return NextResponse.redirect(
        getErrorRedirect(
          `${requestUrl.origin}/signin`,
          error.name,
          "Sorry, we weren't able to log you in. Please try again."
        )
      );
    }

    serverAuthLogger.info(`✅ Code exchange successful, checking user profile`);

    // After successful auth, check if user profile exists
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      serverAuthLogger.info(`👤 User authenticated`, { userId: user.id, email: user.email });
      
      // Check if profile exists
      const { data: profile, error: profileSelectError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)  // Use 'id' instead of 'user_id'
        .maybeSingle(); // Use maybeSingle instead of single to avoid error if no profile

      serverAuthLogger.info(`📊 Profile check result`, { 
        hasProfile: !!profile, 
        hasError: !!profileSelectError,
        error: profileSelectError?.message 
      });

      // If no profile exists, create one
      if (!profile && !profileSelectError) {
        serverAuthLogger.info(`🆕 Creating new profile for user`, { userId: user.id });
        
        const newProfile = {
          id: user.id,  // Add the id field to match schema
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          display_name: user.user_metadata?.name || user.user_metadata?.given_name || user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
          role: 'member' as const,
          is_active: true,
          household_id: null,
          onboarding_completed: false,
          profile_completion_percentage: 25, // Basic info from OAuth
          timezone: 'America/New_York', // Default, user can change later
          language: 'en',
          notification_preferences: {},
          privacy_settings: {}
        };

        serverAuthLogger.debug(`📝 Profile data prepared`, { profileData: newProfile });

        const { data: insertedProfile, error: profileError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (profileError) {
          serverAuthLogger.error(`❌ Profile creation failed`, { 
            userId: user.id, 
            error: profileError.message 
          }, profileError);
          return NextResponse.redirect(
            getErrorRedirect(
              `${requestUrl.origin}/signin`,
              'ProfileCreationError',
              'Failed to create user profile. Please try signing in again.'
            )
          );
        } else {
          serverAuthLogger.info(`✅ Profile created successfully`, { 
            userId: user.id, 
            profileId: insertedProfile.id 
          });
          
          // New users always need to complete household setup
          serverAuthLogger.info(`🏠 Redirecting new user to profile setup`);
          return NextResponse.redirect(
            getStatusRedirect(
              `${requestUrl.origin}/profile/setup`,
              'Welcome to Dayboard!',
              'Please complete your profile and household setup.'
            )
          );
        }
      } else if (profile) {
        serverAuthLogger.info(`👤 Existing profile found`, { 
          userId: user.id, 
          profileId: profile.id,
          displayName: profile.display_name 
        });

        // Check if household setup is complete
        if (!profile.household_id || !profile.onboarding_completed || !profile.full_name) {
          serverAuthLogger.info(`🏠 Redirecting to profile setup - incomplete household/profile`, {
            userId: user.id,
            hasHousehold: !!profile.household_id,
            hasFullName: !!profile.full_name,
            onboardingCompleted: profile.onboarding_completed
          });
          return NextResponse.redirect(
            getStatusRedirect(
              `${requestUrl.origin}/profile/setup`,
              'Welcome back!',
              'Please complete your profile and household setup.'
            )
          );
        }
        // Check if household setup is complete
        if (!profile.household_id || !profile.onboarding_completed || !profile.full_name) {
          serverAuthLogger.info(`🏠 Redirecting to profile setup - incomplete household/profile`, {
            userId: user.id,
            hasHousehold: !!profile.household_id,
            hasFullName: !!profile.full_name,
            onboardingCompleted: profile.onboarding_completed
          });
          return NextResponse.redirect(
            getStatusRedirect(
              `${requestUrl.origin}/profile/setup`,
              'Welcome back!',
              'Please complete your profile and household setup.'
            )
          );
        }
      } else if (profileSelectError) {
        serverAuthLogger.error(`❌ Error checking for existing profile`, { 
          userId: user.id, 
          error: profileSelectError.message 
        }, profileSelectError);
      }
    } else {
      serverAuthLogger.warn(`⚠️ No user found after successful code exchange`);
    }
  } else {
    serverAuthLogger.warn(`⚠️ No authorization code provided in callback`);
  }

  // URL to redirect to after sign in process completes
  serverAuthLogger.info(`🏠 Redirecting to dashboard after successful authentication`);
  return NextResponse.redirect(
    getStatusRedirect(
      `${requestUrl.origin}/dashboard`,
      'Success!',
      'You are now signed in.'
    )
  );
}
