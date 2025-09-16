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
import { RecipeWithDetails, RECIPE_DIFFICULTIES } from '@/types/recipes';
import { AddToMealPlanModal } from './AddToMealPlanModal';

// Supabase integration coming soon
// const supabase = createClient();

const getDifficultyColor = (difficulty: RecipeWithDetails['difficulty']) => {
  const difficultyConfig = RECIPE_DIFFICULTIES.find(
    (d) => d.value === difficulty
  );
  return difficultyConfig?.color || 'text-gray-600 bg-gray-100';
};

export function MealFavorites() {
  const [favoriteRecipes, setFavoriteRecipes] = useState<RecipeWithDetails[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [totalFavorites, setTotalFavorites] = useState(0);
  const [selectedRecipe, setSelectedRecipe] =
    useState<RecipeWithDetails | null>(null);
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);

  const openMealPlanModal = (recipe: RecipeWithDetails) => {
    setSelectedRecipe(recipe);
    setShowMealPlanModal(true);
  };

  const handleMealPlanSuccess = () => {
    // Refresh the data or show success message
    setShowMealPlanModal(false);
    setSelectedRecipe(null);
  };

  useEffect(() => {
    // For now, load mock data until recipe tables are deployed
    loadMockData();
  }, []);

  const loadMockData = () => {
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
        instructions: [
          'Season chicken',
          'Cook in pan',
          'Add sauce',
          'Simmer until done'
        ],
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
        creator: { id: 'user-1', name: 'Kyle', avatar_url: undefined }
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
        instructions: [
          'Cook pasta',
          'Fry pancetta',
          'Mix eggs and cheese',
          'Combine everything'
        ],
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
        user_favorite: true,
        creator: { id: 'user-1', name: 'Kyle', avatar_url: undefined }
      }
    ];

    setFavoriteRecipes(mockRecipes);
    setTotalFavorites(mockRecipes.length);
    setLoading(false);
  };

  // Database integration functions (placeholder for future implementation)
  // const fetchFavoriteRecipes = async () => {
  //   console.log('Recipe tables not yet deployed - using mock data');
  //   loadMockData();
  // };

  const toggleFavorite = async (recipeId: string, isFavorite: boolean) => {
    // For now, just update local state until recipe tables are deployed
    if (isFavorite) {
      setFavoriteRecipes((prev) =>
        prev.filter((recipe) => recipe.id !== recipeId)
      );
      setTotalFavorites((prev) => prev - 1);
    }
    console.log(`Toggle favorite for recipe ${recipeId}: ${!isFavorite}`);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
          <div className="h-5 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl p-4"
            >
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
        <h3 className="text-lg font-semibold text-gray-900">
          Your Favorite Recipes
        </h3>
        <button className="text-sm text-pink-600 hover:text-pink-700 font-medium">
          View All ({totalFavorites})
        </button>
      </div>

      {favoriteRecipes.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No Favorite Recipes Yet
          </h4>
          <p className="text-gray-600 mb-4">
            Start favoriting recipes to see them here!
          </p>
          <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium">
            Browse Recipe Library
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favoriteRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
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
                      <span className="text-sm text-gray-600">
                        {recipe.rating}
                      </span>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}
                    >
                      {recipe.difficulty}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {recipe.tags.slice(0, 3).map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => openMealPlanModal(recipe)}
                  className="w-full bg-pink-50 hover:bg-pink-100 text-pink-700 py-2 rounded-lg text-sm font-medium transition-colors"
                >
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
                <p className="text-sm text-pink-700">
                  Browse our recipe collection or import from your favorite
                  cooking sites.
                </p>
              </div>
              <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Browse Recipes
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add to Meal Plan Modal */}
      {selectedRecipe && (
        <AddToMealPlanModal
          isOpen={showMealPlanModal}
          onClose={() => {
            setShowMealPlanModal(false);
            setSelectedRecipe(null);
          }}
          recipe={selectedRecipe}
          onSuccess={handleMealPlanSuccess}
        />
      )}
    </div>
  );
}
