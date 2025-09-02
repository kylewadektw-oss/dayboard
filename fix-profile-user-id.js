const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://csbwewirwzeitavhvykr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYndld2lyd3plaXRhdmh2eWtyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM1ODc2MiwiZXhwIjoyMDcxOTM0NzYyfQ.9cYI_QLZEqI6HmTmhUKKmI0xeP37Xe1Jt5CJhQgOfF8'
);

async function fixProfileUserId() {
  console.log('🔧 Profile User ID Fix Utility');
  console.log('=====================================');
  
  // Get current profile
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*');
    
  if (profileError) {
    console.error('❌ Error fetching profiles:', profileError);
    return;
  }
  
  if (!profiles || profiles.length === 0) {
    console.log('📭 No profiles found in database');
    return;
  }
  
  console.log('📊 Current profiles:');
  profiles.forEach((profile, index) => {
    console.log(`  ${index + 1}. Name: ${profile.name}`);
    console.log(`     Current user_id: ${profile.user_id}`);
    console.log(`     Email: ${profile.email || 'Not set'}`);
    console.log(`     Household: ${profile.household_id || 'None'}`);
    console.log('');
  });
  
  // Get auth users
  console.log('🔐 Current auth users:');
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError) {
    console.error('❌ Error fetching auth users:', usersError);
    return;
  }
  
  if (!users || users.length === 0) {
    console.log('📭 No auth users found');
    return;
  }
  
  users.forEach((user, index) => {
    console.log(`  ${index + 1}. Auth User ID: ${user.id}`);
    console.log(`     Email: ${user.email}`);
    console.log(`     Created: ${user.created_at}`);
    console.log(`     Last Sign In: ${user.last_sign_in_at || 'Never'}`);
    console.log('');
  });
  
  // If there's exactly one profile and one auth user, offer to update
  if (profiles.length === 1 && users.length === 1) {
    const profile = profiles[0];
    const authUser = users[0];
    
    if (profile.user_id !== authUser.id) {
      console.log('🔄 AUTOMATIC FIX AVAILABLE:');
      console.log(`   Profile "${profile.name}" has user_id: ${profile.user_id}`);
      console.log(`   Auth user "${authUser.email}" has user_id: ${authUser.id}`);
      console.log('');
      console.log('   This mismatch is causing the "new user" behavior.');
      console.log('');
      
      // Perform the update
      console.log('🔧 Updating profile user_id to match auth user...');
      
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ user_id: authUser.id })
        .eq('user_id', profile.user_id)
        .select();
        
      if (updateError) {
        console.error('❌ Error updating profile:', updateError);
        return;
      }
      
      console.log('✅ Profile updated successfully!');
      console.log('   Updated profile:', updateData[0]);
      console.log('');
      console.log('🎉 Your profile should now work correctly with OAuth!');
      console.log('   Try signing in again - you should see your existing profile.');
      
    } else {
      console.log('✅ Profile user_id already matches auth user - no fix needed!');
    }
  } else {
    console.log('⚠️ Multiple profiles or auth users found - manual review needed');
    console.log('   Please check which profile and auth user should be linked.');
  }
}

fixProfileUserId().catch(console.error);
