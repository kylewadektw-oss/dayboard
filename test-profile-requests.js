const { createClient } = require('@supabase/supabase-js');

// Get environment variables directly from the .env.local file
const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1];
const supabaseAnonKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1];

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProfileConnection() {
  try {
    console.log('🧪 Testing single profile request (no flooding)...');
    
    const startTime = Date.now();
    
    // Simulate the exact query from your profile page
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', '0139a6fc-bf13-426d-8929-604051c4d1f4')
      .single();
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`⏱️ Response time: ${responseTime}ms`);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('ℹ️ No profile found (normal for new users)');
      } else {
        console.log('⚠️ Query error:', error.message, '(Code:', error.code + ')');
      }
    } else {
      console.log('✅ Profile found:', data.name, 'Age:', data.age);
    }
    
    console.log('🔍 Testing multiple rapid requests (should be avoided)...');
    
    // Test multiple concurrent requests (what was causing the problem)
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', '0139a6fc-bf13-426d-8929-604051c4d1f4')
          .single()
      );
    }
    
    const concurrentStart = Date.now();
    const results = await Promise.allSettled(promises);
    const concurrentEnd = Date.now();
    
    console.log(`⚡ 5 concurrent requests took: ${concurrentEnd - concurrentStart}ms`);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`✅ Successful: ${successful}, ❌ Failed: ${failed}`);
    
    if (failed > 0) {
      console.log('⚠️ Some requests failed - this indicates resource limits');
    } else {
      console.log('🎉 All requests succeeded - connection is stable');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testProfileConnection();
