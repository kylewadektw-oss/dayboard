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


import { Calendar, Plus, Clock, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { MealPlan, MealPlanWithRecipe, MEAL_TYPES, RecipeMealType, RecipeDietType } from '@/types/recipes';

const supabase = createClient();

interface WeeklyMealPlan {
  day: string;
  date: string;
  dayNumber: number;
  meals: {
    breakfast?: MealPlanWithRecipe;
    lunch?: MealPlanWithRecipe;
    dinner?: MealPlanWithRecipe;
  };
}

const getWeekDates = () => {
  const today = new Date();
  const currentDay = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - currentDay + 1);
  
  const weekDays = [];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    weekDays.push({
      day: dayNames[i],
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayNumber: date.getDate(),
      meals: {}
    });
  }
  
  return weekDays;
};

export function WeeklyMealPlan() {
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyMealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMeals, setTotalMeals] = useState(0);
  const [plannedMeals, setPlannedMeals] = useState(0);

  useEffect(() => {
    fetchWeeklyMealPlan();
  }, []);

  const fetchWeeklyMealPlan = async () => {
    try {
      // For now, use mock data until recipe tables are deployed
      const weekDates = getWeekDates();
      
      // Add some mock meal plans
      const mockMealPlans = weekDates.map(day => ({
        ...day,
        meals: {
          breakfast: day.day === 'Monday' ? {
            id: '1',
            recipe_id: '1',
            household_id: 'household-1',
            planned_by: 'user-1',
            planned_date: day.date,
            meal_type: 'breakfast' as const,
            servings_planned: 1,
            status: 'planned' as const,
            created_at: '2025-09-10',
            updated_at: '2025-09-10',
            recipe: {
              id: '1',
              title: 'Overnight Oats',
              description: 'Healthy overnight oats',
              image_emoji: '🥣',
              prep_time_minutes: 5,
              cook_time_minutes: 0,
              total_time_minutes: 5,
              servings: 1,
              difficulty: 'easy' as const,
              cuisine: 'American',
              meal_type: ['breakfast'] as RecipeMealType[],
              diet_types: ['none'] as RecipeDietType[],
              tags: ['healthy', 'quick'],
              ingredients: [],
              instructions: [],
              rating: 4.5,
              rating_count: 10,
              household_id: 'household-1',
              created_by: 'user-1',
              is_favorite: false,
              is_public: false,
              is_verified: true,
              created_at: '2025-09-10',
              updated_at: '2025-09-10'
            }
          } : undefined,
          lunch: day.day === 'Tuesday' ? {
            id: '2',
            recipe_id: '2',
            household_id: 'household-1',
            planned_by: 'user-1',
            planned_date: day.date,
            meal_type: 'lunch' as const,
            servings_planned: 2,
            status: 'planned' as const,
            created_at: '2025-09-10',
            updated_at: '2025-09-10',
            recipe: {
              id: '2',
              title: 'Leftover Chicken',
              description: 'Quick leftover meal',
              image_emoji: '🍗',
              prep_time_minutes: 5,
              cook_time_minutes: 0,
              total_time_minutes: 5,
              servings: 2,
              difficulty: 'easy' as const,
              cuisine: 'American',
              meal_type: ['lunch'] as RecipeMealType[],
              diet_types: ['none'] as RecipeDietType[],
              tags: ['quick', 'leftovers'],
              ingredients: [],
              instructions: [],
              rating: 4.0,
              rating_count: 5,
              household_id: 'household-1',
              created_by: 'user-1',
              is_favorite: false,
              is_public: false,
              is_verified: true,
              created_at: '2025-09-10',
              updated_at: '2025-09-10'
            }
          } : undefined,
          dinner: day.day === 'Monday' ? {
            id: '3',
            recipe_id: '3',
            household_id: 'household-1',
            planned_by: 'user-1',
            planned_date: day.date,
            meal_type: 'dinner' as const,
            servings_planned: 4,
            status: 'planned' as const,
            created_at: '2025-09-10',
            updated_at: '2025-09-10',
            recipe: {
              id: '3',
              title: 'Honey Garlic Chicken',
              description: 'Delicious honey garlic chicken',
              image_emoji: '🍗',
              prep_time_minutes: 15,
              cook_time_minutes: 25,
              total_time_minutes: 40,
              servings: 4,
              difficulty: 'medium' as const,
              cuisine: 'Asian',
              meal_type: ['dinner'] as RecipeMealType[],
              diet_types: ['none'] as RecipeDietType[],
              tags: ['family-friendly', 'chicken'],
              ingredients: [],
              instructions: [],
              rating: 4.8,
              rating_count: 15,
              household_id: 'household-1',
              created_by: 'user-1',
              is_favorite: true,
              is_public: false,
              is_verified: true,
              created_at: '2025-09-10',
              updated_at: '2025-09-10'
            }
          } : undefined,
        }
      }));

      setWeeklyPlan(mockMealPlans);
      
      // Calculate stats
      const total = mockMealPlans.length * 3; // 7 days * 3 meals
      const planned = mockMealPlans.reduce((count, day) => {
        return count + Object.values(day.meals).filter(meal => meal).length;
      }, 0);
      
      setTotalMeals(total);
      setPlannedMeals(planned);

    } catch (error) {
      console.error('Error in fetchWeeklyMealPlan:', error);
      setWeeklyPlan(getWeekDates());
    } finally {
      setLoading(false);
    }
  };

  const addMealToPlan = async (dayNumber: number, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    // This would open a modal to select a recipe
    console.log(`Add ${mealType} for day ${dayNumber}`);
  };

  const removeMealFromPlan = async (mealPlanId: string) => {
    try {
      // For now, remove from application_logs until meal_plans table exists
      await supabase
        .from('application_logs')
        .delete()
        .eq('id', mealPlanId)
        .eq('component', 'meal_plan');
      
      fetchWeeklyMealPlan(); // Refresh
    } catch (error) {
      console.error('Error removing meal:', error);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-64 bg-gray-200 rounded"></div>
          <div className="h-10 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-20 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">This Week's Meal Plan</h3>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
          <Plus className="h-4 w-4 mr-1" />
          Auto-Fill Week
        </button>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {weeklyPlan.map((day) => (
          <div key={day.day} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-center mb-4">
              <div className="font-semibold text-gray-900">{day.day}</div>
              <div className="text-sm text-gray-500">{day.date}</div>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {/* Breakfast */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 hover:border-orange-300 transition-colors">
                {day.meals.breakfast ? (
                  <div className="relative group">
                    <div className="flex items-center mb-1">
                      <span className="text-sm">{day.meals.breakfast.recipe?.image_emoji || '🌅'}</span>
                      <span className="text-xs text-gray-500 ml-1">Breakfast</span>
                      <button
                        onClick={() => removeMealFromPlan(day.meals.breakfast!.id)}
                        className="ml-auto opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-sm font-medium text-gray-900">{day.meals.breakfast.recipe?.title}</div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {day.meals.breakfast.recipe?.total_time_minutes} min
                      <Users className="h-3 w-3 ml-2 mr-1" />
                      {day.meals.breakfast.recipe?.servings}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => addMealToPlan(day.dayNumber, 'breakfast')}
                    className="w-full text-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-500">Add Breakfast</div>
                  </button>
                )}
              </div>

              {/* Lunch */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 hover:border-yellow-300 transition-colors">
                {day.meals.lunch ? (
                  <div className="relative group">
                    <div className="flex items-center mb-1">
                      <span className="text-sm">{day.meals.lunch.recipe?.image_emoji || '☀️'}</span>
                      <span className="text-xs text-gray-500 ml-1">Lunch</span>
                      <button
                        onClick={() => removeMealFromPlan(day.meals.lunch!.id)}
                        className="ml-auto opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-sm font-medium text-gray-900">{day.meals.lunch.recipe?.title}</div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {day.meals.lunch.recipe?.total_time_minutes} min
                      <Users className="h-3 w-3 ml-2 mr-1" />
                      {day.meals.lunch.recipe?.servings}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => addMealToPlan(day.dayNumber, 'lunch')}
                    className="w-full text-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-500">Add Lunch</div>
                  </button>
                )}
              </div>

              {/* Dinner */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 hover:border-purple-300 transition-colors">
                {day.meals.dinner ? (
                  <div className="relative group">
                    <div className="flex items-center mb-1">
                      <span className="text-sm">{day.meals.dinner.recipe?.image_emoji || '🌙'}</span>
                      <span className="text-xs text-gray-500 ml-1">Dinner</span>
                      <button
                        onClick={() => removeMealFromPlan(day.meals.dinner!.id)}
                        className="ml-auto opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-sm font-medium text-gray-900">{day.meals.dinner.recipe?.title}</div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {day.meals.dinner.recipe?.total_time_minutes} min
                      <Users className="h-3 w-3 ml-2 mr-1" />
                      {day.meals.dinner.recipe?.servings}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => addMealToPlan(day.dayNumber, 'dinner')}
                    className="w-full text-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-500">Add Dinner</div>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Summary */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-blue-900">Weekly Progress</h4>
            <p className="text-sm text-blue-700">
              {plannedMeals} out of {totalMeals} meals planned ({Math.round((plannedMeals / totalMeals) * 100)}% complete)
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Generate Grocery List
          </button>
        </div>
      </div>
    </div>
  );
}
