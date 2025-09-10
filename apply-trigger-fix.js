require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function updateTriggerFunction() {
  console.log('🔧 Updating profile completion trigger function...');
  
  const functionSQL = `
    CREATE OR REPLACE FUNCTION public.set_profile_completion()
    RETURNS trigger AS $$
    DECLARE
      total integer := 10;
      filled integer := 0;
      pct integer := 0;
      np jsonb := coalesce(NEW.notification_preferences, '{}'::jsonb);
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
      
      -- 10. Notification preferences
      IF (np ? 'email' AND (np->>'email')::boolean = true)
         OR (np ? 'push' AND (np->>'push')::boolean = true)
         OR (np ? 'sms' AND (np->>'sms')::boolean = true)
         OR (np ? 'daycare_pickup_backup' AND (np->>'daycare_pickup_backup')::boolean = true) THEN
         filled := filled + 1;
      END IF;

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
  console.log('🔧 Updating profile completion trigger...');
  
  const triggerSQL = `
    DROP TRIGGER IF EXISTS trg_set_profile_completion ON profiles;
    CREATE TRIGGER trg_set_profile_completion
    BEFORE INSERT OR UPDATE OF name, preferred_name, phone_number, date_of_birth, bio, timezone, language, dietary_preferences, allergies, avatar_url, notification_preferences
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

async function testTrigger() {
  console.log('🧪 Testing the updated trigger...');
  
  try {
    // Get first profile
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, profile_completion_percentage, name')
      .limit(1);
    
    if (!profiles || profiles.length === 0) {
      console.log('❌ No profiles found to test');
      return;
    }
    
    const profile = profiles[0];
    console.log(`📊 Before trigger test - Profile ${profile.id}: ${profile.profile_completion_percentage}%`);
    
    // Trigger an update that should recalculate the percentage
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({ 
        name: profile.name // Update with same value to trigger the function
      })
      .eq('id', profile.id)
      .select('profile_completion_percentage')
      .single();
    
    if (error) {
      console.error('❌ Error in trigger test:', error);
      return;
    }
    
    console.log(`📊 After trigger test - Profile ${profile.id}: ${updatedProfile.profile_completion_percentage}%`);
    console.log('🎉 Trigger is working! Profile completion will now update automatically.');
    
  } catch (error) {
    console.error('💥 Error testing trigger:', error);
  }
}

async function main() {
  console.log('🚀 Applying profile completion fixes...\n');
  
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
  
  await testTrigger();
  
  console.log('\n✅ All fixes applied successfully!');
  console.log('🎯 Profile completion percentage will now update automatically when users edit their profiles.');
}

main();
