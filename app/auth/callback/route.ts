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
    const { data: sessionData, error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      serverAuthLogger.error(
        `❌ Code exchange failed`,
        { error: error.message },
        error
      );
      return NextResponse.redirect(
        getErrorRedirect(
          `${requestUrl.origin}/signin`,
          error.name,
          "Sorry, we weren't able to log you in. Please try again."
        )
      );
    }

    // Check if we got a session
    if (sessionData?.session) {
      serverAuthLogger.info(`✅ Session created successfully`, {
        userId: sessionData.session.user?.id,
        hasAccessToken: !!sessionData.session.access_token,
        hasRefreshToken: !!sessionData.session.refresh_token,
        expiresAt: sessionData.session.expires_at
      });
    } else {
      serverAuthLogger.warn(`⚠️ No session data returned from code exchange`);
    }

    serverAuthLogger.info(`✅ Code exchange successful, checking user profile`);

    // After successful auth, check if user profile exists
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      serverAuthLogger.info(`👤 User authenticated`, {
        userId: user.id,
        email: user.email
      });

      // Check if profile exists
      const { data: profile, error: profileSelectError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id) // Use 'user_id' to match actual schema
        .maybeSingle(); // Use maybeSingle instead of single to avoid error if no profile

      serverAuthLogger.info(`📊 Profile check result`, {
        hasProfile: !!profile,
        hasError: !!profileSelectError,
        error: profileSelectError?.message
      });

      // If no profile exists, create one
      if (!profile && !profileSelectError) {
        serverAuthLogger.info(`🆕 Creating new profile for user`, {
          userId: user.id
        });

        const newProfile = {
          id: user.id,
          user_id: user.id,
          name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          avatar_url:
            user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
          role: 'member' as const,
          household_id: null
        };

        serverAuthLogger.info(`📝 Profile data prepared`, {
          profileData: newProfile,
          userMetadata: user.user_metadata
        });

        const { data: insertedProfile, error: profileError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        serverAuthLogger.info(`📝 Profile creation result`, {
          success: !!insertedProfile,
          hasError: !!profileError,
          profileId: insertedProfile?.id,
          errorMessage: profileError?.message,
          errorDetails: profileError?.details,
          errorHint: profileError?.hint
        });

        if (profileError) {
          serverAuthLogger.error(
            `❌ Profile creation failed`,
            {
              userId: user.id,
              error: profileError.message,
              errorDetails: profileError.details,
              errorHint: profileError.hint,
              errorCode: profileError.code
            },
            profileError
          );

          // Try a simpler profile creation as fallback
          serverAuthLogger.info(`🔄 Attempting simplified profile creation`);
          const simpleProfile = {
            user_id: user.id,
            name:
              user.user_metadata?.full_name ||
              user.email?.split('@')[0] ||
              'New User',
            role: 'member' as const
          };

          const { data: fallbackProfile, error: fallbackError } = await supabase
            .from('profiles')
            .insert(simpleProfile)
            .select()
            .single();

          if (fallbackError) {
            serverAuthLogger.error(`❌ Fallback profile creation also failed`, {
              userId: user.id,
              error: fallbackError.message,
              errorCode: fallbackError.code
            });
            return NextResponse.redirect(
              getErrorRedirect(
                `${requestUrl.origin}/signin`,
                'ProfileCreationError',
                'Failed to create user profile. Please try signing in again.'
              )
            );
          } else {
            serverAuthLogger.info(`✅ Fallback profile created successfully`, {
              userId: user.id,
              profileId: fallbackProfile.id
            });
          }
        } else {
          serverAuthLogger.info(`✅ Profile created successfully`, {
            userId: user.id,
            profileId: insertedProfile.id
          });

          // Create customer review entry for new users
          const { error: reviewError } = await supabase
            .from('customer_reviews')
            .insert({
              user_id: user.id,
              status: 'pending'
            });

          if (reviewError) {
            serverAuthLogger.warn(`⚠️ Customer review creation failed`, {
              userId: user.id,
              error: reviewError.message
            });
            // Don't block signup if review creation fails
          } else {
            serverAuthLogger.info(`📋 Customer review created for new user`, {
              userId: user.id
            });
          }

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
          displayName: profile.preferred_name || profile.name
        });

        // Check if household setup is complete
        if (
          !profile.household_id ||
          !(profile.preferred_name || profile.name)
        ) {
          serverAuthLogger.info(
            `🏠 Redirecting to profile setup - incomplete household/profile`,
            {
              userId: user.id,
              hasHousehold: !!profile.household_id,
              hasName: !!(profile.preferred_name || profile.name),
              onboardingCompleted: true // Assume completed since field doesn't exist in current schema
            }
          );
          return NextResponse.redirect(
            getStatusRedirect(
              `${requestUrl.origin}/profile/setup`,
              'Welcome back!',
              'Please complete your profile and household setup.'
            )
          );
        }

        // Profile is complete, redirect to dashboard
        serverAuthLogger.info(`✅ Profile complete, redirecting to dashboard`, {
          userId: user.id,
          profileComplete: true
        });
        return NextResponse.redirect(
          getStatusRedirect(
            `${requestUrl.origin}/dashboard`,
            'Welcome back!',
            'You have been signed in successfully.'
          )
        );
      } else if (profileSelectError) {
        serverAuthLogger.error(
          `❌ Error checking for existing profile`,
          {
            userId: user.id,
            error: profileSelectError.message
          },
          profileSelectError
        );

        // Handle profile error - redirect to signin with error
        return NextResponse.redirect(
          getErrorRedirect(
            `${requestUrl.origin}/signin`,
            'ProfileError',
            'There was an issue accessing your profile. Please try signing in again.'
          )
        );
      }
    } else {
      serverAuthLogger.warn(`⚠️ No user found after successful code exchange`);
      return NextResponse.redirect(
        getErrorRedirect(
          `${requestUrl.origin}/signin`,
          'UserNotFound',
          'Unable to authenticate user. Please try signing in again.'
        )
      );
    }
  } else {
    serverAuthLogger.warn(`⚠️ No authorization code provided in callback`);
    return NextResponse.redirect(
      getErrorRedirect(
        `${requestUrl.origin}/signin`,
        'AuthCallbackError',
        'No authorization code provided. Please try signing in again.'
      )
    );
  }
}
