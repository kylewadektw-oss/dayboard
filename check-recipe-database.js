const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRecipeDatabase() {
  console.log('🍳 Checking Recipe Database...\n');

  try {
    // Check if recipes table exists and has data
    const { data: recipes, error: recipesError, count } = await supabase
      .from('recipes')
      .select('*', { count: 'exact' })
      .limit(5);

    console.log('📊 Recipe Database Status:');
    if (recipesError) {
      console.log('❌ Error accessing recipes table:', recipesError.message);
      console.log('💡 This might mean the table doesn\'t exist or permissions are missing');
    } else {
      console.log(`✅ Found ${count} total recipes in database`);
      console.log('📝 Sample recipes:');
      recipes?.forEach((recipe, index) => {
        console.log(`${index + 1}. ${recipe.title} (${recipe.cuisine || 'Unknown cuisine'})`);
      });
    }

    // Check API endpoint
    console.log('\n🔌 Testing Recipe API Endpoint...');
    try {
      // Since we can't make HTTP requests in Node.js to relative URLs, 
      // let's check the API configuration instead
      const hasApiKey = !!process.env.SPOONACULAR_API_KEY;
      const isValidKey = process.env.SPOONACULAR_API_KEY && 
                        process.env.SPOONACULAR_API_KEY !== 'your_spoonacular_api_key_here' &&
                        process.env.SPOONACULAR_API_KEY !== 'your_api_key_here';
      
      console.log('🔑 API Configuration:');
      console.log(`  - API Key present: ${hasApiKey ? '✅' : '❌'}`);
      console.log(`  - API Key valid: ${isValidKey ? '✅' : '❌'}`);
      
      if (!isValidKey) {
        console.log('❌ API key appears to be a placeholder. Please set a real Spoonacular API key.');
      }
      
    } catch (apiError) {
      console.log('❌ API Test Error:', apiError.message);
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    if (count === 0) {
      console.log('1. 📥 Database is empty - use the "Fetch Recipes" button to populate it');
      console.log('2. 🔍 Try fetching recipes with different search terms (e.g., "chicken", "pasta", "vegetarian")');
      console.log('3. 🎯 Use the Recipe Library\'s fetch functionality to get started');
    } else {
      console.log('1. ✅ Database has recipes - the Recipe Library should display them');
      console.log('2. 🔍 If recipes aren\'t showing, check the component\'s database query');
      console.log('3. 🔧 Verify the recipe filtering and search functionality');
    }

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your .env file has correct Supabase credentials');
    console.log('2. Verify your Supabase project is running');
    console.log('3. Check if recipes table exists in your database');
  }
}

checkRecipeDatabase();
