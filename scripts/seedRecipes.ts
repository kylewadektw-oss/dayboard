// Recipe data seeding script for Supabase
// Run this script to populate your recipes table with real data

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Default household ID (you can change this)
const DEFAULT_HOUSEHOLD_ID = 'temp-household-id'

// Helper function to categorize recipes
function categorizeRecipe(meal: any) {
  const mealName = meal.strMeal.toLowerCase()
  const category = meal.strCategory?.toLowerCase() || ''
  const area = meal.strArea || 'International'
  
  // Determine meal time
  let meal_time = 'Dinner' // default
  if (category.includes('breakfast') || mealName.includes('breakfast') || mealName.includes('pancake')) {
    meal_time = 'Breakfast'
  } else if (category.includes('dessert') || mealName.includes('cake') || mealName.includes('pudding')) {
    meal_time = 'Dessert'
  } else if (mealName.includes('lunch') || mealName.includes('salad') || mealName.includes('sandwich')) {
    meal_time = 'Lunch'
  }

  // Determine protein
  let protein = 'Vegetables' // default
  if (mealName.includes('chicken') || category.includes('chicken')) {
    protein = 'Chicken'
  } else if (mealName.includes('beef') || mealName.includes('steak')) {
    protein = 'Beef'
  } else if (mealName.includes('pork') || mealName.includes('bacon') || mealName.includes('ham')) {
    protein = 'Pork'
  } else if (mealName.includes('fish') || mealName.includes('salmon') || mealName.includes('tuna') || mealName.includes('seafood')) {
    protein = 'Seafood'
  }

  // Determine cuisine
  let cuisine = 'International'
  const cuisineMap: Record<string, string> = {
    'American': 'American',
    'British': 'American',
    'Italian': 'Italian',
    'Mexican': 'Mexican',
    'Chinese': 'Asian',
    'Japanese': 'Asian',
    'Thai': 'Asian',
    'Indian': 'Indian',
    'French': 'Mediterranean',
    'Greek': 'Mediterranean',
    'Spanish': 'Mediterranean',
  }
  cuisine = cuisineMap[area] || 'International'

  // Determine diet tags
  const diet_tags: string[] = []
  if (category.includes('vegetarian') || !protein || protein === 'Vegetables') {
    diet_tags.push('Vegetarian')
  }
  if (mealName.includes('vegan') || category.includes('vegan')) {
    diet_tags.push('Vegan')
  }
  if (mealName.includes('healthy') || category.includes('miscellaneous')) {
    diet_tags.push('Kid-friendly')
  }

  // Determine difficulty based on ingredient count
  const ingredientCount = Object.keys(meal)
    .filter(key => key.startsWith('strIngredient') && meal[key]?.trim())
    .length
  
  let difficulty = 'Medium'
  if (ingredientCount <= 5) {
    difficulty = 'Easy'
  } else if (ingredientCount >= 12) {
    difficulty = 'Hard'
  }

  // Estimate prep time based on category and difficulty
  let prep_time = 30 // default
  if (category.includes('dessert')) {
    prep_time = 45
  } else if (difficulty === 'Easy') {
    prep_time = 20
  } else if (difficulty === 'Hard') {
    prep_time = 60
  }

  return {
    meal_time,
    protein,
    cuisine,
    diet_tags,
    difficulty,
    prep_time
  }
}

