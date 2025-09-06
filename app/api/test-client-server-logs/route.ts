import { NextResponse } from 'next/server';
import { serverAuthLogger } from '@/utils/server-logger';

export async function GET() {
  // Generate server-side logs
  serverAuthLogger.info('🖥️ Test server log - This is from the server side');
  serverAuthLogger.warn('⚠️ Test server warning - This is a server warning');
  serverAuthLogger.error('❌ Test server error - This is a server error');
  
  return NextResponse.json({ 
    message: 'Server logs generated! Check the Enhanced Logs Dashboard',
    timestamp: new Date().toISOString(),
    side: 'server'
  });
}
