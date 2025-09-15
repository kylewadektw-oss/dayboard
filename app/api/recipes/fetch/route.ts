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

export async function GET() {
  return NextResponse.json({
    message: 'Recipe fetch API is working',
    hasApiKey: !!SPOONACULAR_API_KEY,
    timestamp: new Date().toISOString()
  });
}

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
        // Check if recipe already exists (by title and source URL)
        const { data: existingRecipe } = await supabase
          .from('recipes')
          .select('id')
          .eq('title', recipe.title)
          .eq('source_url', recipe.sourceUrl)
          .maybeSingle();

        if (existingRecipe) {
          skippedCount++;
          continue;
        }

        // Transform Spoonacular recipe to match our database schema
        const transformedRecipe = {
          user_id: user.id,
          household_id: profile.household_id,
          title: recipe.title,
          description: recipe.summary ? 
            recipe.summary.replace(/<[^>]*>/g, '').substring(0, 500) : 
            `Delicious ${recipe.title} recipe`,
          ingredients: transformIngredients(recipe.extendedIngredients || []),
          instructions: transformInstructions(recipe.analyzedInstructions || []),
          prep_time: recipe.preparationMinutes || Math.floor((recipe.readyInMinutes || 30) * 0.3),
          cook_time: recipe.cookingMinutes || Math.floor((recipe.readyInMinutes || 30) * 0.7),
          servings: recipe.servings || 4,
          difficulty: getDifficulty(recipe),
          cuisine: recipe.cuisines?.[0] || 'International',
          dietary_tags: getDietTypes(recipe),
          source_url: recipe.sourceUrl,
          image_url: recipe.image
        };

        // Insert into recipes table
        const { error: insertError } = await supabase
          .from('recipes')
          .insert(transformedRecipe);

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

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch recipes';
    console.error('Error in fetch recipes API:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// Helper functions
function getDifficulty(recipe: Record<string, unknown>): 'easy' | 'medium' | 'hard' {
  const readyTime = Number(recipe.readyInMinutes) || 30;
  const extendedIngredients = Array.isArray(recipe.extendedIngredients) ? recipe.extendedIngredients : [];
  const ingredientCount = extendedIngredients.length;
  
  if (readyTime <= 20 && ingredientCount <= 5) return 'easy';
  if (readyTime <= 45 && ingredientCount <= 10) return 'medium';
  return 'hard';
}

function getDietTypes(recipe: Record<string, unknown>): string[] {
  const diets = Array.isArray(recipe.diets) ? recipe.diets : [];
  const dietTypes: string[] = [];
  
  for (const diet of diets) {
    const dietStr = String(diet).toLowerCase();
    switch (dietStr) {
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

function transformIngredients(spoonacularIngredients: unknown[]): Array<{name: string; amount: string; unit: string; notes?: string}> {
  return spoonacularIngredients.map(ingredient => {
    const ing = ingredient as Record<string, unknown>;
    return {
      name: String(ing.name || ing.originalName || 'Unknown ingredient'),
      amount: String(ing.amount || '1'),
      unit: String(ing.unit || 'piece'),
      notes: ing.original ? String(ing.original) : undefined
    };
  });
}

function transformInstructions(analyzedInstructions: unknown[]): string[] {
  if (!analyzedInstructions || analyzedInstructions.length === 0) {
    return ['Instructions not available'];
  }
  
  const instructions: string[] = [];
  
  for (const instructionGroup of analyzedInstructions) {
    const group = instructionGroup as Record<string, unknown>;
    if (Array.isArray(group.steps)) {
      for (const step of group.steps) {
        const stepObj = step as Record<string, unknown>;
        if (stepObj.step && typeof stepObj.step === 'string') {
          instructions.push(stepObj.step);
        }
      }
    }
  }
  
  return instructions.length > 0 ? instructions : ['Instructions not available'];
}


