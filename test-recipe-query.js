const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testRecipeQuery() {
  console.log('🔍 Testing Recipe Library Database Query...\n');

  try {
    // Test the exact query used in RecipeLibrary component
    console.log('1. Testing basic query...');
    const { data: basicData, error: basicError } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (basicError) {
      console.log('❌ Basic query error:', basicError.message);
      return;
    }

    console.log(`✅ Basic query found ${basicData?.length || 0} recipes`);
    basicData?.forEach(recipe => {
      console.log(`  - ${recipe.title} (ID: ${recipe.id})`);
    });

    // Test query with creator join
    console.log('\n2. Testing query with creator join...');
    const { data: joinData, error: joinError } = await supabase
      .from('recipes')
      .select(`
        *,
        creator:profiles!recipes_created_by_fkey(id, name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (joinError) {
      console.log('❌ Join query error:', joinError.message);
      console.log('💡 This might mean the foreign key relationship doesn\'t exist');
      
      // Try without the join
      console.log('\n3. Testing without creator join...');
      const { data: noJoinData, error: noJoinError } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (noJoinError) {
        console.log('❌ Even basic query failed:', noJoinError.message);
      } else {
        console.log(`✅ Query without join works: ${noJoinData?.length || 0} recipes`);
        setRecipes(noJoinData || []);
      }
    } else {
      console.log(`✅ Join query successful: ${joinData?.length || 0} recipes`);
      joinData?.forEach(recipe => {
        console.log(`  - ${recipe.title} by ${recipe.creator?.name || 'Unknown'}`);
      });
    }

    // Test search functionality
    console.log('\n4. Testing search functionality...');
    const searchTerm = 'test';
    const { data: searchData, error: searchError } = await supabase
      .from('recipes')
      .select('*')
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (searchError) {
      console.log('❌ Search query error:', searchError.message);
    } else {
      console.log(`✅ Search for "${searchTerm}" found ${searchData?.length || 0} recipes`);
    }

  } catch (error) {
    console.error('❌ Query test failed:', error.message);
  }
}

testRecipeQuery();
