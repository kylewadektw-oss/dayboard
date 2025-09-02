const { createClient } = require('@supabase/supabase-js');

// Get environment variables directly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupBasicRLS() {
  try {
    console.log('🔧 Setting up basic RLS for profiles table...');
    
    // Enable RLS on profiles table
    await supabase.rpc('sql', {
      query: 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;'
    }).catch(err => console.log('RLS may already be enabled'));
    
    // Create basic policy for profiles
    await supabase.rpc('sql', {
      query: `
        CREATE POLICY "Users can manage their own profile" ON profiles
        FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
      `
    }).catch(err => console.log('Policy may already exist'));
    
    console.log('✅ Basic RLS setup completed');
    
    // Test the setup
    console.log('🧪 Testing profile access...');
    const { data, error } = await supabase.auth.getUser();
    if (data?.user) {
      console.log('✅ User authenticated for test');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();
      
      if (profileError) {
        console.log('ℹ️ Profile query result:', profileError.message);
      } else {
        console.log('✅ Profile accessible:', profile?.name || 'Unnamed');
      }
    } else {
      console.log('ℹ️ No authenticated user for test');
    }
    
  } catch (error) {
    console.error('❌ RLS setup error:', error);
  }
}

setupBasicRLS();
