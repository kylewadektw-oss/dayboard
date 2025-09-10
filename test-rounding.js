require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function forceRecalculation() {
  console.log('🔧 Force recalculating profile completion...');
  
  try {
    // Get first profile with all details
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (!profiles || profiles.length === 0) {
      console.log('❌ No profiles found');
      return;
    }
    
    const profile = profiles[0];
    console.log(`📊 Current profile completion: ${profile.profile_completion_percentage}%`);
    
    // Force trigger by updating a field that will cause recalculation
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({ 
        name: profile.name // Update with same value to force trigger
      })
      .eq('id', profile.id)
      .select('profile_completion_percentage, name, phone_number, date_of_birth, bio, timezone, language, dietary_preferences, allergies, avatar_url')
      .single();
    
    if (error) {
      console.error('❌ Error forcing recalculation:', error);
      return;
    }
    
    console.log(`📊 After forced recalculation: ${updatedProfile.profile_completion_percentage}%`);
    
    // Manually count fields to verify
    let filledCount = 0;
    if (updatedProfile.name) filledCount++;
    if (updatedProfile.phone_number) filledCount++;
    if (updatedProfile.date_of_birth) filledCount++;
    if (updatedProfile.bio) filledCount++;
    if (updatedProfile.timezone) filledCount++;
    if (updatedProfile.language) filledCount++;
    if (updatedProfile.dietary_preferences?.length > 0) filledCount++;
    if (updatedProfile.allergies?.length > 0) filledCount++;
    if (updatedProfile.avatar_url) filledCount++;
    
    const exactPercentage = (filledCount * 100) / 9;
    const expectedRounded = Math.round(exactPercentage);
    
    console.log(`\n📋 Field count: ${filledCount}/9`);
    console.log(`📊 Exact: ${exactPercentage.toFixed(2)}%`);
    console.log(`📊 Expected rounded: ${expectedRounded}%`);
    console.log(`📊 Database shows: ${updatedProfile.profile_completion_percentage}%`);
    
    if (updatedProfile.profile_completion_percentage === expectedRounded) {
      console.log('✅ Rounding is working correctly!');
    } else {
      console.log('❌ Rounding may still have an issue');
    }
    
  } catch (error) {
    console.error('💥 Error during force recalculation:', error);
  }
}

forceRecalculation();
