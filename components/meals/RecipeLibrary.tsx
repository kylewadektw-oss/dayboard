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


import { Search, Filter, Clock, Users, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { RecipeWithDetails, RecipeFilters, RECIPE_DIFFICULTIES } from '@/types/recipes';

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

  useEffect(() => {
    fetchRecipes();
    fetchUserFavorites();
  }, [activeFilter, searchTerm]);

  const fetchUserFavorites = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: favorites } = await supabase
        .from('recipe_favorites')
        .select('recipe_id')
        .eq('user_id', user.user.id);

      if (favorites) {
        setUserFavorites(new Set(favorites.map(f => f.recipe_id)));
      }
    } catch (error) {
      console.error('Error fetching user favorites:', error);
    }
  };

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Get user's household ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('household_id')
        .eq('id', user.user.id)
        .single();

      if (!profile?.household_id) return;

      let query = supabase
        .from('recipes')
        .select(`
          *,
          profiles:created_by(id, name, avatar_url)
        `)
        .eq('household_id', profile.household_id);

      // Apply search filter
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,cuisine.ilike.%${searchTerm}%`);
      }

      // Apply category filters
      switch (activeFilter) {
        case 'Quick (<20min)':
          query = query.lte('total_time_minutes', 20);
          break;
        case 'Vegetarian':
          query = query.contains('diet_types', ['vegetarian']);
          break;
        case 'Chicken':
          query = query.contains('tags', ['chicken']);
          break;
        case 'Beef':
          query = query.contains('tags', ['beef']);
          break;
        case 'Italian':
          query = query.eq('cuisine', 'Italian');
          break;
        case 'Mexican':
          query = query.eq('cuisine', 'Mexican');
          break;
        case 'Asian':
          query = query.in('cuisine', ['Chinese', 'Japanese', 'Thai', 'Korean', 'Vietnamese']);
          break;
      }

      const { data: recipeData, error } = await query
        .order('rating', { ascending: false })
        .limit(12);

      if (error) {
        console.error('Error fetching recipes:', error);
        return;
      }

      // Transform data to match our interface
      const transformedRecipes: RecipeWithDetails[] = recipeData?.map(recipe => ({
        ...recipe,
        user_favorite: userFavorites.has(recipe.id),
        creator: recipe.profiles ? {
          id: recipe.profiles.id,
          name: recipe.profiles.name || 'Unknown',
          avatar_url: recipe.profiles.avatar_url
        } : undefined
      })) || [];

      setRecipes(transformedRecipes);
    } catch (error) {
      console.error('Error in fetchRecipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (recipeId: string, isFavorite: boolean) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from('recipe_favorites')
          .delete()
          .eq('recipe_id', recipeId)
          .eq('user_id', user.user.id);
        
        setUserFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(recipeId);
          return newSet;
        });
      } else {
        // Add to favorites
        await supabase
          .from('recipe_favorites')
          .insert({
            recipe_id: recipeId,
            user_id: user.user.id
          });
        
        setUserFavorites(prev => new Set(prev).add(recipeId));
      }

      // Update the recipe in state
      setRecipes(prev => 
        prev.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, user_favorite: !isFavorite }
            : recipe
        )
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes, ingredients, or cuisine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

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
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="font-medium text-green-900 mb-1">✅ Connected to Database</h4>
        <p className="text-sm text-green-700">
          Recipe data is now stored in your Supabase database with full household sharing, favorites, and meal planning features.
        </p>
      </div>
    </div>
  );
}
