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

import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export interface FetchRecipesResponse {
  message: string;
  totalFetched: number;
  inserted: number;
  skipped: number;
  searchQuery: string;
}

export interface FetchRecipesOptions {
  searchQuery?: string;
  numberOfRecipes?: number;
}

/**
 * Fetch recipes from Spoonacular API and store them in Supabase
 */
export async function fetchRecipesFromAPI(
  options: FetchRecipesOptions = {}
): Promise<FetchRecipesResponse> {
  const { searchQuery = 'popular', numberOfRecipes = 10 } = options;

  try {
    const response = await fetch('/api/recipes/fetch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        searchQuery,
        numberOfRecipes
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch recipes');
    }

    const data: FetchRecipesResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching recipes:', error);
    throw new Error(error.message || 'Failed to fetch recipes');
  }
}

/**
 * Predefined search queries for different types of recipes
 */
export const RECIPE_SEARCH_QUERIES = [
  { label: 'Popular Recipes', query: 'popular', emoji: '⭐' },
  { label: 'Quick & Easy', query: 'quick easy', emoji: '⚡' },
  { label: 'Healthy Meals', query: 'healthy', emoji: '🥗' },
  { label: 'Comfort Food', query: 'comfort food', emoji: '🍲' },
  { label: 'Vegetarian', query: 'vegetarian', emoji: '🌱' },
  { label: 'Chicken Recipes', query: 'chicken', emoji: '🍗' },
  { label: 'Pasta Dishes', query: 'pasta', emoji: '🍝' },
  { label: 'Desserts', query: 'dessert', emoji: '🍰' },
  { label: 'Breakfast', query: 'breakfast', emoji: '🍳' },
  { label: 'Italian Cuisine', query: 'italian', emoji: '🇮🇹' },
  { label: 'Mexican Food', query: 'mexican', emoji: '🌮' },
  { label: 'Asian Cuisine', query: 'asian', emoji: '🥢' }
];

/**
 * Batch fetch multiple recipe categories
 */
export async function batchFetchRecipes(
  categories: string[] = ['popular', 'quick easy', 'healthy'],
  recipesPerCategory: number = 5
): Promise<FetchRecipesResponse[]> {
  const results: FetchRecipesResponse[] = [];

  for (const category of categories) {
    try {
      const result = await fetchRecipesFromAPI({
        searchQuery: category,
        numberOfRecipes: recipesPerCategory
      });
      results.push(result);

      // Add a small delay between requests to be respectful to the API
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error fetching ${category} recipes:`, error);
      // Continue with other categories even if one fails
    }
  }

  return results;
}
