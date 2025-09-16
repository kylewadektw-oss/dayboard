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


import { Search, Filter, Clock, Users, Star, Download, Loader2, X, Grid, List, TrendingUp, Heart, Zap } from 'lucide-react';
import { useEffect, useState, useMemo, memo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  RecipeWithDetails, 
  RECIPE_DIFFICULTIES,
  RecipeIngredient,
  RecipeDifficulty,
  RecipeMealType,
  RecipeDietType
} from '@/types/recipes';
import { fetchRecipesFromAPI, RECIPE_SEARCH_QUERIES, type FetchRecipesResponse } from '@/utils/supabase/recipe-fetcher';
import Button from '@/components/ui/Button';
import { RecipeFiltersSheet, type RecipeFilters } from './RecipeFiltersSheet';
import { 
  filtersToURLParams, 
  urlParamsToFilters, 
  hasActiveFilters, 
  getFiltersSummary 
} from '@/utils/recipe-filters';

const supabase = createClient();

// Database integration coming soon
// type DatabaseRecipe = Tables<'recipes'>;

const getDifficultyColor = (difficulty: RecipeWithDetails['difficulty']) => {
  const difficultyConfig = RECIPE_DIFFICULTIES.find(d => d.value === difficulty);
  return difficultyConfig?.color || 'text-gray-600 bg-gray-100';
};

