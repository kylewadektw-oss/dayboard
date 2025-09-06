import { NextResponse } from 'next/server';
import { serverAuthLogger } from '@/utils/server-logger';

export async function GET() {
  serverAuthLogger.info('🧪 Server logger test - this is a test message from the server');
  serverAuthLogger.warn('⚠️ Server logger test - this is a warning from the server');
  serverAuthLogger.error('❌ Server logger test - this is an error from the server');
  
  console.log('✅ Server logger test completed - check database for logs');
  
  return NextResponse.json({ 
    message: 'Server logger test completed',
    timestamp: new Date().toISOString()
  });
}
