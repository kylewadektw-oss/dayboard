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


import { createClient } from '@/utils/supabase/client';

export async function GET() {
  try {
    const supabase = createClient();
    
    console.log('🔍 Testing database connection...');
    
    // Test basic query
    const { data, error } = await (supabase as any)
      .from('application_logs')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Database error:', error);
      return Response.json({ 
        success: false, 
        error: error.message,
        details: error 
      }, { status: 500 });
    }
    
    console.log('✅ Database query successful, found', data?.length || 0, 'logs');
    
    return Response.json({ 
      success: true, 
      count: data?.length || 0,
      logs: data 
    });
    
  } catch (error: any) {
    console.error('❌ API error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
