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


// Middleware temporarily disabled since Google authentication has been removed
// This eliminates redirect loops and simplifies navigation during development

import { type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // No authentication checks - allow all requests to pass through
  return;
}

export const config = {
  // Disable middleware by matching nothing
  matcher: []
};
