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

'use client';

import { createClient } from '@/utils/supabase/client';
import { type Provider } from '@supabase/supabase-js';
import { getURL } from '@/utils/helpers';
import { redirectToPath } from './server';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { oauthLogger } from '@/utils/logger';

export async function handleRequest(
  e: React.FormEvent<HTMLFormElement>,
  requestFunc: (formData: FormData) => Promise<string>,
  router: AppRouterInstance | null = null
): Promise<boolean | void> {
  // Prevent default form submission refresh
  e.preventDefault();

  const formData = new FormData(e.currentTarget);
  const redirectUrl: string = await requestFunc(formData);

  if (router) {
    // If client-side router is provided, use it to redirect
    return router.push(redirectUrl);
  } else {
    // Otherwise, redirect server-side
    return await redirectToPath(redirectUrl);
  }
}

export async function signInWithOAuth(e: React.FormEvent<HTMLFormElement>) {
  // Prevent default form submission refresh
  e.preventDefault();

  try {
    const formData = new FormData(e.currentTarget);
    const provider = String(formData.get('provider')).trim() as Provider;

    oauthLogger.info(`🚀 Starting OAuth flow`, { provider });

    // Create client-side supabase client and call signInWithOAuth
    const supabase = createClient();
    const redirectURL = getURL('/auth/callback');

    oauthLogger.info(`🔗 Redirect URL configured`, { redirectURL });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: redirectURL
      }
    });

    if (error) {
      oauthLogger.error(`❌ OAuth error occurred`, {
        provider,
        error: error.message,
        errorObject: error
      });
      throw error;
    }

    if (data?.url) {
      oauthLogger.info(`🌐 OAuth redirect URL generated`, {
        provider,
        url: data.url
      });
    }

    // OAuth request completed - no need to log routine success
  } catch (error) {
    oauthLogger.error(
      `💥 OAuth sign-in failed`,
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      error instanceof Error ? error : undefined
    );
    throw error;
  }
}
