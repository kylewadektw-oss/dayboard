const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

async function testUpdatedRecipeFetch() {
  console.log('🍳 Testing Updated Recipe Fetch System...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Test database insertion with correct schema
    console.log('1. Testing direct database insertion...');
    
    const testRecipe = {
      user_id: 'test-user-id',
      household_id: null,
      title: 'Test Recipe Direct Insert',
      description: 'A test recipe using the correct database schema',
      ingredients: [
        { name: 'test ingredient', amount: '1', unit: 'cup' }
      ],
      instructions: ['Test instruction 1', 'Test instruction 2'],
      prep_time: 10,
      cook_time: 20,
      servings: 4,
      difficulty: 'easy',
      cuisine: 'Test',
      dietary_tags: ['test'],
      source_url: 'https://test.com',
      image_url: 'https://test.com/image.jpg'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('recipes')
      .insert([testRecipe])
      .select();

    if (insertError) {
      console.log('❌ Database insertion error:', insertError.message);
    } else {
      console.log('✅ Successfully inserted test recipe into database');
      console.log(`  Recipe ID: ${insertData[0]?.id}`);
      console.log(`  Title: ${insertData[0]?.title}`);
    }

    // Test loading recipes from database
    console.log('\n2. Testing recipe loading from database...');
    
    const { data: recipes, error: loadError } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (loadError) {
      console.log('❌ Error loading recipes:', loadError.message);
    } else {
      console.log(`✅ Successfully loaded ${recipes?.length || 0} recipes from database`);
      recipes?.forEach((recipe, index) => {
        console.log(`${index + 1}. ${recipe.title} (${recipe.cuisine})`);
        console.log(`   Prep: ${recipe.prep_time}min, Cook: ${recipe.cook_time}min`);
      });
    }

    // Check total count
    const { count } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true });

    console.log(`\n📊 Total recipes in database: ${count}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUpdatedRecipeFetch();
