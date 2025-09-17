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

import { useState } from 'react';
import { Settings, Calendar, Utensils, Wand2 } from 'lucide-react';

interface WeekPlanningSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: PlanningSettings) => void;
  currentSettings: PlanningSettings;
}

export interface PlanningSettings {
  includedDays: string[];
  includedMealTypes: string[];
  autoFillSource:
    | 'personal_favorites'
    | 'community_favorites'
    | 'highly_rated'
    | 'dietary_filtered';
  dietaryFilters: string[];
}

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Monday', short: 'Mon' },
  { id: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { id: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { id: 'thursday', label: 'Thursday', short: 'Thu' },
  { id: 'friday', label: 'Friday', short: 'Fri' },
  { id: 'saturday', label: 'Saturday', short: 'Sat' },
  { id: 'sunday', label: 'Sunday', short: 'Sun' }
];

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', emoji: '🌅', color: 'orange' },
  { id: 'lunch', label: 'Lunch', emoji: '☀️', color: 'yellow' },
  { id: 'dinner', label: 'Dinner', emoji: '🌙', color: 'purple' },
  { id: 'dessert', label: 'Dessert', emoji: '🍰', color: 'pink' }
];

const AUTO_FILL_OPTIONS = [
  {
    id: 'personal_favorites',
    label: 'Personal Favorites',
    description: 'Your highest-rated meals',
    icon: '❤️'
  },
  {
    id: 'community_favorites',
    label: 'Community Favorites',
    description: 'Popular meals in your area',
    icon: '👥'
  },
  {
    id: 'highly_rated',
    label: 'Highly Rated',
    description: '4+ star meals from recipe database',
    icon: '⭐'
  },
  {
    id: 'dietary_filtered',
    label: 'Dietary Filtered',
    description: 'Based on your dietary preferences',
    icon: '🥗'
  }
];

const DIETARY_FILTERS = [
  'Vegetarian',
  'Vegan',
  'Keto',
  'Paleo',
  'Gluten-Free',
  'Family-Friendly',
  'Quick & Easy',
  'Low-Carb',
  'High-Protein'
];

export function WeekPlanningSettings({
  isOpen,
  onClose,
  onSettingsChange,
  currentSettings
}: WeekPlanningSettingsProps) {
  const [settings, setSettings] = useState<PlanningSettings>(currentSettings);

  if (!isOpen) return null;

  const updateSettings = (newSettings: Partial<PlanningSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    onSettingsChange(updated);
  };

  const toggleDay = (dayId: string) => {
    const newDays = settings.includedDays.includes(dayId)
      ? settings.includedDays.filter((d) => d !== dayId)
      : [...settings.includedDays, dayId];
    updateSettings({ includedDays: newDays });
  };

  const toggleMealType = (mealType: string) => {
    const newMealTypes = settings.includedMealTypes.includes(mealType)
      ? settings.includedMealTypes.filter((m) => m !== mealType)
      : [...settings.includedMealTypes, mealType];
    updateSettings({ includedMealTypes: newMealTypes });
  };

  const toggleDietaryFilter = (filter: string) => {
    const newFilters = settings.dietaryFilters.includes(filter)
      ? settings.dietaryFilters.filter((f) => f !== filter)
      : [...settings.dietaryFilters, filter];
    updateSettings({ dietaryFilters: newFilters });
  };

  const setQuickPreset = (preset: 'weekdays' | 'weekends' | 'full_week') => {
    const presets = {
      weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      weekends: ['saturday', 'sunday'],
      full_week: [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday'
      ]
    };
    updateSettings({ includedDays: presets[preset] });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">
                Week Planning Settings
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Days Selection */}
          <div>
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Days to Include
              </h3>
            </div>

            {/* Quick Presets */}
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setQuickPreset('weekdays')}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
              >
                Weekdays Only
              </button>
              <button
                onClick={() => setQuickPreset('weekends')}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
              >
                Weekends Only
              </button>
              <button
                onClick={() => setQuickPreset('full_week')}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-colors"
              >
                Full Week
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.id}
                  onClick={() => toggleDay(day.id)}
                  className={`p-3 rounded-lg text-center transition-all ${
                    settings.includedDays.includes(day.id)
                      ? 'bg-orange-100 border-2 border-orange-300 text-orange-800'
                      : 'bg-gray-50 border-2 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium text-sm">{day.short}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Meal Types Selection */}
          <div>
            <div className="flex items-center mb-4">
              <Utensils className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Meal Types
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {MEAL_TYPES.map((mealType) => (
                <button
                  key={mealType.id}
                  onClick={() => toggleMealType(mealType.id)}
                  className={`p-4 rounded-lg text-center transition-all border-2 ${
                    settings.includedMealTypes.includes(mealType.id)
                      ? `bg-${mealType.color}-100 border-${mealType.color}-300 text-${mealType.color}-800`
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-2xl mb-1">{mealType.emoji}</div>
                  <div className="font-medium text-sm">{mealType.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Auto-Fill Source */}
          <div>
            <div className="flex items-center mb-4">
              <Wand2 className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Auto-Fill Source
              </h3>
            </div>
            <div className="space-y-3">
              {AUTO_FILL_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() =>
                    updateSettings({
                      autoFillSource: option.id as
                        | 'personal_favorites'
                        | 'community_favorites'
                        | 'highly_rated'
                        | 'dietary_filtered'
                    })
                  }
                  className={`w-full p-4 rounded-lg text-left transition-all border-2 ${
                    settings.autoFillSource === option.id
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{option.icon}</span>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm opacity-75">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Filters */}
          {settings.autoFillSource === 'dietary_filtered' && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Dietary Preferences
              </h4>
              <div className="flex flex-wrap gap-2">
                {DIETARY_FILTERS.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => toggleDietaryFilter(filter)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      settings.dietaryFilters.includes(filter)
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
            >
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
