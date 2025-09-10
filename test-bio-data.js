// 🔍 CHECK CURRENT BIO DATA
// Quick test to check what bio data exists in the profile

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zufrmaxlmbjhwuuvqzwj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1ZnJtYXhsbWJqaHd1dXZxendqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU5MTU4MjYsImV4cCI6MjA0MTQ5MTgyNn0.qGayQFKD-wOBGlCXhfYJM5lKlLqNHWB6e9P7ZwNrFzk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBioData() {
  console.log('🔍 Checking bio data for current user...');
  
  try {
    // Check bio in profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, name, bio, preferred_name')
      .eq('user_id', '0139a6fc-bf13-426d-8929-604051c4d1f4')
      .single();

    if (error) {
      console.error('❌ Error fetching profile:', error);
      return;
    }

    console.log('✅ Profile data found:');
    console.log('  - ID:', profile.id);
    console.log('  - Name:', profile.name);
    console.log('  - Preferred Name:', profile.preferred_name);
    console.log('  - Bio:', profile.bio || '(empty/null)');
    console.log('  - Bio length:', (profile.bio || '').length);
    console.log('  - Bio type:', typeof profile.bio);

    if (!profile.bio) {
      console.log('\n⚠️  Bio is empty/null. This explains why it\'s not showing up!');
      console.log('   Try adding a bio in the profile edit form.');
    } else {
      console.log('\n✅ Bio exists! It should be displaying on the profile page.');
      console.log('   Check you\'re looking at /profile page, not dashboard ProfileStatus widget.');
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkBioData();
