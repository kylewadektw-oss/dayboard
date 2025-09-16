/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * Quick script to check current user bio
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBio() {
  try {
    console.log('🔍 Checking user profiles and bio data...');

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, user_id, name, preferred_name, bio, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Error fetching profiles:', error);
      return;
    }

    console.log('📋 Found', profiles?.length || 0, 'profiles:');
    profiles?.forEach((profile, index) => {
      console.log(`\n${index + 1}. Profile:`, {
        id: profile.id,
        user_id: profile.user_id,
        name: profile.name,
        preferred_name: profile.preferred_name,
        bio: profile.bio,
        hasBio: !!profile.bio,
        bioLength: profile.bio?.length || 0
      });
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBio();