// Fetch recipes from TheMealDB API
async function fetchRecipesFromAPI() {
  console.log('🔍 Fetching recipes from TheMealDB API...')
  const recipes: Array<{
    household_id: string;
    title: string;
    url: string;
    ingredients: Array<{ name: string; amount: string }>;
    favorite: boolean;
    meal_time: string;
    protein: string;
    cuisine: string;
    diet_tags: string[];
    difficulty: string;
    prep_time: number;
  }> = []

  try {
    // Fetch random recipes
    for (let i = 0; i < 20; i++) {
      const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php')
      const data = await response.json()
      
      if (data.meals && data.meals[0]) {
        const meal = data.meals[0]
        
        // Extract ingredients
        const ingredients: Array<{ name: string; amount: string }> = []
        for (let j = 1; j <= 20; j++) {
          const ingredient = meal[`strIngredient${j}`]
          const measure = meal[`strMeasure${j}`]
          if (ingredient && ingredient.trim()) {
            ingredients.push({
              name: ingredient.trim(),
              amount: measure?.trim() || ''
            })
          }
        }

        // Categorize the recipe
        const categories = categorizeRecipe(meal)

        const recipe = {
          household_id: DEFAULT_HOUSEHOLD_ID,
          title: meal.strMeal,
          url: meal.strSource || `https://www.themealdb.com/meal/${meal.idMeal}`,
          ingredients: ingredients,
          favorite: false,
          ...categories
        }

        recipes.push(recipe)
        console.log(`📝 Processed: ${recipe.title} (${recipe.cuisine}, ${recipe.meal_time})`)
      }

      // Small delay to be nice to the API
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Also fetch some specific categories for variety
    const categories = ['Chicken', 'Beef', 'Dessert', 'Vegetarian', 'Seafood']
    
    for (const category of categories) {
      try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
        const data = await response.json()
        
        if (data.meals) {
          // Get details for first 3 meals in each category
          for (let i = 0; i < Math.min(3, data.meals.length); i++) {
            const mealId = data.meals[i].idMeal
            const detailResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
            const detailData = await detailResponse.json()
            
            if (detailData.meals && detailData.meals[0]) {
              const meal = detailData.meals[0]
              
              // Check if we already have this recipe
              if (recipes.some(r => r.title === meal.strMeal)) {
                continue
              }

              // Extract ingredients
              const ingredients: Array<{ name: string; amount: string }> = []
              for (let j = 1; j <= 20; j++) {
                const ingredient = meal[`strIngredient${j}`]
                const measure = meal[`strMeasure${j}`]
                if (ingredient && ingredient.trim()) {
                  ingredients.push({
                    name: ingredient.trim(),
                    amount: measure?.trim() || ''
                  })
                }
              }

              // Categorize the recipe
              const categories = categorizeRecipe(meal)

              const recipe = {
                household_id: DEFAULT_HOUSEHOLD_ID,
                title: meal.strMeal,
                url: meal.strSource || `https://www.themealdb.com/meal/${meal.idMeal}`,
                ingredients: ingredients,
                favorite: false,
                ...categories
              }

              recipes.push(recipe)
              console.log(`📝 Processed: ${recipe.title} (${recipe.cuisine}, ${recipe.meal_time})`)
            }

            await new Promise(resolve => setTimeout(resolve, 100))
          }
        }
      } catch (error) {
        console.log(`⚠️ Skipping category ${category}:`, error)
      }
    }

    console.log(`✅ Fetched ${recipes.length} recipes from API`)
    return recipes

  } catch (error) {
    console.error('❌ Error fetching recipes from API:', error)
    throw error
  }
}

// Insert recipes into Supabase
async function insertRecipesIntoSupabase(recipes: any[]) {
  console.log(`💾 Inserting ${recipes.length} recipes into Supabase...`)

  try {
    // Clear existing recipes for this household (optional)
    console.log('🗑️ Clearing existing recipes...')
    await supabase
      .from('recipes')
      .delete()
      .eq('household_id', DEFAULT_HOUSEHOLD_ID)

    // Insert new recipes in batches
    const batchSize = 10
    let insertedCount = 0

    for (let i = 0; i < recipes.length; i += batchSize) {
      const batch = recipes.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('recipes')
        .insert(batch)
        .select()

      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error)
        continue
      }

      insertedCount += data?.length || 0
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(recipes.length / batchSize)} (${data?.length || 0} recipes)`)
    }

    console.log(`🎉 Successfully inserted ${insertedCount} recipes into Supabase!`)
    return insertedCount

  } catch (error) {
    console.error('❌ Error inserting recipes into Supabase:', error)
    throw error
  }
}

// Test Supabase connection
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('id')
      .limit(1)

    if (error) {
      console.error('❌ Supabase connection failed:', error)
      return false
    }

    console.log('✅ Supabase connection successful')
    return true
  } catch (error) {
    console.error('❌ Supabase connection error:', error)
    return false
  }
}

// Main seeding function
async function seedRecipes() {
  console.log('🌱 Starting recipe seeding process...\n')

  try {
    // Test Supabase connection
    const isConnected = await testSupabaseConnection()
    if (!isConnected) {
      console.error('❌ Cannot proceed without Supabase connection')
      return
    }

    // Fetch recipes from API
    const recipes = await fetchRecipesFromAPI()
    
    if (recipes.length === 0) {
      console.log('⚠️ No recipes fetched, exiting...')
      return
    }

    // Insert into Supabase
    const insertedCount = await insertRecipesIntoSupabase(recipes)

    console.log('\n🎉 Recipe seeding completed!')
    console.log(`📊 Summary:`)
    console.log(`   • Fetched: ${recipes.length} recipes`)
    console.log(`   • Inserted: ${insertedCount} recipes`)
    console.log(`   • Meal Times: ${[...new Set(recipes.map(r => r.meal_time))].join(', ')}`)
    console.log(`   • Cuisines: ${[...new Set(recipes.map(r => r.cuisine))].join(', ')}`)
    console.log(`   • Proteins: ${[...new Set(recipes.map(r => r.protein))].join(', ')}`)

  } catch (error) {
    console.error('\n❌ Recipe seeding failed:', error)
  }
}

// Export for use in other scripts
export { seedRecipes, fetchRecipesFromAPI, insertRecipesIntoSupabase }

// Run if called directly
if (require.main === module) {
  seedRecipes()
}
