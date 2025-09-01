import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // OAuth callback handler - to be implemented
  return NextResponse.json({ message: 'Auth callback endpoint' });
}