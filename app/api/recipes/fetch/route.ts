/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kyle.wade.ktw@gmail.com)
 * 
 * This file is part of Dayboard, a proprietary household command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: kyle.wade.ktw@gmail.com
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

export async function POST(request: Request) {
  try {
    if (!SPOONACULAR_API_KEY) {
      return NextResponse.json(
        { error: 'Spoonacular API key not configured' },
        { status: 500 }
      );
    }

    if (SPOONACULAR_API_KEY === 'your_spoonacular_api_key_here' || SPOONACULAR_API_KEY === 'your_api_key_here') {
      return NextResponse.json(
        { error: 'Please replace the placeholder Spoonacular API key with your actual API key in .env.local' },
        { status: 500 }
      );
    }

    const { searchQuery = 'popular', numberOfRecipes = 10 } = await request.json();
    
    // Fetch recipes from Spoonacular API
    const spoonacularUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(searchQuery)}&number=${numberOfRecipes}&apiKey=${SPOONACULAR_API_KEY}&addRecipeInformation=true&fillIngredients=true`;
    
    console.log('Fetching from Spoonacular:', { searchQuery, numberOfRecipes, hasApiKey: !!SPOONACULAR_API_KEY });
    
    const response = await fetch(spoonacularUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Spoonacular API error:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid Spoonacular API key. Please check your API key in .env.local' },
          { status: 401 }
        );
      }
      
      if (response.status === 402) {
        return NextResponse.json(
          { error: 'Spoonacular API quota exceeded. Please check your plan limits.' },
          { status: 402 }
        );
      }
      
      throw new Error(`Spoonacular API error: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return NextResponse.json(
        { message: 'No recipes found', count: 0 },
        { status: 200 }
      );
    }

    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's household
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('household_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.household_id) {
      return NextResponse.json(
        { error: 'User household not found' },
        { status: 400 }
      );
    }

    let insertedCount = 0;
    let skippedCount = 0;

    // Process each recipe
    for (const recipe of data.results) {
      try {
        // Check if recipe already exists (by Spoonacular ID in application_logs)
        const { data: existingRecipe } = await supabase
          .from('application_logs')
          .select('id, data')
          .eq('component', 'recipe_system')
          .eq('user_id', user.id)
          .like('data->>spoonacular_id', `${recipe.id}`)
          .single();

        if (existingRecipe) {
          skippedCount++;
          continue;
        }

        // Transform Spoonacular recipe to our format
        const transformedRecipe = {
          household_id: profile.household_id,
          created_by: user.id,
          spoonacular_id: recipe.id,
          title: recipe.title,
          description: recipe.summary ? 
            recipe.summary.replace(/<[^>]*>/g, '').substring(0, 500) : 
            `Delicious ${recipe.title} recipe`,
          image_url: recipe.image,
          image_emoji: getRecipeEmoji(recipe),
          total_time_minutes: recipe.readyInMinutes || 30,
          prep_time_minutes: recipe.preparationMinutes || Math.floor((recipe.readyInMinutes || 30) * 0.3),
          cook_time_minutes: recipe.cookingMinutes || Math.floor((recipe.readyInMinutes || 30) * 0.7),
          servings: recipe.servings || 4,
          difficulty: getDifficulty(recipe),
          meal_type: getMealTypes(recipe),
          diet_types: getDietTypes(recipe),
          cuisine: recipe.cuisines?.[0] || 'International',
          ingredients: transformIngredients(recipe.extendedIngredients || []),
          instructions: transformInstructions(recipe.analyzedInstructions || []),
          tags: getTags(recipe),
          rating: recipe.spoonacularScore ? Math.round(recipe.spoonacularScore / 20 * 10) / 10 : 4.0,
          rating_count: Math.floor(Math.random() * 50) + 5, // Simulated rating count
          source_url: recipe.sourceUrl,
          is_public: false,
          is_verified: true // Spoonacular recipes are considered verified
        };

        // Store recipe in application_logs until recipes table is created
        const { error: insertError } = await supabase
          .from('application_logs')
          .insert({
            user_id: user.id,
            session_id: `recipe-${Date.now()}-${recipe.id}`,
            level: 'info',
            message: `Recipe saved: ${transformedRecipe.title}`,
            component: 'recipe_system',
            data: transformedRecipe,
            timestamp: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error inserting recipe:', insertError);
          continue;
        }

        insertedCount++;
      } catch (recipeError) {
        console.error(`Error processing recipe ${recipe.id}:`, recipeError);
        continue;
      }
    }

    return NextResponse.json({
      message: 'Recipes fetched successfully',
      totalFetched: data.results.length,
      inserted: insertedCount,
      skipped: skippedCount,
      searchQuery
    });

  } catch (error: any) {
    console.error('Error in fetch recipes API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

// Helper functions
function getRecipeEmoji(recipe: any): string {
  const title = recipe.title.toLowerCase();
  const dishTypes = recipe.dishTypes || [];
  
  // Check dish types first
  for (const dishType of dishTypes) {
    switch (dishType.toLowerCase()) {
      case 'breakfast':
      case 'morning meal':
        return '🍳';
      case 'lunch':
        return '🥪';
      case 'dinner':
      case 'main course':
        return '🍽️';
      case 'dessert':
        return '🍰';
      case 'salad':
        return '🥗';
      case 'soup':
        return '🍲';
      case 'pasta':
        return '🍝';
      case 'pizza':
        return '🍕';
    }
  }
  
  // Check title keywords
  if (title.includes('chicken')) return '🍗';
  if (title.includes('beef')) return '🥩';
  if (title.includes('fish') || title.includes('salmon')) return '🐟';
  if (title.includes('pasta')) return '🍝';
  if (title.includes('pizza')) return '🍕';
  if (title.includes('salad')) return '🥗';
  if (title.includes('soup')) return '🍲';
  if (title.includes('cake') || title.includes('dessert')) return '🍰';
  if (title.includes('taco')) return '🌮';
  if (title.includes('burger')) return '🍔';
  
  return '🍽️'; // Default
}

function getDifficulty(recipe: any): 'easy' | 'medium' | 'hard' {
  const readyTime = recipe.readyInMinutes || 30;
  const ingredientCount = recipe.extendedIngredients?.length || 0;
  
  if (readyTime <= 20 && ingredientCount <= 5) return 'easy';
  if (readyTime <= 45 && ingredientCount <= 10) return 'medium';
  return 'hard';
}

function getMealTypes(recipe: any): string[] {
  const dishTypes = recipe.dishTypes || [];
  const mealTypes: string[] = [];
  
  for (const dishType of dishTypes) {
    switch (dishType.toLowerCase()) {
      case 'breakfast':
      case 'morning meal':
        mealTypes.push('breakfast');
        break;
      case 'lunch':
        mealTypes.push('lunch');
        break;
      case 'dinner':
      case 'main course':
        mealTypes.push('dinner');
        break;
    }
  }
  
  return mealTypes.length > 0 ? mealTypes : ['dinner'];
}

function getDietTypes(recipe: any): string[] {
  const diets = recipe.diets || [];
  const dietTypes: string[] = [];
  
  for (const diet of diets) {
    switch (diet.toLowerCase()) {
      case 'vegetarian':
        dietTypes.push('vegetarian');
        break;
      case 'vegan':
        dietTypes.push('vegan');
        break;
      case 'gluten free':
        dietTypes.push('gluten-free');
        break;
      case 'dairy free':
        dietTypes.push('dairy-free');
        break;
      case 'ketogenic':
        dietTypes.push('keto');
        break;
      case 'paleo':
        dietTypes.push('paleo');
        break;
    }
  }
  
  return dietTypes;
}

function transformIngredients(spoonacularIngredients: any[]): any[] {
  return spoonacularIngredients.map(ingredient => ({
    name: ingredient.name || ingredient.originalName || 'Unknown ingredient',
    amount: ingredient.amount?.toString() || '1',
    unit: ingredient.unit || 'piece',
    notes: ingredient.original || undefined
  }));
}

function transformInstructions(analyzedInstructions: any[]): string[] {
  if (!analyzedInstructions || analyzedInstructions.length === 0) {
    return ['Instructions not available'];
  }
  
  const instructions: string[] = [];
  
  for (const instructionGroup of analyzedInstructions) {
    if (instructionGroup.steps) {
      for (const step of instructionGroup.steps) {
        if (step.step) {
          instructions.push(step.step);
        }
      }
    }
  }
  
  return instructions.length > 0 ? instructions : ['Instructions not available'];
}

function getTags(recipe: any): string[] {
  const tags: string[] = [];
  
  // Add dish types as tags
  if (recipe.dishTypes) {
    tags.push(...recipe.dishTypes);
  }
  
  // Add cuisines as tags
  if (recipe.cuisines) {
    tags.push(...recipe.cuisines);
  }
  
  // Add diet types as tags
  if (recipe.diets) {
    tags.push(...recipe.diets);
  }
  
  // Add difficulty tag
  tags.push(getDifficulty(recipe));
  
  // Add time-based tags
  const readyTime = recipe.readyInMinutes || 30;
  if (readyTime <= 20) tags.push('quick');
  if (readyTime <= 30) tags.push('easy');
  
  return Array.from(new Set(tags)); // Remove duplicates
}
