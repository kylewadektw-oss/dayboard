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

import { useState, useMemo } from 'react';
import { Lightbulb, Clock, Star, TrendingUp, Calendar, Shuffle } from 'lucide-react';
import { Recipe, MealPlan, RecipeMealType } from '@/types/recipes';

interface SmartMealSuggestionsProps {
  recipes: Recipe[];
  mealPlans: MealPlan[];
  selectedDate: Date;
  mealType: RecipeMealType;
  dietaryRestrictions?: string[];
  maxCookTime?: number;
  onSelectRecipe: (recipe: Recipe) => void;
  className?: string;
}

interface SuggestionReason {
  type: 'trending' | 'quick' | 'favorite' | 'seasonal' | 'balanced' | 'new';
  label: string;
  icon: React.ReactNode;
  color: string;
}

interface RecipeSuggestion {
  recipe: Recipe;
  score: number;
  reasons: SuggestionReason[];
}

const SUGGESTION_REASONS: Record<string, SuggestionReason> = {
  trending: {
    type: 'trending',
    label: 'Popular this week',
    icon: <TrendingUp className="h-4 w-4" />,
    color: 'text-blue-600 bg-blue-100'
  },
  quick: {
    type: 'quick',
    label: 'Quick & easy',
    icon: <Clock className="h-4 w-4" />,
    color: 'text-green-600 bg-green-100'
  },
  favorite: {
    type: 'favorite',
    label: 'Household favorite',
    icon: <Star className="h-4 w-4" />,
    color: 'text-yellow-600 bg-yellow-100'
  },
  seasonal: {
    type: 'seasonal',
    label: 'Perfect for fall',
    icon: <Calendar className="h-4 w-4" />,
    color: 'text-orange-600 bg-orange-100'
  },
  balanced: {
    type: 'balanced',
    label: 'Balanced nutrition',
    icon: <Lightbulb className="h-4 w-4" />,
    color: 'text-purple-600 bg-purple-100'
  },
  new: {
    type: 'new',
    label: 'Try something new',
    icon: <Shuffle className="h-4 w-4" />,
    color: 'text-pink-600 bg-pink-100'
  }
};

