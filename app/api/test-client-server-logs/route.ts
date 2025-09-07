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
