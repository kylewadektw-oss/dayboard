const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

async function testRecipeFetching() {
  console.log('🍳 Testing Recipe API Fetch Functionality...\n');

  try {
    // Test the API endpoint directly
    const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
    
    if (!SPOONACULAR_API_KEY || SPOONACULAR_API_KEY === 'your_spoonacular_api_key_here') {
      console.log('❌ Invalid API key configuration');
      return;
    }

    // Test direct Spoonacular API call
    console.log('1. Testing direct Spoonacular API...');
    const spoonacularUrl = `https://api.spoonacular.com/recipes/complexSearch?query=chicken&number=3&apiKey=${SPOONACULAR_API_KEY}&addRecipeInformation=true&fillIngredients=true`;
    
    const response = await fetch(spoonacularUrl);
    console.log('API Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ API Error:', errorText);
      return;
    }

    const data = await response.json();
    console.log(`✅ Successfully fetched ${data.results?.length || 0} recipes from Spoonacular`);
    
    if (data.results && data.results.length > 0) {
      console.log('📝 Sample recipes from API:');
      data.results.slice(0, 2).forEach((recipe, index) => {
        console.log(`${index + 1}. ${recipe.title} (${recipe.readyInMinutes} min)`);
      });
    }

    // Test our database insertion
    console.log('\n2. Testing database insertion...');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Try to insert a test recipe
    const testRecipe = {
      title: 'Test Recipe from API',
      description: 'A test recipe to verify database insertion',
      image_emoji: '🧪',
      total_time_minutes: 30,
      prep_time_minutes: 10,
      cook_time_minutes: 20,
      servings: 4,
      difficulty: 'easy',
      meal_type: ['dinner'],
      diet_types: [],
      ingredients: [
        { name: 'test ingredient', amount: '1', unit: 'cup' }
      ],
      instructions: ['Test instruction 1', 'Test instruction 2'],
      tags: ['test', 'api'],
      rating: 0,
      rating_count: 0,
      is_favorite: false,
      is_public: true,
      is_verified: false,
      created_by: 'api-test',
      household_id: null,
      cuisine: 'Test'
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
    }

    // Check total recipes count after insertion
    const { count } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Total recipes in database: ${count}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRecipeFetching();
