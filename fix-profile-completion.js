require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixProfileCompletion() {
  console.log('🔧 Fixing profile completion calculation...');
  
  try {
    // Get all profiles to recalculate their completion percentage
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        id, 
        name, 
        preferred_name, 
        phone_number, 
        date_of_birth, 
        bio, 
        timezone, 
        language, 
        dietary_preferences, 
        allergies, 
        avatar_url, 
        notification_preferences,
        profile_completion_percentage
      `);
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }
    
    console.log(`📊 Found ${profiles.length} profiles to update`);
    
    for (const profile of profiles) {
      let filled = 0;
      const total = 10;
      
      // 1. Name (name OR preferred_name)
      if ((profile.name && profile.name.trim()) || (profile.preferred_name && profile.preferred_name.trim())) {
        filled++;
      }
      
      // 2. Phone
      if (profile.phone_number && profile.phone_number.trim()) {
        filled++;
      }
      
      // 3. Date of birth
      if (profile.date_of_birth) {
        filled++;
      }
      
      // 4. Bio
      if (profile.bio && profile.bio.trim()) {
        filled++;
      }
      
      // 5. Timezone
      if (profile.timezone && profile.timezone.trim()) {
        filled++;
      }
      
      // 6. Language
      if (profile.language && profile.language.trim()) {
        filled++;
      }
      
      // 7. Dietary preferences
      if (profile.dietary_preferences && Array.isArray(profile.dietary_preferences) && profile.dietary_preferences.length > 0) {
        filled++;
      }
      
      // 8. Allergies
      if (profile.allergies && Array.isArray(profile.allergies) && profile.allergies.length > 0) {
        filled++;
      }
      
      // 9. Avatar
      if (profile.avatar_url && profile.avatar_url.trim()) {
        filled++;
      }
      
      // 10. Notification preferences
      const notifPrefs = profile.notification_preferences || {};
      if (notifPrefs.email === true || notifPrefs.push === true || notifPrefs.sms === true || notifPrefs.daycare_pickup_backup === true) {
        filled++;
      }
      
      const newPercentage = Math.floor((filled * 100) / total);
      
      console.log(`� Profile ${profile.id}: ${profile.profile_completion_percentage}% → ${newPercentage}% (${filled}/${total} criteria filled)`);
      
      // Update the profile with the calculated percentage
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_completion_percentage: newPercentage })
        .eq('id', profile.id);
      
      if (updateError) {
        console.error(`❌ Error updating profile ${profile.id}:`, updateError);
      }
    }
    
    console.log('✅ Profile completion percentages updated successfully!');
    console.log('🎉 The trigger should now work correctly for future updates!');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

fixProfileCompletion();
