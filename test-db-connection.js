const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
const envContent = fs.readFileSync('.env.local', 'utf8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1];
const supabaseKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1];

console.log('🔍 Testing Supabase Database Connection');
console.log('=====================================');

async function testConnection() {
  try {
    console.log('📡 Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🌐 Testing basic connectivity...');
    
    // Test 1: Simple health check
    console.log('📊 Test 1: Health check');
    const startTime = Date.now();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
      
    const responseTime = Date.now() - startTime;
    console.log(`⏱️  Response time: ${responseTime}ms`);
    
    if (error) {
      console.log('❌ Health check failed:', error.message);
      console.log('🔍 Error details:', JSON.stringify(error, null, 2));
      return false;
    }
    
    console.log('✅ Health check passed');
    console.log('📊 Profile count:', data);
    
    // Test 2: Actual data query
    console.log('\\n📊 Test 2: Data retrieval');
    const queryStart = Date.now();
    
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, name')
      .limit(1);
      
    const queryTime = Date.now() - queryStart;
    console.log(`⏱️  Query time: ${queryTime}ms`);
    
    if (profileError) {
      console.log('❌ Data query failed:', profileError.message);
      console.log('🔍 Error details:', JSON.stringify(profileError, null, 2));
      return false;
    }
    
    console.log('✅ Data query successful');
    console.log('📋 Sample data:', profiles);
    
    // Test 3: Connection with specific user_id
    console.log('\\n📊 Test 3: Specific user query');
    const specificStart = Date.now();
    
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', '0139a6fc-bf13-426d-8929-604051c4d1f4')
      .single();
      
    const specificTime = Date.now() - specificStart;
    console.log(`⏱️  Specific query time: ${specificTime}ms`);
    
    if (userError) {
      if (userError.code === 'PGRST116') {
        console.log('ℹ️  No profile found (normal for new users)');
      } else {
        console.log('❌ Specific query failed:', userError.message);
        console.log('🔍 Error details:', JSON.stringify(userError, null, 2));
        return false;
      }
    } else {
      console.log('✅ Specific query successful');
      console.log('👤 User profile:', userProfile);
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Connection test failed with exception:');
    console.log('🔍 Error type:', error.constructor.name);
    console.log('🔍 Error message:', error.message);
    console.log('🔍 Error stack:', error.stack);
    return false;
  }
}

async function main() {
  const success = await testConnection();
  
  console.log('\\n=====================================');
  if (success) {
    console.log('🎉 Database connection test PASSED');
    console.log('✅ Your Supabase connection is working correctly');
  } else {
    console.log('💥 Database connection test FAILED'); 
    console.log('❌ There are connectivity issues that need to be resolved');
  }
  console.log('=====================================');
}

main().catch(console.error);
