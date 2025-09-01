import { NextResponse } from 'next/server';

export async function GET() {
  // OAuth callback handler - to be implemented
  return NextResponse.json({ message: 'Auth callback endpoint' });
}