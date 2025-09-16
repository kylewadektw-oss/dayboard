require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function updateTriggerFunction() {
  console.log(
    '🔧 Updating profile completion trigger function to remove notification requirement...'
  );

  const functionSQL = `
    CREATE OR REPLACE FUNCTION public.set_profile_completion()
    RETURNS trigger AS $$
    DECLARE
      total integer := 9;  -- Changed from 10 to 9 (removing notification preferences)
      filled integer := 0;
      pct integer := 0;
    BEGIN
      -- 1. Name (name OR preferred_name)
      IF coalesce(nullif(trim(NEW.name),''), nullif(trim(NEW.preferred_name),'')) IS NOT NULL THEN filled := filled + 1; END IF;
      
      -- 2. Phone
      IF coalesce(nullif(trim(NEW.phone_number),'')) IS NOT NULL THEN filled := filled + 1; END IF;
      
      -- 3. Date of birth
      IF NEW.date_of_birth IS NOT NULL THEN filled := filled + 1; END IF;
      
      -- 4. Bio
      IF coalesce(nullif(trim(NEW.bio),'')) IS NOT NULL THEN filled := filled + 1; END IF;
      
      -- 5. Timezone
      IF coalesce(nullif(trim(NEW.timezone),'')) IS NOT NULL THEN filled := filled + 1; END IF;
      
      -- 6. Language
      IF coalesce(nullif(trim(NEW.language),'')) IS NOT NULL THEN filled := filled + 1; END IF;
      
      -- 7. Dietary preferences
      IF NEW.dietary_preferences IS NOT NULL AND array_length(NEW.dietary_preferences,1) > 0 THEN filled := filled + 1; END IF;
      
      -- 8. Allergies
      IF NEW.allergies IS NOT NULL AND array_length(NEW.allergies,1) > 0 THEN filled := filled + 1; END IF;
      
      -- 9. Avatar
      IF coalesce(nullif(trim(NEW.avatar_url),'')) IS NOT NULL THEN filled := filled + 1; END IF;
      
      -- Removed notification preferences requirement (was #10)

      pct := (filled * 100 / total);
      IF pct > 100 THEN pct := 100; END IF;
      NEW.profile_completion_percentage := pct;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  try {
    const { data, error } = await supabase.rpc('exec', { sql: functionSQL });
    if (error) {
      console.error('❌ Error updating function:', error);
      return false;
    }
    console.log('✅ Function updated successfully');
    return true;
  } catch (error) {
    console.error('💥 Error:', error);
    return false;
  }
}

async function updateTrigger() {
  console.log(
    '🔧 Updating profile completion trigger (removing notification_preferences)...'
  );

  const triggerSQL = `
    DROP TRIGGER IF EXISTS trg_set_profile_completion ON profiles;
    CREATE TRIGGER trg_set_profile_completion
    BEFORE INSERT OR UPDATE OF name, preferred_name, phone_number, date_of_birth, bio, timezone, language, dietary_preferences, allergies, avatar_url
    ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_profile_completion();
  `;

  try {
    const { data, error } = await supabase.rpc('exec', { sql: triggerSQL });
    if (error) {
      console.error('❌ Error updating trigger:', error);
      return false;
    }
    console.log('✅ Trigger updated successfully');
    return true;
  } catch (error) {
    console.error('💥 Error:', error);
    return false;
  }
}

async function recalculateAllProfiles() {
  console.log('🔄 Recalculating profile completion for all profiles...');

  try {
    // Get all profiles
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, profile_completion_percentage');

    if (fetchError) {
      console.error('❌ Error fetching profiles:', fetchError);
      return;
    }

    console.log(`📊 Found ${profiles.length} profiles to recalculate`);

    // Update each profile to trigger recalculation
    for (const profile of profiles) {
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          updated_at: new Date().toISOString() // Trigger the function
        })
        .eq('id', profile.id)
        .select('profile_completion_percentage')
        .single();

      if (updateError) {
        console.error(`❌ Error updating profile ${profile.id}:`, updateError);
        continue;
      }

      if (
        profile.profile_completion_percentage !==
        updatedProfile.profile_completion_percentage
      ) {
        console.log(
          `📈 Profile ${profile.id}: ${profile.profile_completion_percentage}% → ${updatedProfile.profile_completion_percentage}%`
        );
      }
    }

    console.log('✅ All profiles recalculated');
  } catch (error) {
    console.error('💥 Error recalculating profiles:', error);
  }
}

async function testUpdatedCalculation() {
  console.log(
    '🧪 Testing updated calculation without notification requirement...'
  );

  try {
    // Get first profile
    const { data: profiles } = await supabase
      .from('profiles')
      .select(
        'id, profile_completion_percentage, name, phone_number, date_of_birth, bio, timezone, language, dietary_preferences, allergies, avatar_url, notification_preferences'
      )
      .limit(1);

    if (!profiles || profiles.length === 0) {
      console.log('❌ No profiles found to test');
      return;
    }

    const profile = profiles[0];
    console.log(
      `📊 Profile ${profile.id} completion: ${profile.profile_completion_percentage}%`
    );

    // Show what fields are filled
    let filledFields = [];
    if (profile.name || profile.preferred_name) filledFields.push('name');
    if (profile.phone_number) filledFields.push('phone');
    if (profile.date_of_birth) filledFields.push('birthday');
    if (profile.bio) filledFields.push('bio');
    if (profile.timezone) filledFields.push('timezone');
    if (profile.language) filledFields.push('language');
    if (profile.dietary_preferences?.length > 0) filledFields.push('dietary');
    if (profile.allergies?.length > 0) filledFields.push('allergies');
    if (profile.avatar_url) filledFields.push('avatar');

    console.log(
      `✅ Filled fields (${filledFields.length}/9): ${filledFields.join(', ')}`
    );
    console.log(
      `📊 Expected percentage: ${Math.round((filledFields.length * 100) / 9)}%`
    );
    console.log(
      `📊 Actual percentage: ${profile.profile_completion_percentage}%`
    );

    console.log(
      '\n🎉 Notification preferences are no longer required for profile completion!'
    );
  } catch (error) {
    console.error('💥 Error testing calculation:', error);
  }
}

async function main() {
  console.log(
    '🚀 Removing notification requirement from profile completion...\n'
  );

  const functionSuccess = await updateTriggerFunction();
  if (!functionSuccess) {
    console.log('❌ Failed to update function, stopping');
    return;
  }

  const triggerSuccess = await updateTrigger();
  if (!triggerSuccess) {
    console.log('❌ Failed to update trigger, stopping');
    return;
  }

  await recalculateAllProfiles();
  await testUpdatedCalculation();

  console.log('\n✅ Notification requirement removed successfully!');
  console.log(
    '🎯 Profile completion is now based on 9 criteria instead of 10.'
  );
  console.log(
    '📋 Criteria: name, phone, birthday, bio, timezone, language, dietary preferences, allergies, avatar'
  );
}

main();
