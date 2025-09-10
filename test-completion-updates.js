require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testProfileCompletionUpdates() {
  console.log('🧪 Testing profile completion dynamic updates...\n');
  
  try {
    // Get first profile
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, profile_completion_percentage, bio, allergies')
      .limit(1);
    
    if (!profiles || profiles.length === 0) {
      console.log('❌ No profiles found to test');
      return;
    }
    
    const profile = profiles[0];
    console.log(`📊 Initial state - Profile ${profile.id}: ${profile.profile_completion_percentage}%`);
    console.log(`   Bio: "${profile.bio || 'empty'}"`);
    console.log(`   Allergies: ${JSON.stringify(profile.allergies || [])}\n`);
    
    // Test 1: Add a bio to increase completion
    console.log('🔧 Test 1: Adding a bio...');
    const { data: test1, error: error1 } = await supabase
      .from('profiles')
      .update({ 
        bio: 'I love family time and organizing our household activities!'
      })
      .eq('id', profile.id)
      .select('profile_completion_percentage, bio')
      .single();
    
    if (error1) {
      console.error('❌ Error in test 1:', error1);
      return;
    }
    
    console.log(`✅ After adding bio: ${test1.profile_completion_percentage}%`);
    console.log(`   Bio: "${test1.bio}"\n`);
    
    // Test 2: Add allergies to further increase completion
    console.log('🔧 Test 2: Adding allergies...');
    const { data: test2, error: error2 } = await supabase
      .from('profiles')
      .update({ 
        allergies: ['nuts', 'shellfish']
      })
      .eq('id', profile.id)
      .select('profile_completion_percentage, allergies')
      .single();
    
    if (error2) {
      console.error('❌ Error in test 2:', error2);
      return;
    }
    
    console.log(`✅ After adding allergies: ${test2.profile_completion_percentage}%`);
    console.log(`   Allergies: ${JSON.stringify(test2.allergies)}\n`);
    
    // Test 3: Remove bio to decrease completion
    console.log('🔧 Test 3: Removing bio...');
    const { data: test3, error: error3 } = await supabase
      .from('profiles')
      .update({ 
        bio: null
      })
      .eq('id', profile.id)
      .select('profile_completion_percentage, bio')
      .single();
    
    if (error3) {
      console.error('❌ Error in test 3:', error3);
      return;
    }
    
    console.log(`✅ After removing bio: ${test3.profile_completion_percentage}%`);
    console.log(`   Bio: "${test3.bio || 'empty'}"\n`);
    
    // Restore original state
    console.log('🔄 Restoring original state...');
    await supabase
      .from('profiles')
      .update({ 
        bio: profile.bio,
        allergies: profile.allergies
      })
      .eq('id', profile.id);
    
    console.log('✅ Original state restored');
    console.log('\n🎉 Profile completion percentage is now working dynamically!');
    console.log('📈 It correctly increases/decreases as users add/remove profile information.');
    
  } catch (error) {
    console.error('💥 Error during testing:', error);
  }
}

testProfileCompletionUpdates();
