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

import { useMemo } from 'react';
import { Calendar, Clock, DollarSign, Users, ChefHat, CheckCircle } from 'lucide-react';
import { MealPlan, Recipe } from '@/types/recipes';

interface WeekSummaryProps {
  mealPlans: MealPlan[];
  recipes: Recipe[];
  weekStartDate: Date;
}

interface WeekStats {
  totalMeals: number;
  completedMeals: number;
  estimatedCost: number;
  totalCookTime: number;
  totalPrepTime: number;
  averageRating: number;
  dietaryBreakdown: Record<string, number>;
  cuisineBreakdown: Record<string, number>;
  difficultyBreakdown: Record<string, number>;
  upcomingMeals: Array<{
    day: string;
    mealType: string;
    recipeName: string;
    time?: string;
  }>;
}

export function WeekSummary({ mealPlans, recipes, weekStartDate }: WeekSummaryProps) {
  const weekStats = useMemo(() => {
    const stats: WeekStats = {
      totalMeals: mealPlans.length,
      completedMeals: mealPlans.filter(plan => plan.status === 'completed').length,
      estimatedCost: 0,
      totalCookTime: 0,
      totalPrepTime: 0,
      averageRating: 0,
      dietaryBreakdown: {},
      cuisineBreakdown: {},
      difficultyBreakdown: {},
      upcomingMeals: []
    };

    let totalRating = 0;
    let ratedRecipes = 0;

    mealPlans.forEach(plan => {
      const recipe = recipes.find(r => r.id === plan.recipe_id);
      if (!recipe) return;

      // Cost calculation (using servings as a proxy for cost)
      const estimatedCost = recipe.servings * 3; // Rough estimate $3 per serving
      stats.estimatedCost += estimatedCost;

      // Time calculations
      if (recipe.prep_time_minutes) {
        stats.totalPrepTime += recipe.prep_time_minutes;
      }
      if (recipe.cook_time_minutes) {
        stats.totalCookTime += recipe.cook_time_minutes;
      }

      // Rating calculation
      if (recipe.rating > 0) {
        totalRating += recipe.rating;
        ratedRecipes++;
      }

      // Dietary breakdown
      if (recipe.diet_types) {
        recipe.diet_types.forEach(diet => {
          stats.dietaryBreakdown[diet] = (stats.dietaryBreakdown[diet] || 0) + 1;
        });
      }

      // Cuisine breakdown
      if (recipe.cuisine) {
        stats.cuisineBreakdown[recipe.cuisine] = 
          (stats.cuisineBreakdown[recipe.cuisine] || 0) + 1;
      }

      // Difficulty breakdown
      if (recipe.difficulty) {
        stats.difficultyBreakdown[recipe.difficulty] = 
          (stats.difficultyBreakdown[recipe.difficulty] || 0) + 1;
      }

      // Upcoming meals (next 3 days)
      const planDate = new Date(plan.planned_date);
      const today = new Date();
      const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));

      if (planDate >= today && planDate <= threeDaysFromNow && plan.status === 'planned') {
        stats.upcomingMeals.push({
          day: planDate.toLocaleDateString('en-US', { weekday: 'short' }),
          mealType: plan.meal_type,
          recipeName: recipe.title,
          time: planDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        });
      }
    });

    stats.averageRating = ratedRecipes > 0 ? totalRating / ratedRecipes : 0;

    // Sort upcoming meals by date
    stats.upcomingMeals.sort((a, b) => {
      const dayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
    });

    return stats;
  }, [mealPlans, recipes]);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  };

  const getProgressPercentage = () => {
    return weekStats.totalMeals > 0 ? 
      Math.round((weekStats.completedMeals / weekStats.totalMeals) * 100) : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Week Summary</h2>
        <div className="text-sm text-gray-500">
          {weekStartDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })} - {new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Week Progress</span>
          <span className="font-medium">{weekStats.completedMeals}/{weekStats.totalMeals} meals</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 text-center">
          {getProgressPercentage()}% complete
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-700">{weekStats.totalMeals}</div>
          <div className="text-xs text-blue-600">Total Meals</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 text-center">
          <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-700">
            ${weekStats.estimatedCost.toFixed(0)}
          </div>
          <div className="text-xs text-green-600">Est. Cost</div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <Clock className="h-6 w-6 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-orange-700">
            {formatTime(weekStats.totalCookTime + weekStats.totalPrepTime)}
          </div>
          <div className="text-xs text-orange-600">Total Time</div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-700 mb-2">
            {weekStats.averageRating > 0 ? weekStats.averageRating.toFixed(1) : '-'}
          </div>
          <div className="text-xs text-yellow-600">Avg Rating ⭐</div>
        </div>
      </div>

      {/* Upcoming Meals */}
      {weekStats.upcomingMeals.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ChefHat className="h-5 w-5 mr-2 text-gray-600" />
            Coming Up
          </h3>
          <div className="space-y-2">
            {weekStats.upcomingMeals.slice(0, 3).map((meal, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium text-gray-900 w-10">
                    {meal.day}
                  </div>
                  <div className="text-sm text-gray-600 capitalize w-20">
                    {meal.mealType}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {meal.recipeName}
                  </div>
                </div>
                {meal.time && (
                  <div className="text-xs text-gray-500">
                    {meal.time}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Breakdown Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Dietary Breakdown */}
        {Object.keys(weekStats.dietaryBreakdown).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">Dietary Types</h4>
            <div className="space-y-1">
              {Object.entries(weekStats.dietaryBreakdown)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([diet, count]) => (
                <div key={diet} className="flex justify-between text-xs">
                  <span className="text-gray-600 capitalize">{diet}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cuisine Breakdown */}
        {Object.keys(weekStats.cuisineBreakdown).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">Cuisines</h4>
            <div className="space-y-1">
              {Object.entries(weekStats.cuisineBreakdown)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([cuisine, count]) => (
                <div key={cuisine} className="flex justify-between text-xs">
                  <span className="text-gray-600 capitalize">{cuisine}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Difficulty Breakdown */}
        {Object.keys(weekStats.difficultyBreakdown).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">Difficulty</h4>
            <div className="space-y-1">
              {Object.entries(weekStats.difficultyBreakdown)
                .sort(([,a], [,b]) => b - a)
                .map(([difficulty, count]) => (
                <div key={difficulty} className="flex justify-between text-xs">
                  <span className="text-gray-600 capitalize">{difficulty}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Week Completion Message */}
      {getProgressPercentage() === 100 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
          <div>
            <div className="text-sm font-medium text-green-800">Week Complete!</div>
            <div className="text-xs text-green-600">
              Great job finishing all your planned meals this week.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