export function SmartMealSuggestions({
  recipes,
  mealPlans,
  selectedDate,
  mealType,
  dietaryRestrictions = [],
  maxCookTime,
  onSelectRecipe,
  className = ''
}: SmartMealSuggestionsProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const suggestions = useMemo(() => {
    // Filter recipes based on meal type and dietary restrictions
    const filteredRecipes = recipes.filter(recipe => {
      // Check meal type
      const matchesMealType = recipe.meal_type?.some(type => type === mealType);
      if (!matchesMealType) return false;

      // Check dietary restrictions
      if (dietaryRestrictions.length > 0) {
        const hasRequiredDiets = dietaryRestrictions.every(diet =>
          recipe.diet_types?.some(recipeType => recipeType === diet)
        );
        if (!hasRequiredDiets) return false;
      }

      // Check max cook time
      if (maxCookTime && recipe.total_time_minutes > maxCookTime) {
        return false;
      }

      return true;
    });

    // Calculate suggestion scores and reasons
    const scoredSuggestions: RecipeSuggestion[] = filteredRecipes.map(recipe => {
      let score = 0;
      const reasons: SuggestionReason[] = [];

      // Base score from rating
      score += recipe.rating * 10;

      // Recently cooked recipes get lower priority
      const recentPlans = mealPlans.filter(plan => 
        plan.recipe_id === recipe.id &&
        new Date(plan.planned_date) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      );
      if (recentPlans.length === 0) {
        score += 20; // Bonus for not cooked recently
      } else {
        score -= recentPlans.length * 5; // Penalty for recent cooking
      }

      // High rating bonus
      if (recipe.rating >= 4.5) {
        score += 15;
        reasons.push(SUGGESTION_REASONS.favorite);
      }

      // Quick meal bonus
      if (recipe.total_time_minutes <= 30) {
        score += 10;
        reasons.push(SUGGESTION_REASONS.quick);
      }

      // Favorite bonus
      if (recipe.is_favorite) {
        score += 12;
        if (!reasons.some(r => r.type === 'favorite')) {
          reasons.push(SUGGESTION_REASONS.favorite);
        }
      }

      // Popular/trending logic (cooked frequently by others)
      const popularityScore = Math.min(recipe.rating_count / 10, 5);
      score += popularityScore;
      if (recipe.rating_count >= 50) {
        reasons.push(SUGGESTION_REASONS.trending);
      }

      // Seasonal logic (fall recipes)
      const currentMonth = selectedDate.getMonth(); // 0-11
      const isFall = currentMonth >= 8 && currentMonth <= 10; // Sep-Nov
      if (isFall) {
        const fallKeywords = ['pumpkin', 'apple', 'cinnamon', 'squash', 'butternut', 'sweet potato', 'cranberry'];
        const isSeasonalRecipe = fallKeywords.some(keyword => 
          recipe.title.toLowerCase().includes(keyword) ||
          recipe.description?.toLowerCase().includes(keyword) ||
          recipe.tags.some(tag => tag.toLowerCase().includes(keyword))
        );
        if (isSeasonalRecipe) {
          score += 8;
          reasons.push(SUGGESTION_REASONS.seasonal);
        }
      }

      // Balanced nutrition bonus
      if (recipe.nutrition) {
        const hasGoodBalance = recipe.nutrition.protein && recipe.nutrition.fiber;
        if (hasGoodBalance) {
          score += 5;
          reasons.push(SUGGESTION_REASONS.balanced);
        }
      }

      // New recipe bonus (never cooked)
      const neverCooked = !mealPlans.some(plan => plan.recipe_id === recipe.id);
      if (neverCooked) {
        score += 7;
        reasons.push(SUGGESTION_REASONS.new);
      }

      // Random factor for variety
      score += Math.random() * 10;

      return { recipe, score, reasons };
    });

    // Sort by score and return top suggestions
    return scoredSuggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [recipes, mealPlans, selectedDate, mealType, dietaryRestrictions, maxCookTime]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  };

  if (suggestions.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 text-center ${className}`}>
        <Lightbulb className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No suggestions available for your current filters.</p>
        <p className="text-sm text-gray-500 mt-1">Try adjusting your dietary restrictions or time limits.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Smart Suggestions</h3>
          </div>
          <button
            onClick={handleRefresh}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
          >
            <Shuffle className="h-4 w-4 mr-1" />
            Refresh
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Personalized {mealType} recommendations for {selectedDate.toLocaleDateString()}
        </p>
      </div>

      {/* Suggestions Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map(({ recipe, reasons }) => (
            <div
              key={`${recipe.id}-${refreshKey}`}
              className="group border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => onSelectRecipe(recipe)}
            >
              {/* Recipe Header */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                    {recipe.image_emoji || '🍽️'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">
                    {recipe.title}
                  </h4>
                  <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(recipe.total_time_minutes)}
                    </span>
                    <span className="flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      {recipe.rating.toFixed(1)}
                    </span>
                    <span>{recipe.servings} servings</span>
                  </div>
                </div>
              </div>

              {/* Suggestion Reasons */}
              <div className="mt-3 flex flex-wrap gap-1">
                {reasons.slice(0, 2).map((reason, reasonIndex) => (
                  <span
                    key={reasonIndex}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${reason.color}`}
                  >
                    {reason.icon}
                    <span className="ml-1">{reason.label}</span>
                  </span>
                ))}
                {reasons.length > 2 && (
                  <span className="text-xs text-gray-500 px-2 py-1">
                    +{reasons.length - 2} more
                  </span>
                )}
              </div>

              {/* Quick Stats */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Difficulty: <span className="capitalize">{recipe.difficulty}</span></span>
                  {recipe.cuisine && (
                    <span>Cuisine: <span className="capitalize">{recipe.cuisine}</span></span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Recipe Prompt */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t see what you&apos;re looking for?{' '}
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Add a new recipe
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
