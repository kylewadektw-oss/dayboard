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


import { Heart, Clock, Users, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { RecipeWithDetails, RECIPE_DIFFICULTIES } from '@/types/recipes';
import { Database } from '@/types_db';

const supabase = createClient();

const getDifficultyColor = (difficulty: RecipeWithDetails['difficulty']) => {
  const difficultyConfig = RECIPE_DIFFICULTIES.find(d => d.value === difficulty);
  return difficultyConfig?.color || 'text-gray-600 bg-gray-100';
};

export function MealFavorites() {
  const [favoriteRecipes, setFavoriteRecipes] = useState<RecipeWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalFavorites, setTotalFavorites] = useState(0);

  useEffect(() => {
    fetchFavoriteRecipes();
  }, []);

  const fetchFavoriteRecipes = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Get user's household ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('household_id')
        .eq('id', user.user.id)
        .single();

      if (!profile?.household_id) return;

      // Fetch favorite recipes with user's favorite status
      const { data: favoriteData, error } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_favorites!inner(user_id),
          profiles:created_by(id, name, avatar_url)
        `)
        .eq('household_id', profile.household_id)
        .eq('recipe_favorites.user_id', user.user.id)
        .limit(4)
        .order('recipe_favorites.created_at', { ascending: false });

      if (error) {
        console.error('Error fetching favorite recipes:', error);
        return;
      }

      // Get total count of favorites
      const { count } = await supabase
        .from('recipe_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.user.id);

      setTotalFavorites(count || 0);

      // Transform data to match our interface
      const recipes: RecipeWithDetails[] = favoriteData?.map(recipe => ({
        ...recipe,
        user_favorite: true,
        creator: recipe.profiles ? {
          id: recipe.profiles.id,
          name: recipe.profiles.name || 'Unknown',
          avatar_url: recipe.profiles.avatar_url
        } : undefined
      })) || [];

      setFavoriteRecipes(recipes);
    } catch (error) {
      console.error('Error in fetchFavoriteRecipes:', error);
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
        
        setFavoriteRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
        setTotalFavorites(prev => prev - 1);
      } else {
        // Add to favorites
        await supabase
          .from('recipe_favorites')
          .insert({
            recipe_id: recipeId,
            user_id: user.user.id
          });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
          <div className="h-5 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="h-8 w-8 bg-gray-200 rounded mb-3"></div>
              <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-full bg-gray-200 rounded mb-3"></div>
              <div className="h-10 w-full bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Your Favorite Recipes</h3>
        <button className="text-sm text-pink-600 hover:text-pink-700 font-medium">
          View All ({totalFavorites})
        </button>
      </div>

      {favoriteRecipes.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Favorite Recipes Yet</h4>
          <p className="text-gray-600 mb-4">Start favoriting recipes to see them here!</p>
          <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium">
            Browse Recipe Library
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favoriteRecipes.map((recipe) => (
              <div key={recipe.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-3xl">{recipe.image_emoji || '🍽️'}</div>
                  <button 
                    onClick={() => toggleFavorite(recipe.id, true)}
                    className="flex items-center transition-colors"
                  >
                    <Heart className="h-4 w-4 text-pink-500 fill-current" />
                  </button>
                </div>

                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {recipe.title}
                </h4>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {recipe.total_time_minutes} min
                    </div>
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {recipe.servings} servings
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm text-gray-600">{recipe.rating}</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                      {recipe.difficulty}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {recipe.tags.slice(0, 3).map((tag: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                <button className="w-full bg-pink-50 hover:bg-pink-100 text-pink-700 py-2 rounded-lg text-sm font-medium transition-colors">
                  Add to This Week
                </button>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 p-4 bg-pink-50 border border-pink-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-pink-900">Need inspiration?</h4>
                <p className="text-sm text-pink-700">Browse our recipe collection or import from your favorite cooking sites.</p>
              </div>
              <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Browse Recipes
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
