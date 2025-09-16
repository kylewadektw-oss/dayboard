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

import { NextRequest, NextResponse } from 'next/server';
import { urlParamsToFilters } from '@/utils/recipe-filters';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Parse filters from URL parameters
    const filters = urlParamsToFilters(searchParams);

    // Get additional query params
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const search = searchParams.get('search') || '';

    // For now, return mock data since recipe tables aren't deployed yet
    // This will be replaced with actual database queries once tables exist
    console.log('Recipe filter API called with filters:', filters);
    console.log('Search term:', search);

    // Mock response structure for testing
    const mockRecipes = [
      {
        id: '1',
        title: 'Honey Garlic Chicken',
        description: 'Tender chicken in sweet and savory honey garlic sauce',
        cuisine: 'Asian',
        prep_time: 10,
        cook_time: 20,
        servings: 4,
        difficulty: 'medium',
        dietary_tags: ['dinner', 'chicken'],
        image_url: null,
        ingredients: [
          { name: 'chicken thighs', amount: '2', unit: 'lbs' },
          { name: 'garlic cloves', amount: '3', unit: 'cloves' }
        ],
        rating: 4.8,
        created_at: '2025-01-01'
      },
      {
        id: '2',
        title: 'Veggie Stir Fry',
        description: 'Quick and healthy vegetable stir fry',
        cuisine: 'Asian',
        prep_time: 10,
        cook_time: 8,
        servings: 2,
        difficulty: 'easy',
        dietary_tags: ['vegetarian', 'quick', 'healthy'],
        image_url: 'https://example.com/veggie-stir-fry.jpg',
        ingredients: [
          { name: 'mixed vegetables', amount: '2', unit: 'cups' },
          { name: 'soy sauce', amount: '2', unit: 'tbsp' }
        ],
        rating: 4.2,
        created_at: '2025-01-02'
      }
    ];

    // Apply filters to mock data
    let filteredRecipes = mockRecipes;

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filteredRecipes = filteredRecipes.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchLower) ||
          recipe.description.toLowerCase().includes(searchLower) ||
          recipe.cuisine.toLowerCase().includes(searchLower)
      );
    }

    if (filters.diets?.length) {
      filteredRecipes = filteredRecipes.filter((recipe) =>
        filters.diets!.some((diet) => recipe.dietary_tags.includes(diet))
      );
    }

    if (filters.cuisines?.length) {
      filteredRecipes = filteredRecipes.filter((recipe) =>
        filters.cuisines!.includes(recipe.cuisine)
      );
    }

    if (filters.maxCookTime) {
      filteredRecipes = filteredRecipes.filter(
        (recipe) => recipe.cook_time <= filters.maxCookTime!
      );
    }

    if (filters.minRating) {
      filteredRecipes = filteredRecipes.filter(
        (recipe) => recipe.rating >= filters.minRating!
      );
    }

    if (filters.quickOnly) {
      filteredRecipes = filteredRecipes.filter(
        (recipe) => recipe.prep_time + recipe.cook_time <= 20
      );
    }

    if (filters.imagesOnly) {
      filteredRecipes = filteredRecipes.filter(
        (recipe) => recipe.image_url !== null
      );
    }

    // Apply pagination
    const paginatedRecipes = filteredRecipes.slice(offset, offset + limit);

    // Transform data to match frontend expectations
    const transformedRecipes = paginatedRecipes.map((recipe) => ({
      ...recipe,
      total_time_minutes: recipe.prep_time + recipe.cook_time,
      prep_time_minutes: recipe.prep_time,
      cook_time_minutes: recipe.cook_time,
      rating_count: 10, // Mock data
      user_favorite: false,
      meal_type: recipe.dietary_tags.filter((tag) =>
        [
          'breakfast',
          'lunch',
          'dinner',
          'snack',
          'dessert',
          'appetizer',
          'beverage'
        ].includes(tag)
      ),
      diet_types: recipe.dietary_tags.filter((tag) =>
        [
          'vegetarian',
          'vegan',
          'gluten_free',
          'dairy_free',
          'keto',
          'paleo',
          'low_carb'
        ].includes(tag)
      ),
      tags: recipe.dietary_tags,
      image_emoji: recipe.image_url ? '🍽️' : '🥘'
    }));

    // Calculate filter summary
    const appliedFilters: string[] = [];
    if (filters.diets?.length)
      appliedFilters.push(`${filters.diets.length} diet restrictions`);
    if (filters.allergensExclude?.length)
      appliedFilters.push(
        `${filters.allergensExclude.length} allergen exclusions`
      );
    if (filters.cuisines?.length)
      appliedFilters.push(`${filters.cuisines.length} cuisines`);
    if (filters.maxCookTime)
      appliedFilters.push(`≤${filters.maxCookTime} min cook time`);
    if (filters.minRating)
      appliedFilters.push(`≥${filters.minRating} star rating`);
    if (filters.quickOnly) appliedFilters.push('quick recipes only');
    if (filters.imagesOnly) appliedFilters.push('with images only');

    const response = {
      recipes: transformedRecipes,
      pagination: {
        total: filteredRecipes.length,
        offset,
        limit,
        hasMore:
          paginatedRecipes.length === limit &&
          offset + limit < filteredRecipes.length
      },
      filters: {
        applied: filters,
        summary: appliedFilters.join(', ') || 'No filters applied',
        count: appliedFilters.length
      },
      meta: {
        searchQuery: search,
        sortBy,
        sortOrder,
        timestamp: new Date().toISOString(),
        note: 'Using mock data - will be replaced with database queries once recipe tables are deployed'
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Recipe filter API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      filters = {},
      pagination = { limit: 50, offset: 0 },
      search = '',
      includeIngredients = false,
      includeFavorites = false
    } = body;

    console.log('Recipe filter POST API called with:', {
      filters,
      pagination,
      search,
      includeIngredients,
      includeFavorites
    });

    // Mock response for now - will be replaced with actual database queries
    const mockRecipes = [
      {
        id: '1',
        title: 'Honey Garlic Chicken',
        description: 'Tender chicken in sweet and savory honey garlic sauce',
        cuisine: 'Asian',
        prep_time: 10,
        cook_time: 20,
        servings: 4,
        difficulty: 'medium',
        dietary_tags: ['dinner', 'chicken'],
        image_url: null,
        ingredients: includeIngredients
          ? [
              { name: 'chicken thighs', amount: '2', unit: 'lbs' },
              { name: 'garlic cloves', amount: '3', unit: 'cloves' },
              { name: 'honey', amount: '1/4', unit: 'cup' }
            ]
          : undefined,
        user_favorite: includeFavorites ? false : undefined,
        rating: 4.8,
        created_at: '2025-01-01'
      },
      {
        id: '2',
        title: 'Mediterranean Pasta',
        description: 'Fresh pasta with Mediterranean vegetables',
        cuisine: 'Mediterranean',
        prep_time: 15,
        cook_time: 25,
        servings: 3,
        difficulty: 'medium',
        dietary_tags: ['vegetarian', 'dinner', 'pasta'],
        image_url: 'https://example.com/pasta.jpg',
        ingredients: includeIngredients
          ? [
              { name: 'pasta', amount: '12', unit: 'oz' },
              { name: 'olive oil', amount: '2', unit: 'tbsp' },
              { name: 'tomatoes', amount: '2', unit: 'cups' }
            ]
          : undefined,
        user_favorite: includeFavorites ? true : undefined,
        rating: 4.6,
        created_at: '2025-01-02'
      }
    ];

    // Apply filters
    let filteredRecipes = [...mockRecipes];

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filteredRecipes = filteredRecipes.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchLower) ||
          recipe.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.diets?.length) {
      filteredRecipes = filteredRecipes.filter((recipe) =>
        filters.diets.some((diet: string) => recipe.dietary_tags.includes(diet))
      );
    }

    if (filters.cuisines?.length) {
      filteredRecipes = filteredRecipes.filter((recipe) =>
        filters.cuisines.includes(recipe.cuisine)
      );
    }

    // Apply pagination
    const paginatedRecipes = filteredRecipes.slice(
      pagination.offset,
      pagination.offset + pagination.limit
    );

    const response = {
      recipes: paginatedRecipes,
      pagination: {
        total: filteredRecipes.length,
        offset: pagination.offset,
        limit: pagination.limit,
        hasMore:
          paginatedRecipes.length === pagination.limit &&
          pagination.offset + pagination.limit < filteredRecipes.length
      },
      filters: {
        applied: filters,
        search,
        includeIngredients,
        includeFavorites
      },
      meta: {
        timestamp: new Date().toISOString(),
        note: 'Using mock data - will be replaced with database queries once recipe tables are deployed'
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Recipe filter POST API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
