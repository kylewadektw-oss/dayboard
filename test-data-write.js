const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: ['.env.local', '.env'] });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function addTestData() {
  console.log('🧪 ADDING TEST DATA TO VERIFY WRITE ACCESS');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Add a test recipe
    console.log('\n1. Adding test recipe...');
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        title: 'Test Pancakes',
        description: 'Simple test pancakes for Supabase verification',
        image_emoji: '🥞',
        prep_time_minutes: 10,
        cook_time_minutes: 15,
        total_time_minutes: 25,
        servings: 4,
        difficulty: 'easy',
        cuisine: 'American',
        meal_type: ['breakfast'],
        diet_types: ['none'],
        tags: ['test', 'quick'],
        ingredients: [
          { name: 'Flour', amount: '2 cups', unit: 'cups' },
          { name: 'Milk', amount: '1.5 cups', unit: 'cups' },
          { name: 'Eggs', amount: '2', unit: 'whole' }
        ],
        instructions: [
          'Mix dry ingredients',
          'Add wet ingredients', 
          'Cook on griddle'
        ],
        rating: 4.5,
        rating_count: 1,
        household_id: 'test-household',
        created_by: 'test-user',
        is_favorite: false,
        is_public: false,
        is_verified: true
      })
      .select()
      .single();
    
    if (recipeError) {
      console.log('❌ Recipe creation failed:', recipeError.message);
    } else {
      console.log('✅ Test recipe created:', recipe.title);
      
      // Test 2: Add a meal plan using this recipe
      console.log('\n2. Adding test meal plan...');
      const { data: mealPlan, error: mealPlanError } = await supabase
        .from('meal_plans')
        .insert({
          recipe_id: recipe.id,
          household_id: 'test-household',
          planned_by: 'test-user',
          planned_date: '2025-09-11',
          meal_type: 'breakfast',
          servings_planned: 4,
          status: 'planned'
        })
        .select()
        .single();
      
      if (mealPlanError) {
        console.log('❌ Meal plan creation failed:', mealPlanError.message);
      } else {
        console.log('✅ Test meal plan created for:', mealPlan.planned_date);
      }
    }
    
    // Test 3: Verify we can read the data back
    console.log('\n3. Verifying data retrieval...');
    const { data: recipes, error: readError } = await supabase
      .from('recipes')
      .select('title, servings, meal_type')
      .limit(5);
    
    if (readError) {
      console.log('❌ Data retrieval failed:', readError.message);
    } else {
      console.log('✅ Current recipes in database:');
      recipes?.forEach((r, i) => {
        console.log(`   ${i+1}. ${r.title} (${r.servings} servings, ${r.meal_type?.join(', ')})`);
      });
    }
    
  } catch (error) {
    console.error('🚨 Test failed:', error.message);
  }
}

addTestData();
