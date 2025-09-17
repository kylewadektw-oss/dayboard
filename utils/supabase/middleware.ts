/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 *
 * Copyright (c) 2025 BentLo Labs LLC (developer@bentlolabs.com)
 *
 * This file is part of Dayboard, a proprietary household command center application.
 *
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 *
 * For licensing inquiries: developer@bentlolabs.com
 *
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

import { type NextRequest, NextResponse } from 'next/server';

/**
 * MIDDLEWARE DISABLED - Using client-side authentication instead
 *
 * This middleware has been disabled to prevent problematic server-side redirects
 * that were causing authentication loops. Authentication is now handled client-side
 * via the ProtectedRoute component.
 */
export async function updateSession(request: NextRequest) {
  // Allow all routes to pass through - authentication is handled client-side
  return NextResponse.next({
    headers: {
      'x-middleware': 'disabled',
      'x-auth-method': 'client-side'
    }
  });
}
