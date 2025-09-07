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

/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kylewadektw-oss)
 * 
 * This file is part of Dayboard, a proprietary family command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: [your-email@domain.com]
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

// Test script to check database connection and see what tables exist
const { createClient } = require('@supabase/supabase-js');

// Load environment variables directly
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Try anon key instead

console.log('🔍 Testing Database Connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('📋 Checking available tables...');
    
    // Get table information - using a simpler approach
    console.log('📋 Testing basic connection...');
    
    // Check if application_logs exists by trying to query it
    console.log('\n🔍 Checking for application_logs table...');
    const { data: logData, error: logError } = await supabase
      .from('application_logs')
      .select('*')
      .limit(5);
    
    if (logError) {
      console.error('❌ application_logs table error:', logError);
      
      // Try checking other known tables
      console.log('\n🔍 Checking for profiles table...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (profileError) {
        console.error('❌ profiles table error:', profileError);
      } else {
        console.log('✅ profiles table exists');
      }
      
    } else {
      console.log('✅ application_logs table exists with', logData?.length || 0, 'sample records');
      if (logData && logData.length > 0) {
        console.log('📄 Sample log:', JSON.stringify(logData[0], null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
