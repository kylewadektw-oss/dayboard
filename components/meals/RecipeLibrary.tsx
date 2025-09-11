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


import { Search, Filter, Clock, Users, Star, Download, Loader2, RefreshCw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { RecipeWithDetails, RecipeFilters, RECIPE_DIFFICULTIES } from '@/types/recipes';
import { fetchRecipesFromAPI, RECIPE_SEARCH_QUERIES, type FetchRecipesResponse } from '@/utils/supabase/recipe-fetcher';
import Button from '@/components/ui/Button';

const supabase = createClient();

const getDifficultyColor = (difficulty: RecipeWithDetails['difficulty']) => {
  const difficultyConfig = RECIPE_DIFFICULTIES.find(d => d.value === difficulty);
  return difficultyConfig?.color || 'text-gray-600 bg-gray-100';
};

export function RecipeLibrary() {
  const [recipes, setRecipes] = useState<RecipeWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());
  const [isFetching, setIsFetching] = useState(false);
  const [fetchResults, setFetchResults] = useState<FetchRecipesResponse | null>(null);

  useEffect(() => {
    loadMockRecipes();
  }, [activeFilter, searchTerm]);

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

  const fetchUserFavorites = async () => {
    // Mock user favorites - will be replaced with real Supabase call once tables exist
    console.log('Using mock favorites data until recipe tables are deployed');
  };

  const fetchRecipes = async () => {
    // This will be enabled once recipe tables are deployed
    console.log('Recipe tables not yet deployed - using mock data');
    loadMockRecipes();
  };

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
        loadMockRecipes(); // This will eventually be replaced with real DB call
      }
      
      // Show success message
      const message = `Successfully fetched ${result.totalFetched} recipes! ${result.inserted} new recipes added to your library.`;
      alert(message);
    } catch (error: any) {
      console.error('Error fetching recipes:', error);
      
      // Provide helpful error messages
      let errorMessage = 'Failed to fetch recipes';
      
      if (error.message.includes('401')) {
        errorMessage = 'API Authentication Error: Please check your Spoonacular API key in .env.local file. Make sure you have replaced the placeholder with your actual API key.';
      } else if (error.message.includes('402')) {
        errorMessage = 'API Quota Exceeded: You have reached your daily limit for the Spoonacular API. Please wait until tomorrow or upgrade your plan.';
      } else if (error.message.includes('key not configured')) {
        errorMessage = 'API Key Missing: Please add your Spoonacular API key to the .env.local file.';
      } else if (error.message.includes('placeholder')) {
        errorMessage = 'API Key Setup Required: Please replace the placeholder API key with your actual Spoonacular API key.';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network Error: Please check your internet connection and try again.';
      } else {
        errorMessage = `Error: ${error.message}`;
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
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </button>
      </div>

      {/* Filter Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
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
                {fetchResults.message} Found {fetchResults.totalFetched} recipes for "{fetchResults.searchQuery}".
                {fetchResults.inserted > 0 && ` Added ${fetchResults.inserted} new recipes to your library.`}
                {fetchResults.skipped > 0 && ` Skipped ${fetchResults.skipped} duplicates.`}
              </>
            ) : (
              <>
                Failed to fetch recipes for "{fetchResults.searchQuery}". Please check the console for more details.
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
      ) : recipes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Recipes Found</h4>
          <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setActiveFilter('All');
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* Recipe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
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
    </div>
  );
}
