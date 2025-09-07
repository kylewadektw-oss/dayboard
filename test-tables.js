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


const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://csbwewirwzeitavhvykr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYndld2lyd3plaXRhdmh2eWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNTg3NjIsImV4cCI6MjA3MTkzNDc2Mn0.Jc3FO8nDvw5VtIKPH29V7cwDm-XX4Lniqn_PjFROXR8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSchemaDirectly() {
  console.log('Testing what tables are accessible...');
  
  // List all tables we expect to exist
  const expectedTables = [
    'profiles', 
    'users', 
    'customers', 
    'households', 
    'household_invitations',
    'user_permissions',
    'household_features', 
    'global_feature_toggles',
    'products', 
    'prices', 
    'subscriptions'
  ];

  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase.from(tableName).select('*').limit(1);
      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ ${tableName}: accessible (${data.length} rows visible)`);
      }
    } catch (err) {
      console.log(`❌ ${tableName}: ${err.message}`);
    }
  }

  // Test if we can see the current user through auth
  console.log('\n--- Auth Status ---');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (user) {
      console.log('✅ Authenticated user found:', user.email, user.id);
      
      // Now try to fetch this specific user's profile
      console.log('\n--- Trying to fetch authenticated user profile ---');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (profileError) {
        console.log('❌ Profile fetch error:', profileError.message);
      } else if (profile) {
        console.log('✅ Found profile for authenticated user:', profile);
      } else {
        console.log('⚠️  No profile found for authenticated user');
      }
    } else {
      console.log('ℹ️  No authenticated user');
    }
  } catch (err) {
    console.log('❌ Auth check error:', err.message);
  }
}

testSchemaDirectly().catch(console.error);