function RecipeLibraryComponent() {
  const [recipes, setRecipes] = useState<RecipeWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [userFavorites] = useState<Set<string>>(new Set()); // Feature coming soon
  const [isFetching, setIsFetching] = useState(false);
  const [fetchResults, setFetchResults] = useState<FetchRecipesResponse | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // New filter state for advanced filters sheet
  const [showFiltersSheet, setShowFiltersSheet] = useState(false);
  const [recipeFilters, setRecipeFilters] = useState<RecipeFilters>({
    diets: [],
    allergensExclude: [],
    cuisines: [],
    includeIngredients: [],
    excludeIngredients: [],
    maxCookTime: undefined,
    minRating: undefined,
    quickOnly: false,
    imagesOnly: false,
  });
  
  const [advancedFilters, setAdvancedFilters] = useState({
    difficulty: [] as string[],
    cuisine: [] as string[],
    dietary: [] as string[],
    cookTime: '',
    rating: 0,
    favorites: false,
    quickMeals: false
  });

  // Database integration functions (placeholder for future implementation)
  // const loadUserFavorites = useCallback(async () => {
  //   try {
  //     const savedFavorites = localStorage.getItem('recipe_favorites');
  //     if (savedFavorites) {
  //       setUserFavorites(new Set(JSON.parse(savedFavorites)));
  //     }
  //   } catch (error) {
  //     console.error('Error loading user favorites:', error);
  //   }
  // }, []);

  // Apply recipe filters to recipes list
  const filteredRecipes = useMemo(() => {
    let filtered = recipes;

    // Text search
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(search) ||
        (recipe.description || '').toLowerCase().includes(search) ||
        (recipe.cuisine || '').toLowerCase().includes(search) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    // Legacy active filter
    switch (activeFilter) {
      case 'Quick (<20min)':
        filtered = filtered.filter(recipe => recipe.total_time_minutes <= 20);
        break;
      case 'Vegetarian':
        filtered = filtered.filter(recipe => recipe.diet_types.includes('vegetarian'));
        break;
      case 'Chicken':
        filtered = filtered.filter(recipe => recipe.tags.includes('chicken'));
        break;
      case 'Beef':
        filtered = filtered.filter(recipe => recipe.tags.includes('beef'));
        break;
      case 'Italian':
        filtered = filtered.filter(recipe => recipe.cuisine === 'Italian');
        break;
      case 'Mexican':
        filtered = filtered.filter(recipe => recipe.cuisine === 'Mexican');
        break;
      case 'Asian':
        filtered = filtered.filter(recipe => recipe.cuisine === 'Asian');
        break;
    }

    // Advanced recipe filters
    if (recipeFilters.diets.length) {
      filtered = filtered.filter(recipe => 
        recipeFilters.diets.some(diet => recipe.diet_types.includes(diet as RecipeDietType))
      );
    }

    if (recipeFilters.allergensExclude.length) {
      filtered = filtered.filter(recipe => 
        !recipeFilters.allergensExclude.some(allergen => 
          recipe.ingredients.some(ing => 
            ing.name.toLowerCase().includes(allergen.toLowerCase())
          )
        )
      );
    }

    if (recipeFilters.cuisines.length) {
      filtered = filtered.filter(recipe => 
        recipeFilters.cuisines.includes(recipe.cuisine || '')
      );
    }

    if (recipeFilters.includeIngredients.length) {
      filtered = filtered.filter(recipe => 
        recipeFilters.includeIngredients.every(ingredient => 
          recipe.ingredients.some(ing => 
            ing.name.toLowerCase().includes(ingredient.toLowerCase())
          )
        )
      );
    }

    if (recipeFilters.excludeIngredients.length) {
      filtered = filtered.filter(recipe => 
        !recipeFilters.excludeIngredients.some(ingredient => 
          recipe.ingredients.some(ing => 
            ing.name.toLowerCase().includes(ingredient.toLowerCase())
          )
        )
      );
    }

    if (recipeFilters.maxCookTime) {
      filtered = filtered.filter(recipe => recipe.total_time_minutes <= recipeFilters.maxCookTime!);
    }

    if (recipeFilters.minRating) {
      filtered = filtered.filter(recipe => (recipe.rating || 0) >= recipeFilters.minRating!);
    }

    if (recipeFilters.quickOnly) {
      filtered = filtered.filter(recipe => recipe.total_time_minutes <= 20);
    }

    if (recipeFilters.imagesOnly) {
      filtered = filtered.filter(recipe => recipe.image_url || recipe.image_emoji);
    }

    return filtered;
  }, [recipes, searchTerm, activeFilter, recipeFilters]);

  const handleFiltersApply = (filters: RecipeFilters) => {
    setRecipeFilters(filters);
  };

  const clearAllFilters = () => {
    setRecipeFilters({
      diets: [],
      allergensExclude: [],
      cuisines: [],
      includeIngredients: [],
      excludeIngredients: [],
      maxCookTime: undefined,
      minRating: undefined,
      quickOnly: false,
      imagesOnly: false,
    });
    setActiveFilter('All');
    setSearchTerm('');
  };

  // Initialize from URL params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const filtersFromURL = urlParamsToFilters(params);
      if (hasActiveFilters(filtersFromURL)) {
        setRecipeFilters(filtersFromURL);
      }
    }
  }, []);

  // Update URL when filters change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = filtersToURLParams(recipeFilters);
      const url = new URL(window.location.href);
      url.search = params.toString();
      window.history.replaceState(null, '', url.toString());
    }
  }, [recipeFilters]);

  const loadRecipesFromDatabase = async () => {
    setLoading(true);
    
    try {
      // Build query for Supabase with proper TypeScript types
      let query = supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply search filter
      if (searchTerm && searchTerm.trim()) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,dietary_tags.cs.{${searchTerm}}`);
      }

      // Apply category filter
      if (activeFilter && activeFilter !== 'All') {
        const filterLower = activeFilter.toLowerCase();
        query = query.contains('dietary_tags', [filterLower]);
      }

      const { data: recipesData, error } = await query.limit(50);

      if (error) {
        console.error('Error loading recipes:', error);
        // Fall back to mock data if database fails
        await loadMockRecipes();
        return;
      }

      // Transform database data to match our interface
      const transformedRecipes: RecipeWithDetails[] = (recipesData || []).map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        // Convert null to undefined for TypeScript compatibility
        description: recipe.description || undefined,
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients as unknown as RecipeIngredient[] : [],
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions as unknown as string[] : [],
        // Map database fields to component expected fields
        prep_time_minutes: recipe.prep_time || 15,
        cook_time_minutes: recipe.cook_time || 15,
        total_time_minutes: (recipe.prep_time || 15) + (recipe.cook_time || 15),
        servings: recipe.servings || 2,
        difficulty: (recipe.difficulty as RecipeDifficulty) || 'medium',
        image_emoji: recipe.image_url ? '🍽️' : '🥘',
        meal_type: (recipe.dietary_tags || ['dinner']).filter(tag => 
          ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer', 'beverage'].includes(tag)
        ) as RecipeMealType[],
        diet_types: (recipe.dietary_tags || []).filter(tag => 
          ['none', 'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'keto', 'paleo', 'low_carb', 'mediterranean'].includes(tag)
        ) as RecipeDietType[],
        tags: recipe.dietary_tags || [],
        rating: 4.5,
        rating_count: 10,
        user_favorite: userFavorites.has(recipe.id),
        cuisine: recipe.cuisine || 'International',
        creator: { 
          id: recipe.user_id || 'unknown', 
          name: 'Recipe Creator', 
          avatar_url: undefined 
        },
        // Ensure required fields have defaults
        is_favorite: false,
        is_public: true,
        is_verified: false,
        created_by: recipe.user_id || 'unknown',
        household_id: recipe.household_id || 'unknown',
        created_at: recipe.created_at || new Date().toISOString(),
        updated_at: recipe.updated_at || new Date().toISOString(),
        // Handle nullable fields
        source_url: recipe.source_url || undefined,
        image_url: recipe.image_url || undefined
      }));

      setRecipes(transformedRecipes);
      
      // If no recipes found, show helpful message
      if (transformedRecipes.length === 0) {
        console.log('No recipes found in database. Consider fetching some recipes from the API!');
      }
      
    } catch (error) {
      console.error('Error in loadRecipesFromDatabase:', error);
      // Fall back to mock data
      await loadMockRecipes();
    } finally {
      setLoading(false);
    }
  };

  const loadMockRecipes = async () => {
    setLoading(true);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock recipe data
    const mockRecipes: RecipeWithDetails[] = [
      {
        id: '1',
        title: 'Honey Garlic Chicken',
        description: 'Tender chicken in sweet and savory honey garlic sauce',
        image_emoji: '🍗',
        total_time_minutes: 30,
        prep_time_minutes: 10,
        cook_time_minutes: 20,
        servings: 4,
        difficulty: 'medium',
        meal_type: ['dinner'],
        diet_types: [],
        ingredients: [
          { name: 'chicken thighs', amount: '2', unit: 'lbs' },
          { name: 'garlic cloves', amount: '3', unit: 'cloves' },
          { name: 'honey', amount: '1/4', unit: 'cup' },
          { name: 'soy sauce', amount: '2', unit: 'tbsp' }
        ],
        instructions: ['Season chicken', 'Cook in pan', 'Add sauce', 'Simmer until done'],
        tags: ['dinner', 'chicken', 'easy'],
        rating: 4.8,
        rating_count: 24,
        is_favorite: true,
        is_public: false,
        is_verified: false,
        created_by: 'user-1',
        household_id: 'household-1',
        created_at: '2025-09-01',
        updated_at: '2025-09-01',
        user_favorite: true,
        creator: { id: 'user-1', name: 'Kyle', avatar_url: undefined },
        cuisine: 'Asian'
      },
      {
        id: '2',
        title: 'Spaghetti Carbonara',
        description: 'Classic Italian pasta with eggs, cheese, and pancetta',
        image_emoji: '🍝',
        total_time_minutes: 25,
        prep_time_minutes: 10,
        cook_time_minutes: 15,
        servings: 2,
        difficulty: 'medium',
        meal_type: ['dinner'],
        diet_types: [],
        ingredients: [
          { name: 'spaghetti', amount: '8', unit: 'oz' },
          { name: 'eggs', amount: '2', unit: 'whole' },
          { name: 'pecorino cheese', amount: '1/2', unit: 'cup' },
          { name: 'pancetta', amount: '4', unit: 'oz' }
        ],
        instructions: ['Cook pasta', 'Fry pancetta', 'Mix eggs and cheese', 'Combine everything'],
        tags: ['pasta', 'italian', 'dinner'],
        rating: 4.9,
        rating_count: 18,
        is_favorite: true,
        is_public: false,
        is_verified: false,
        created_by: 'user-1',
        household_id: 'household-1',
        created_at: '2025-09-05',
        updated_at: '2025-09-05',
        user_favorite: false,
        creator: { id: 'user-1', name: 'Kyle', avatar_url: undefined },
        cuisine: 'Italian'
      },
      {
        id: '3',
        title: 'Quick Veggie Stir Fry',
        description: 'Fresh vegetables tossed in a savory sauce',
        image_emoji: '🥗',
        total_time_minutes: 15,
        prep_time_minutes: 10,
        cook_time_minutes: 5,
        servings: 3,
        difficulty: 'easy',
        meal_type: ['lunch', 'dinner'],
        diet_types: ['vegetarian'],
        ingredients: [
          { name: 'mixed vegetables', amount: '2', unit: 'cups' },
          { name: 'soy sauce', amount: '2', unit: 'tbsp' },
          { name: 'garlic', amount: '2', unit: 'cloves' },
          { name: 'ginger', amount: '1', unit: 'inch' }
        ],
        instructions: ['Heat oil', 'Add vegetables', 'Stir fry 3-5 minutes', 'Add sauce'],
        tags: ['vegetarian', 'quick', 'healthy'],
        rating: 4.5,
        rating_count: 12,
        is_favorite: false,
        is_public: false,
        is_verified: false,
        created_by: 'user-1',
        household_id: 'household-1',
        created_at: '2025-09-08',
        updated_at: '2025-09-08',
        user_favorite: false,
        creator: { id: 'user-1', name: 'Kyle', avatar_url: undefined },
        cuisine: 'Asian'
      },
      {
        id: '4',
        title: 'Beef Tacos',
        description: 'Seasoned ground beef in soft tortillas with fresh toppings',
        image_emoji: '🌮',
        total_time_minutes: 20,
        prep_time_minutes: 5,
        cook_time_minutes: 15,
        servings: 4,
        difficulty: 'easy',
        meal_type: ['dinner'],
        diet_types: [],
        ingredients: [
          { name: 'ground beef', amount: '1', unit: 'lb' },
          { name: 'taco seasoning', amount: '1', unit: 'packet' },
          { name: 'soft tortillas', amount: '8', unit: 'pieces' },
          { name: 'cheese', amount: '1', unit: 'cup' }
        ],
        instructions: ['Brown beef', 'Add seasoning', 'Warm tortillas', 'Assemble tacos'],
        tags: ['beef', 'mexican', 'dinner'],
        rating: 4.7,
        rating_count: 30,
        is_favorite: false,
        is_public: false,
        is_verified: false,
        created_by: 'user-1',
        household_id: 'household-1',
        created_at: '2025-09-06',
        updated_at: '2025-09-06',
        user_favorite: true,
        creator: { id: 'user-1', name: 'Kyle', avatar_url: undefined },
        cuisine: 'Mexican'
      },
      {
        id: '5',
        title: 'Caesar Salad',
        description: 'Crisp romaine lettuce with homemade caesar dressing',
        image_emoji: '🥬',
        total_time_minutes: 10,
        prep_time_minutes: 10,
        cook_time_minutes: 0,
        servings: 2,
        difficulty: 'easy',
        meal_type: ['lunch'],
        diet_types: ['vegetarian'],
        ingredients: [
          { name: 'romaine lettuce', amount: '1', unit: 'head' },
          { name: 'parmesan cheese', amount: '1/2', unit: 'cup' },
          { name: 'croutons', amount: '1', unit: 'cup' },
          { name: 'caesar dressing', amount: '1/4', unit: 'cup' }
        ],
        instructions: ['Chop lettuce', 'Add dressing', 'Top with cheese and croutons', 'Serve immediately'],
        tags: ['salad', 'vegetarian', 'quick'],
        rating: 4.3,
        rating_count: 8,
        is_favorite: false,
        is_public: false,
        is_verified: false,
        created_by: 'user-1',
        household_id: 'household-1',
        created_at: '2025-09-09',
        updated_at: '2025-09-09',
        user_favorite: false,
        creator: { id: 'user-1', name: 'Kyle', avatar_url: undefined },
        cuisine: 'American'
      },
      {
        id: '6',
        title: 'Teriyaki Salmon',
        description: 'Glazed salmon with steamed rice and vegetables',
        image_emoji: '🐟',
        total_time_minutes: 25,
        prep_time_minutes: 5,
        cook_time_minutes: 20,
        servings: 2,
        difficulty: 'medium',
        meal_type: ['dinner'],
        diet_types: [],
        ingredients: [
          { name: 'salmon fillets', amount: '2', unit: 'pieces' },
          { name: 'teriyaki sauce', amount: '1/4', unit: 'cup' },
          { name: 'rice', amount: '1', unit: 'cup' },
          { name: 'broccoli', amount: '1', unit: 'cup' }
        ],
        instructions: ['Cook rice', 'Pan fry salmon', 'Glaze with teriyaki', 'Steam vegetables'],
        tags: ['fish', 'healthy', 'asian'],
        rating: 4.6,
        rating_count: 15,
        is_favorite: false,
        is_public: false,
        is_verified: false,
        created_by: 'user-1',
        household_id: 'household-1',
        created_at: '2025-09-07',
        updated_at: '2025-09-07',
        user_favorite: false,
        creator: { id: 'user-1', name: 'Kyle', avatar_url: undefined },
        cuisine: 'Asian'
      }
    ];

    // Apply filters
    let filteredRecipes = mockRecipes;

    // Apply search filter
    if (searchTerm) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (recipe.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (recipe.cuisine || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filters
    switch (activeFilter) {
      case 'Quick (<20min)':
        filteredRecipes = filteredRecipes.filter(recipe => recipe.total_time_minutes <= 20);
        break;
      case 'Vegetarian':
        filteredRecipes = filteredRecipes.filter(recipe => recipe.diet_types.includes('vegetarian'));
        break;
      case 'Chicken':
        filteredRecipes = filteredRecipes.filter(recipe => recipe.tags.includes('chicken'));
        break;
      case 'Beef':
        filteredRecipes = filteredRecipes.filter(recipe => recipe.tags.includes('beef'));
        break;
      case 'Italian':
        filteredRecipes = filteredRecipes.filter(recipe => recipe.cuisine === 'Italian');
        break;
      case 'Mexican':
        filteredRecipes = filteredRecipes.filter(recipe => recipe.cuisine === 'Mexican');
        break;
      case 'Asian':
        filteredRecipes = filteredRecipes.filter(recipe => recipe.cuisine === 'Asian');
        break;
    }

    setRecipes(filteredRecipes);
    setLoading(false);
  };

  // Database integration functions (placeholder for future implementation)  
  // const fetchUserFavorites = async () => {
  //   console.log('Using mock favorites data until recipe tables are deployed');
  // };

  // const fetchRecipes = async () => {
  //   console.log('Recipe tables not yet deployed - using mock data');
  //   loadMockRecipes();
  // };

  const toggleFavorite = async (recipeId: string, isFavorite: boolean) => {
    // For now, just update local state until recipe tables are deployed
    setRecipes(prev => 
      prev.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, user_favorite: !isFavorite }
          : recipe
      )
    );
    console.log(`Toggle favorite for recipe ${recipeId}: ${!isFavorite}`);
  };

  const fetchRecipesFromSpoonacular = async (searchQuery: string = 'popular') => {
    setIsFetching(true);
    setFetchResults(null);
    
    // Ensure we always have a valid search query
    const validSearchQuery = searchQuery.trim() || 'popular';
    
    try {
      const result = await fetchRecipesFromAPI({
        searchQuery: validSearchQuery,
        numberOfRecipes: 12
      });
      
      setFetchResults(result);
      
      // Refresh the recipe list after fetching
      if (result.inserted > 0) {
        loadRecipesFromDatabase(); // Load real data from database
      }
      
      // Show success message
      const message = `Successfully fetched ${result.totalFetched} recipes! ${result.inserted} new recipes added to your library.`;
      alert(message);
    } catch (error: unknown) {
      console.error('Error fetching recipes:', error);
      
      // Provide helpful error messages
      let errorMessage = 'Failed to fetch recipes';
      
      const errorMsg = error instanceof Error ? error.message : '';
      
      if (errorMsg.includes('401')) {
        errorMessage = 'API Authentication Error: Please check your Spoonacular API key in .env.local file. Make sure you have replaced the placeholder with your actual API key.';
      } else if (errorMsg.includes('402')) {
        errorMessage = 'API Quota Exceeded: You have reached your daily limit for the Spoonacular API. Please wait until tomorrow or upgrade your plan.';
      } else if (errorMsg.includes('key not configured')) {
        errorMessage = 'API Key Missing: Please add your Spoonacular API key to the .env.local file.';
      } else if (errorMsg.includes('placeholder')) {
        errorMessage = 'API Key Setup Required: Please replace the placeholder API key with your actual Spoonacular API key.';
      } else if (errorMsg.includes('Network')) {
        errorMessage = 'Network Error: Please check your internet connection and try again.';
      } else {
        errorMessage = errorMsg ? `Error: ${errorMsg}` : 'Failed to fetch recipes. Please try again.';
      }
      
      alert(errorMessage);
      
      // Set error state for UI feedback
      setFetchResults({
        message: 'Failed to fetch recipes',
        totalFetched: 0,
        inserted: 0,
        skipped: 0,
        searchQuery: validSearchQuery
      });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1">
          <label htmlFor="recipe-search" className="sr-only">
            Search recipes, ingredients, or cuisine
          </label>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              id="recipe-search"
              name="recipeSearch"
              type="text"
              placeholder="Search recipes, ingredients, or cuisine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Fetch Recipes Button */}
        <Button
          onClick={() => fetchRecipesFromSpoonacular('popular')}
          disabled={isFetching}
          className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
        >
          {isFetching ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isFetching ? 'Fetching...' : 'Fetch New Recipes'}
        </Button>

        {/* Filters */}
        <button 
          onClick={() => setShowFiltersSheet(true)}
          className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
            hasActiveFilters(recipeFilters) 
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters(recipeFilters) && (
            <span className="ml-2 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              {Object.values(recipeFilters).filter(v => Array.isArray(v) ? v.length > 0 : v).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Tags and Enhanced Controls */}
      <div className="space-y-4 mb-6">
        {/* Primary Filter Tags */}
        <div className="flex flex-wrap gap-2">
          {['All', 'Quick (<20min)', 'Vegetarian', 'Chicken', 'Beef', 'Italian', 'Mexican', 'Asian'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === activeFilter
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Enhanced Filter Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
                showAdvancedFilters || advancedFilters.difficulty.length > 0 || advancedFilters.cuisine.length > 0
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              Advanced Filters
              {(advancedFilters.difficulty.length + advancedFilters.cuisine.length + advancedFilters.dietary.length) > 0 && (
                <span className="bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {advancedFilters.difficulty.length + advancedFilters.cuisine.length + advancedFilters.dietary.length}
                </span>
              )}
            </button>

            <span className="text-sm text-gray-600">
              {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}
              {hasActiveFilters(recipeFilters) && (
                <span className="ml-2 text-indigo-600">
                  • {getFiltersSummary(recipeFilters)}
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick Category Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: 'popular', label: 'Popular', icon: TrendingUp, filter: () => filteredRecipes.filter(r => r.rating && r.rating >= 4.0) },
            { id: 'quick', label: 'Quick & Easy', icon: Zap, filter: () => filteredRecipes.filter(r => r.total_time_minutes <= 20) },
            { id: 'healthy', label: 'Healthy', icon: '🥗', filter: () => filteredRecipes.filter(r => r.diet_types.includes('vegetarian')) },
            { id: 'comfort', label: 'Comfort Food', icon: '🍲', filter: () => filteredRecipes.filter(r => r.cuisine === 'American') }
          ].map((category) => {
            const Icon = category.icon;
            const count = category.filter().length;
            return (
              <button
                key={category.id}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  {typeof Icon === 'string' ? (
                    <span className="text-2xl">{Icon}</span>
                  ) : (
                    <Icon className="h-6 w-6 text-indigo-600" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-indigo-600">
                      {category.label}
                    </div>
                    <div className="text-xs text-gray-500">{count} recipes</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <div className="space-y-2">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <label key={level} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={advancedFilters.difficulty.includes(level)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAdvancedFilters(prev => ({
                              ...prev,
                              difficulty: [...prev.difficulty, level]
                            }));
                          } else {
                            setAdvancedFilters(prev => ({
                              ...prev,
                              difficulty: prev.difficulty.filter(d => d !== level)
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cuisine Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {['Asian', 'Italian', 'Mexican', 'American', 'Mediterranean', 'Indian'].map((cuisine) => (
                    <label key={cuisine} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={advancedFilters.cuisine.includes(cuisine)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAdvancedFilters(prev => ({
                              ...prev,
                              cuisine: [...prev.cuisine, cuisine]
                            }));
                          } else {
                            setAdvancedFilters(prev => ({
                              ...prev,
                              cuisine: prev.cuisine.filter(c => c !== cuisine)
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{cuisine}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dietary Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dietary</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'keto', 'paleo'].map((tag) => (
                    <label key={tag} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={advancedFilters.dietary.includes(tag)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAdvancedFilters(prev => ({
                              ...prev,
                              dietary: [...prev.dietary, tag]
                            }));
                          } else {
                            setAdvancedFilters(prev => ({
                              ...prev,
                              dietary: prev.dietary.filter(d => d !== tag)
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{tag.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cook Time & Rating */}
              <div className="space-y-4">
                {/* Cook Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cook Time</label>
                  <select
                    value={advancedFilters.cookTime}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, cookTime: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Any time</option>
                    <option value="under15">Under 15 min</option>
                    <option value="under30">Under 30 min</option>
                    <option value="under60">Under 1 hour</option>
                    <option value="over60">Over 1 hour</option>
                  </select>
                </div>

                {/* Minimum Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
                  <select
                    value={advancedFilters.rating}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, rating: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="0">Any rating</option>
                    <option value="3">3+ stars</option>
                    <option value="4">4+ stars</option>
                    <option value="4.5">4.5+ stars</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">Quick filters:</span>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={advancedFilters.favorites}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, favorites: e.target.checked }))}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Heart className="ml-2 h-4 w-4 text-red-500" />
                <span className="ml-1 text-sm text-gray-700">Favorites only</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={advancedFilters.quickMeals}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, quickMeals: e.target.checked }))}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Clock className="ml-2 h-4 w-4 text-indigo-600" />
                <span className="ml-1 text-sm text-gray-700">Quick meals only</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Quick Fetch Options */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Recipe Categories:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {RECIPE_SEARCH_QUERIES.slice(0, 6).map((category) => (
            <Button
              key={category.query}
              onClick={() => fetchRecipesFromSpoonacular(category.query)}
              disabled={isFetching}
              variant="slim"
              className="text-xs border border-gray-300 hover:bg-gray-50"
            >
              {category.emoji} {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Fetch Results */}
      {fetchResults && (
        <div className={`mb-6 p-4 border rounded-lg ${
          fetchResults.totalFetched > 0 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {fetchResults.totalFetched > 0 ? (
              <>
                <Download className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Recipe Fetch Results</span>
              </>
            ) : (
              <>
                <X className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">Recipe Fetch Failed</span>
              </>
            )}
          </div>
          <p className={`text-sm ${
            fetchResults.totalFetched > 0 ? 'text-green-700' : 'text-red-700'
          }`}>
            {fetchResults.totalFetched > 0 ? (
              <>
                {fetchResults.message} Found {fetchResults.totalFetched} recipes for &quot;{fetchResults.searchQuery}&quot;.
                {fetchResults.inserted > 0 && ` Added ${fetchResults.inserted} new recipes to your library.`}
                {fetchResults.skipped > 0 && ` Skipped ${fetchResults.skipped} duplicates.`}
              </>
            ) : (
              <>
                Failed to fetch recipes for &quot;{fetchResults.searchQuery}&quot;. Please check the console for more details.
              </>
            )}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 bg-gray-200 rounded"></div>
                <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-full bg-gray-200 rounded mb-3"></div>
              <div className="space-y-2 mb-3">
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
              </div>
              <div className="h-8 w-full bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Recipes Found</h4>
          <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
          <button 
            onClick={clearAllFilters}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* Recipe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <div key={recipe.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-4xl">{recipe.image_emoji || '🍽️'}</div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                    {recipe.difficulty}
                  </div>
                </div>

                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {recipe.title}
                </h4>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {recipe.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {recipe.total_time_minutes} min
                  </div>
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {recipe.servings} servings
                  </div>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                    {recipe.rating}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500 font-medium">{recipe.cuisine}</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {recipe.tags.slice(0, 3).map((tag: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 py-2 rounded-lg text-sm font-medium transition-colors">
                    View Recipe
                  </button>
                  <button 
                    onClick={() => toggleFavorite(recipe.id, recipe.user_favorite || false)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {recipe.user_favorite ? '❤️' : '🤍'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium">
              Load More Recipes
            </button>
          </div>
        </>
      )}

      {/* Database Integration Notice */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-1">📝 Using Mock Data</h4>
        <p className="text-sm text-blue-700">
          Recipe data is currently using sample data. Once you deploy the recipe database migration, this will automatically connect to your Supabase database with full household sharing, favorites, and meal planning features.
        </p>
      </div>

      {/* Recipe Filters Sheet */}
      <RecipeFiltersSheet
        open={showFiltersSheet}
        onClose={() => setShowFiltersSheet(false)}
        value={recipeFilters}
        onApply={handleFiltersApply}
      />
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const RecipeLibrary = memo(RecipeLibraryComponent);
