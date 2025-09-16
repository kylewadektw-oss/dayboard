require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testProfileUpdate() {
  console.log('🧪 Testing profile update to identify potential issues...\n');

  try {
    // Get first profile
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (fetchError) {
      console.error('❌ Error fetching profile:', fetchError);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.log('❌ No profiles found to test');
      return;
    }

    const profile = profiles[0];
    console.log(`📊 Testing profile: ${profile.id}`);
    console.log(`📝 Current data:`, {
      name: profile.name,
      phone_number: profile.phone_number,
      dietary_preferences: profile.dietary_preferences,
      allergies: profile.allergies,
      notification_preferences: profile.notification_preferences
    });

    // Test 1: Simple update with minimal data
    console.log('\n🔧 Test 1: Simple update...');
    const startTime1 = Date.now();

    const { data: test1, error: error1 } = await supabase
      .from('profiles')
      .update({
        name: profile.name || 'Test Name',
        bio: profile.bio || 'Test bio'
      })
      .eq('id', profile.id)
      .select('name, bio')
      .single();

    const endTime1 = Date.now();

    if (error1) {
      console.error('❌ Error in test 1:', error1);
    } else {
      console.log(`✅ Test 1 success (${endTime1 - startTime1}ms):`, test1);
    }

    // Test 2: Update with arrays (dietary_preferences and allergies)
    console.log('\n🔧 Test 2: Update with arrays...');
    const startTime2 = Date.now();

    const { data: test2, error: error2 } = await supabase
      .from('profiles')
      .update({
        dietary_preferences: ['vegetarian', 'gluten_free'],
        allergies: ['nuts', 'shellfish']
      })
      .eq('id', profile.id)
      .select('dietary_preferences, allergies')
      .single();

    const endTime2 = Date.now();

    if (error2) {
      console.error('❌ Error in test 2:', error2);
    } else {
      console.log(`✅ Test 2 success (${endTime2 - startTime2}ms):`, test2);
    }

    // Test 3: Update with notification_preferences JSON
    console.log('\n🔧 Test 3: Update with notification preferences...');
    const startTime3 = Date.now();

    const { data: test3, error: error3 } = await supabase
      .from('profiles')
      .update({
        notification_preferences: {
          email: true,
          push: true,
          sms: false,
          daycare_pickup_backup: false
        }
      })
      .eq('id', profile.id)
      .select('notification_preferences')
      .single();

    const endTime3 = Date.now();

    if (error3) {
      console.error('❌ Error in test 3:', error3);
    } else {
      console.log(`✅ Test 3 success (${endTime3 - startTime3}ms):`, test3);
    }

    // Test 4: Full update (like the component does)
    console.log('\n🔧 Test 4: Full update (component simulation)...');
    const startTime4 = Date.now();

    const { data: test4, error: error4 } = await supabase
      .from('profiles')
      .update({
        name: profile.name || 'Test Name',
        preferred_name: profile.preferred_name,
        phone_number: profile.phone_number,
        date_of_birth: profile.date_of_birth,
        timezone: profile.timezone || 'America/New_York',
        language: profile.language || 'en',
        bio: profile.bio,
        dietary_preferences: profile.dietary_preferences || [],
        allergies: profile.allergies || [],
        notification_preferences: {
          email: true,
          push: true,
          sms: false,
          daycare_pickup_backup: false
        }
      })
      .eq('id', profile.id)
      .select('*');

    const endTime4 = Date.now();

    if (error4) {
      console.error('❌ Error in test 4:', error4);
      console.log('📋 Error details:', {
        message: error4.message,
        details: error4.details,
        hint: error4.hint,
        code: error4.code
      });
    } else {
      console.log(`✅ Test 4 success (${endTime4 - startTime4}ms)`);
      console.log(
        `📊 Updated profile completion: ${test4[0]?.profile_completion_percentage}%`
      );
    }

    // Test 5: Check for hanging connections
    console.log('\n🔧 Test 5: Connection timeout test...');
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Operation timed out after 10 seconds')),
        10000
      )
    );

    const updatePromise = supabase
      .from('profiles')
      .update({ bio: `Test at ${new Date().toISOString()}` })
      .eq('id', profile.id)
      .select('bio');

    try {
      const result = await Promise.race([updatePromise, timeoutPromise]);
      console.log('✅ No timeout issues detected');
    } catch (timeoutError) {
      console.error('❌ Timeout detected:', timeoutError.message);
    }
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testProfileUpdate();
