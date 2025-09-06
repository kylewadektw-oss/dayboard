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
