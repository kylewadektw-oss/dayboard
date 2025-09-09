require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function completeOnboarding() {
  console.log('🔧 Completing onboarding for user profile...');
  
  try {
    // First, let's check current status
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', '0139a6fc-bf13-426d-8929-604051c4d1f4')
      .single();

    console.log('📊 Current profile status:');
    console.log('  - Name:', currentProfile.name);
    console.log('  - Household ID:', currentProfile.household_id);
    console.log('  - Onboarding Complete:', currentProfile.onboarding_completed);
    console.log('  - Profile %:', currentProfile.profile_completion_percentage);

    // Update the profile
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        onboarding_completed: true,
        profile_completion_percentage: 95
      })
      .eq('user_id', '0139a6fc-bf13-426d-8929-604051c4d1f4')
      .select();

    if (error) {
      console.error('❌ Error updating profile:', error);
      return;
    }

    console.log('✅ Profile updated successfully!');
    console.log('🎉 You should now be able to access the dashboard directly!');
    console.log('📱 Try refreshing your browser or visiting /dashboard');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

completeOnboarding();
