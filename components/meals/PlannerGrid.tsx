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

'use client';

import React, { useState } from 'react';
import { Calendar, Sparkles, Shuffle, MoreHorizontal } from 'lucide-react';
import { PlannerCell } from './PlannerCell';
// import { AddToWeekPopover } from './AddToWeekPopover'; // Feature coming soon

interface MealData {
  id: number;
  title: string;
  image_url?: string;
  quick_meal?: boolean;
  total_time_minutes?: number;
  servings?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  is_leftover?: boolean;
  source_meal_id?: number;
}

interface WeekPlan {
  [daySlot: string]: MealData | undefined;
}

interface PlannerGridProps {
  weekPlan: WeekPlan;
  onUpdatePlan: (daySlot: string, meal: MealData | undefined) => void;
  onQuickAdd: (daySlot: string) => void;
  onMealAction: (action: string, meal: MealData, daySlot: string) => void;
  enhancedMode?: boolean;
  conflictData?: {
    [daySlot: string]: {
      calendar?: boolean;
      weather?: 'rainy' | 'hot' | 'cold';
    };
  };
}

export function PlannerGrid({
  weekPlan,
  onUpdatePlan,
  onQuickAdd,
  onMealAction,
  enhancedMode = false,
  conflictData = {}
}: PlannerGridProps) {
  const [showAutoFill, setShowAutoFill] = useState(false);

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  const mealSlots = ['Breakfast', 'Lunch', 'Dinner'];

  const getDaySlotKey = (day: string, slot: string) => {
    return `${day.toLowerCase()}-${slot.toLowerCase()}`;
  };

  const handleDropRecipe = (daySlot: string, recipeId: number) => {
    // In a real app, this would fetch the recipe data and convert to MealData
    console.log('Dropping recipe', recipeId, 'to', daySlot);
    // For now, we'll create a mock meal
    const mockMeal: MealData = {
      id: recipeId,
      title: `Recipe ${recipeId}`,
      total_time_minutes: 30,
      servings: 4,
      difficulty: 'Easy'
    };
    onUpdatePlan(daySlot, mockMeal);
  };

  const handleAutoFillStrategy = (strategy: string) => {
    console.log('Auto-fill strategy:', strategy);
    setShowAutoFill(false);
    // Implementation would depend on the strategy
  };

  const getWeekProgress = () => {
    const totalSlots = daysOfWeek.length * mealSlots.length;
    const filledSlots = Object.values(weekPlan).filter(Boolean).length;
    return {
      filled: filledSlots,
      total: totalSlots,
      percentage: Math.round((filledSlots / totalSlots) * 100)
    };
  };

  const progress = getWeekProgress();

  return (
    <div className="space-y-6">
      {/* Week Progress & Auto-Fill */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              Week Progress: {progress.filled}/{progress.total} meals planned
            </span>
          </div>
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {progress.percentage}%
          </span>
        </div>

        {/* Auto-Fill Actions */}
        <div className="relative">
          <button
            onClick={() => setShowAutoFill(!showAutoFill)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Sparkles className="h-4 w-4 text-indigo-600" />
            Auto-Fill Week
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {showAutoFill && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowAutoFill(false)}
              />
              <div className="absolute right-0 top-10 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  Auto-Fill Strategies
                </div>
                <button
                  onClick={() => handleAutoFillStrategy('favorites')}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-50"
                >
                  <div className="font-medium text-sm text-gray-900">
                    Favorites-First
                  </div>
                  <div className="text-xs text-gray-500">
                    Fill with your most-loved recipes
                  </div>
                </button>
                <button
                  onClick={() => handleAutoFillStrategy('rated')}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-50"
                >
                  <div className="font-medium text-sm text-gray-900">
                    Highly Rated
                  </div>
                  <div className="text-xs text-gray-500">
                    Choose top-rated recipes
                  </div>
                </button>
                <button
                  onClick={() => handleAutoFillStrategy('quick')}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-50"
                >
                  <div className="font-medium text-sm text-gray-900">
                    Quick Week
                  </div>
                  <div className="text-xs text-gray-500">
                    Focus on 30-minute meals
                  </div>
                </button>
                <button
                  onClick={() => handleAutoFillStrategy('kidfriendly')}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-50"
                >
                  <div className="font-medium text-sm text-gray-900">
                    Kid-Friendly
                  </div>
                  <div className="text-xs text-gray-500">
                    Family-approved favorites
                  </div>
                </button>
                <button
                  onClick={() => handleAutoFillStrategy('random')}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <Shuffle className="h-4 w-4 text-indigo-600" />
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        Surprise Me
                      </div>
                      <div className="text-xs text-gray-500">
                        Random variety for adventure
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Planner Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-8 gap-0 bg-gray-50 border-b border-gray-200">
          <div className="p-4 font-medium text-gray-900 border-r border-gray-200">
            <span className="sr-only">Meal Slots</span>
          </div>
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="p-4 text-center font-medium text-gray-900 border-r border-gray-200 last:border-r-0"
            >
              <div className="text-sm">{day}</div>
              <div className="text-xs text-gray-500 mt-1">
                {/* You could add dates here */}
                Sep {13 + daysOfWeek.indexOf(day)}
              </div>
            </div>
          ))}
        </div>

        {/* Meal Rows */}
        {mealSlots.map((slot) => (
          <div
            key={slot}
            className="grid grid-cols-8 gap-0 border-b border-gray-200 last:border-b-0"
          >
            {/* Slot Label */}
            <div className="p-4 flex items-center font-medium text-gray-900 bg-gray-50 border-r border-gray-200">
              <span className="text-sm">{slot}</span>
            </div>

            {/* Day Cells */}
            {daysOfWeek.map((day) => {
              const daySlotKey = getDaySlotKey(day, slot);
              const meal = weekPlan[daySlotKey];
              const conflicts = conflictData[daySlotKey];

              return (
                <div
                  key={daySlotKey}
                  className="p-2 border-r border-gray-200 last:border-r-0"
                >
                  <PlannerCell
                    value={meal}
                    onDropRecipe={(recipeId) =>
                      handleDropRecipe(daySlotKey, recipeId)
                    }
                    onQuickAdd={() => onQuickAdd(daySlotKey)}
                    onMealAction={(action, meal) =>
                      onMealAction(action, meal, daySlotKey)
                    }
                    dayName={day}
                    slotName={slot}
                    enhancedMode={enhancedMode}
                    conflicts={conflicts}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Enhanced Mode Info */}
      {enhancedMode && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-indigo-900 mb-1">
                Enhanced Mode Active
              </h4>
              <p className="text-sm text-indigo-700">
                Showing calendar conflicts, weather recommendations, and
                nutrition insights.
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-indigo-600">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                    ⏰
                  </span>
                  Calendar conflict
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    🌧️
                  </span>
                  Weather suggestion
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    🥗
                  </span>
                  Nutrition insight
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
