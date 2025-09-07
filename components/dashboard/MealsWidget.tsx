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


import { Plus, Calendar, Clock, ChefHat } from 'lucide-react';

interface MealPlan {
  id: string;
  meal: 'breakfast' | 'lunch' | 'dinner';
  title: string;
  time?: string;
  prepTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  status: 'planned' | 'cooking' | 'ready';
}

// Mock meal data
const mockMeals: MealPlan[] = [
  {
    id: '1',
    meal: 'dinner',
    title: 'Honey Garlic Chicken',
    time: '6:30 PM',
    prepTime: 25,
    difficulty: 'easy',
    status: 'planned'
  },
  {
    id: '2',
    meal: 'breakfast',
    title: 'Overnight Oats',
    time: 'Tomorrow 7:00 AM',
    prepTime: 5,
    difficulty: 'easy', 
    status: 'ready'
  }
];

const getDifficultyColor = (difficulty: MealPlan['difficulty']) => {
  switch (difficulty) {
    case 'easy':
      return 'text-green-600 bg-green-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'hard':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getStatusColor = (status: MealPlan['status']) => {
  switch (status) {
    case 'ready':
      return 'text-green-600';
    case 'cooking':
      return 'text-orange-600';
    case 'planned':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
};

export function MealsWidget() {
  const todaysDinner = mockMeals.find(meal => meal.meal === 'dinner');
  const tomorrowsBreakfast = mockMeals.find(meal => meal.meal === 'breakfast');

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 h-fit">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600">Meals at a Glance</h3>
        <ChefHat className="h-4 w-4 text-gray-400" />
      </div>

      {/* Tonight's Dinner */}
      {todaysDinner && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-500">Tonight's Dinner</h4>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(todaysDinner.difficulty)}`}>
              {todaysDinner.difficulty}
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="font-medium text-gray-900 mb-1">{todaysDinner.title}</div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {todaysDinner.prepTime} min prep
              </div>
              <div className={`font-medium ${getStatusColor(todaysDinner.status)}`}>
                {todaysDinner.time}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tomorrow's Breakfast */}
      {tomorrowsBreakfast && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-500 mb-2">Tomorrow's Breakfast</h4>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="font-medium text-gray-900 mb-1">{tomorrowsBreakfast.title}</div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {tomorrowsBreakfast.prepTime} min prep
              </div>
              <div className={`font-medium ${getStatusColor(tomorrowsBreakfast.status)}`}>
                Ready to go! ✅
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-2">
        <button className="w-full py-2 px-3 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center">
          <Plus className="h-3 w-3 mr-1" />
          Pick Dinner Recipe
        </button>
        
        <button className="w-full py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center">
          <Calendar className="h-3 w-3 mr-1" />
          Weekly Meal Plan
        </button>
      </div>

      {/* This Week Stats */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Meals planned this week</span>
          <span className="font-medium text-gray-700">4/7</span>
        </div>
      </div>
    </div>
  );
}
