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
