/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 *
 * Copyright (c) 2025 BentLo Labs LLC (developer@bentlolabs.com)
 *
 * This file is part of Dayboard, a proprietary household command center application.
 *
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 *
 * For licensing inquiries: developer@bentlolabs.com
 *
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

'use client';

import { useRef, useState } from 'react';
import { Clock, Users, MoreVertical, Calendar } from 'lucide-react';
import Image from 'next/image';

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

interface PlannerCellProps {
  value?: MealData;
  onDropRecipe: (recipeId: number) => void;
  onQuickAdd: () => void;
  onMealAction?: (action: string, meal: MealData) => void;
  dayName?: string;
  slotName?: string;
  enhancedMode?: boolean;
  conflicts?: {
    calendar?: boolean;
    weather?: 'rainy' | 'hot' | 'cold';
  };
}

export function PlannerCell({
  value,
  onDropRecipe,
  onQuickAdd,
  onMealAction,
  dayName,
  slotName,
  enhancedMode = false,
  conflicts = {}
}: PlannerCellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const recipeId = Number(e.dataTransfer.getData('recipeId'));
    if (recipeId) onDropRecipe(recipeId);
  };

  const handleMealAction = (action: string) => {
    if (value && onMealAction) {
      onMealAction(action, value);
    }
    setShowActions(false);
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'rainy':
        return '🌧️';
      case 'hot':
        return '☀️';
      case 'cold':
        return '❄️';
      default:
        return '';
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-700';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'Hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div
      ref={ref}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative h-32 rounded-xl border-2 border-dashed transition-all ${
        isDragOver
          ? 'border-indigo-400 bg-indigo-50 scale-105'
          : value
            ? 'border-gray-200 bg-white hover:shadow-md'
            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
      }`}
    >
      {value ? (
        /* Occupied Cell */
        <div className="h-full p-3 flex flex-col">
          {/* Enhanced Mode Indicators */}
          {enhancedMode && (conflicts.calendar || conflicts.weather) && (
            <div className="flex items-center gap-1 mb-2">
              {conflicts.calendar && (
                <span className="w-4 h-4 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs">
                  ⏰
                </span>
              )}
              {conflicts.weather && (
                <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">
                  {getWeatherIcon(conflicts.weather)}
                </span>
              )}
            </div>
          )}

          {/* Meal Content */}
          <div className="flex items-start gap-3 flex-1">
            {/* Meal Image */}
            {value.image_url ? (
              <Image
                src={value.image_url}
                alt={value.title}
                width={48}
                height={48}
                className="w-12 h-12 rounded-md object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🍽️</span>
              </div>
            )}

            {/* Meal Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm leading-tight truncate">
                {value.title}
                {value.is_leftover && (
                  <span className="ml-2 text-xs text-orange-600">♻️</span>
                )}
              </h4>

              {/* Meal Metadata */}
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                {value.total_time_minutes && (
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {value.total_time_minutes}m
                  </span>
                )}
                {value.servings && (
                  <span className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {value.servings}
                  </span>
                )}
              </div>

              {/* Quick Meal & Difficulty Badges */}
              <div className="flex items-center gap-1 mt-1">
                {value.quick_meal && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                    Quick
                  </span>
                )}
                {value.difficulty && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${getDifficultyColor(value.difficulty)}`}
                  >
                    {value.difficulty}
                  </span>
                )}
              </div>
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {showActions && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowActions(false)}
                  />
                  <div className="absolute right-0 top-6 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button
                      onClick={() => handleMealAction('details')}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm text-gray-700"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleMealAction('replace')}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm text-gray-700"
                    >
                      Replace Meal
                    </button>
                    <button
                      onClick={() => handleMealAction('rate')}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm text-gray-700"
                    >
                      Rate Recipe
                    </button>
                    <button
                      onClick={() => handleMealAction('ingredients')}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm text-gray-700"
                    >
                      Add to Grocery List
                    </button>
                    <button
                      onClick={() => handleMealAction('leftovers')}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm text-green-700"
                    >
                      Make Leftovers
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => handleMealAction('remove')}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Empty Cell */
        <button
          onClick={onQuickAdd}
          className="w-full h-full flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 transition-colors group"
        >
          <Calendar className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Add meal</span>
          {dayName && slotName && (
            <span className="text-xs text-gray-400 mt-1">
              {dayName} {slotName}
            </span>
          )}
        </button>
      )}

      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-indigo-100 bg-opacity-75 rounded-xl flex items-center justify-center">
          <div className="text-indigo-700 font-medium text-sm">
            Drop recipe here
          </div>
        </div>
      )}
    </div>
  );
}
