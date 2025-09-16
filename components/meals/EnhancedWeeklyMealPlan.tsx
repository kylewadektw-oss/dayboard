/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kyle.wade.ktw@gmail.com)
 * 
 * This file is part of Dayboard, a proprietary household command center application.
 * 
 * IMPORTANT N            <button
              onClick={handleOpenSettings}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                showSettings 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
              {hasUnsavedChanges && (
                <span className="ml-2 w-2 h-2 bg-orange-500 rounded-full"></span>
              )}
            </button>his code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: kyle.wade.ktw@gmail.com
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import {
  Calendar,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Clock,
  Star,
  Check,
  X
} from 'lucide-react';
// Sparkles import removed as unused
import { Recipe, MealPlan, RecipeMealType } from '@/types/recipes';

interface EnhancedWeeklyMealPlanProps {
  recipes: Recipe[];
  mealPlans: MealPlan[];
  onUpdateMealPlan: (mealPlan: Partial<MealPlan>) => Promise<void>;
  onCreateMealPlan: (
    mealPlan: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<void>;
  onDeleteMealPlan: (mealPlanId: string) => Promise<void>;
  householdId: string;
  userId: string;
  className?: string;
}

interface BasicSettings {
  showWeekends: boolean;
  selectedMealTypes: RecipeMealType[];
}

const DEFAULT_SETTINGS: BasicSettings = {
  showWeekends: false,
  selectedMealTypes: ['breakfast', 'lunch', 'dinner']
};

const MEAL_TYPE_ORDER: RecipeMealType[] = [
  'breakfast',
  'lunch',
  'dinner',
  'dessert'
];

export function EnhancedWeeklyMealPlan({
  recipes,
  mealPlans,
  // Unused props commented out to fix build errors
  // onUpdateMealPlan,
  // onCreateMealPlan,
  // onDeleteMealPlan,
  // householdId,
  // userId,
  className = ''
}: EnhancedWeeklyMealPlanProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    () => startOfWeek(new Date(), { weekStartsOn: 0 }) // Sunday
  );
  const [showSettings, setShowSettings] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [settings, setSettings] = useState<BasicSettings>(DEFAULT_SETTINGS);
  const [tempSettings, setTempSettings] =
    useState<BasicSettings>(DEFAULT_SETTINGS);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  // Unused state variables commented out to fix build errors
  // const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // const [selectedMealType, setSelectedMealType] = useState<RecipeMealType>('dinner');

  // Settings management functions - removed unused function
  // const handleOpenSettings = () => {
  //   setTempSettings(settings);
  //   setHasUnsavedChanges(false);
  //   setShowSettings(true);
  // };

  const handleSaveSettings = useCallback(() => {
    setSettings(tempSettings);
    setHasUnsavedChanges(false);
    setShowSettings(false);
  }, [tempSettings]);

  const handleCancelSettings = useCallback(() => {
    setTempSettings(settings);
    setHasUnsavedChanges(false);
    setShowSettings(false);
  }, [settings]);

  const handleTempSettingsChange = (newTempSettings: BasicSettings) => {
    setTempSettings(newTempSettings);
    setHasUnsavedChanges(
      JSON.stringify(newTempSettings) !== JSON.stringify(settings)
    );
  };

  // Keyboard shortcuts for settings panel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showSettings) return;

      if (event.key === 'Escape') {
        handleCancelSettings();
      } else if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        if (hasUnsavedChanges) {
          handleSaveSettings();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    showSettings,
    hasUnsavedChanges,
    handleCancelSettings,
    handleSaveSettings
  ]);

  // Generate week days based on current week
  const weekDays = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) =>
      addDays(currentWeekStart, i)
    );
    if (!settings.showWeekends) {
      return days.slice(1, 6); // Monday to Friday
    }
    return days;
  }, [currentWeekStart, settings.showWeekends]);

  // Filter meal plans for current week
  const weekMealPlans = useMemo(() => {
    return mealPlans.filter((plan) => {
      const planDate = new Date(plan.planned_date);
      return weekDays.some((day) => isSameDay(planDate, day));
    });
  }, [mealPlans, weekDays]);

  // Organize meal plans by day and meal type
  const organizedMealPlans = useMemo(() => {
    const organized: Record<string, Record<RecipeMealType, MealPlan[]>> = {};

    weekDays.forEach((day) => {
      const dayKey = format(day, 'yyyy-MM-dd');
      organized[dayKey] = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: [],
        dessert: [],
        appetizer: [],
        beverage: []
      };
    });

    weekMealPlans.forEach((plan) => {
      const dayKey = format(new Date(plan.planned_date), 'yyyy-MM-dd');
      if (organized[dayKey] && organized[dayKey][plan.meal_type]) {
        organized[dayKey][plan.meal_type].push(plan);
      }
    });

    return organized;
  }, [weekDays, weekMealPlans]);

  // Navigation handlers
  const handlePreviousWeek = useCallback(() => {
    setCurrentWeekStart((prev: Date) => addDays(prev, -7));
  }, []);

  const handleNextWeek = useCallback(() => {
    setCurrentWeekStart((prev: Date) => addDays(prev, 7));
  }, []);

  const handleToday = useCallback(() => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
  }, []);

  // Get recipe for meal plan
  const getRecipeForMealPlan = useCallback(
    (mealPlan: MealPlan) => {
      return recipes.find((recipe) => recipe.id === mealPlan.recipe_id);
    },
    [recipes]
  );

  // Filter meal types based on settings
  const visibleMealTypes = useMemo(() => {
    return MEAL_TYPE_ORDER.filter((mealType) =>
      settings.selectedMealTypes.includes(mealType)
    );
  }, [settings.selectedMealTypes]);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">This Week</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousWeek}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleNextWeek}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSummary(!showSummary)}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                showSummary
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Summary
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                showSettings
                  ? 'bg-gray-100 text-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </button>
          </div>
        </div>

        {/* Week Range */}
        <div className="text-sm text-gray-600">
          {format(weekDays[0], 'MMM d')} -{' '}
          {format(weekDays[weekDays.length - 1], 'MMM d, yyyy')}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Week Settings
            </h3>
            {hasUnsavedChanges && (
              <span className="text-sm text-orange-600 font-medium">
                Unsaved changes
              </span>
            )}
          </div>

          <div className="space-y-4">
            {/* Show Weekends Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Show Weekends
              </label>
              <button
                onClick={() =>
                  handleTempSettingsChange({
                    ...tempSettings,
                    showWeekends: !tempSettings.showWeekends
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  tempSettings.showWeekends ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    tempSettings.showWeekends
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Meal Types */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Meal Types
              </label>
              <div className="flex flex-wrap gap-2">
                {MEAL_TYPE_ORDER.map((mealType) => (
                  <button
                    key={mealType}
                    onClick={() => {
                      handleTempSettingsChange({
                        ...tempSettings,
                        selectedMealTypes:
                          tempSettings.selectedMealTypes.includes(mealType)
                            ? tempSettings.selectedMealTypes.filter(
                                (type) => type !== mealType
                              )
                            : [...tempSettings.selectedMealTypes, mealType]
                      });
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize ${
                      tempSettings.selectedMealTypes.includes(mealType)
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {mealType}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Press{' '}
                  <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">
                    Esc
                  </kbd>{' '}
                  to cancel or{' '}
                  <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">
                    ⌘S
                  </kbd>{' '}
                  to save
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCancelSettings}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    disabled={!hasUnsavedChanges}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      hasUnsavedChanges
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Panel */}
      {showSummary && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Week Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {weekMealPlans.length}
              </div>
              <div className="text-sm text-gray-600">Total Meals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {
                  weekMealPlans.filter((plan) => plan.status === 'completed')
                    .length
                }
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {weekMealPlans.reduce((total, plan) => {
                  const recipe = getRecipeForMealPlan(plan);
                  return total + (recipe?.total_time_minutes || 0);
                }, 0)}
                m
              </div>
              <div className="text-sm text-gray-600">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {weekMealPlans.reduce((total, plan) => {
                  const recipe = getRecipeForMealPlan(plan);
                  return total + (recipe?.rating || 0);
                }, 0) / Math.max(weekMealPlans.length, 1)}
              </div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Grid */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div
          className="grid gap-0 border-b border-gray-200"
          style={{ gridTemplateColumns: `repeat(${weekDays.length}, 1fr)` }}
        >
          {/* Day Headers */}
          {weekDays.map((day, dayIndex) => (
            <div
              key={dayIndex}
              className="p-4 bg-gray-50 border-r border-gray-200 last:border-r-0"
            >
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  {format(day, 'EEE')}
                </div>
                <div
                  className={`text-lg font-bold mt-1 ${
                    isSameDay(day, new Date())
                      ? 'text-blue-600'
                      : 'text-gray-700'
                  }`}
                >
                  {format(day, 'd')}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Meal Rows */}
        {visibleMealTypes.map((mealType) => (
          <div
            key={mealType}
            className="border-b border-gray-200 last:border-b-0"
          >
            {/* Meal Type Header */}
            <div className="p-3 bg-gray-50 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 capitalize">
                {mealType}
              </h3>
            </div>

            {/* Meal Grid */}
            <div
              className="grid gap-0 min-h-[120px]"
              style={{ gridTemplateColumns: `repeat(${weekDays.length}, 1fr)` }}
            >
              {weekDays.map((day) => {
                const dayKey = format(day, 'yyyy-MM-dd');
                const mealsForDay =
                  organizedMealPlans[dayKey]?.[mealType] || [];

                return (
                  <div
                    key={`${dayKey}-${mealType}`}
                    className="p-3 border-r border-gray-200 last:border-r-0 min-h-[120px]"
                  >
                    {mealsForDay.length > 0 ? (
                      <div className="space-y-2">
                        {mealsForDay.map((mealPlan) => {
                          const recipe = getRecipeForMealPlan(mealPlan);
                          if (!recipe) return null;

                          return (
                            <div
                              key={mealPlan.id}
                              className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                                    {recipe.image_emoji || '🍽️'}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
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
                                  </div>
                                  <div className="mt-2">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        mealPlan.status === 'completed'
                                          ? 'bg-green-100 text-green-700'
                                          : mealPlan.status === 'preparing'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : mealPlan.status === 'planned'
                                              ? 'bg-blue-100 text-blue-700'
                                              : 'bg-gray-100 text-gray-700'
                                      }`}
                                    >
                                      {mealPlan.status.charAt(0).toUpperCase() +
                                        mealPlan.status.slice(1)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center h-full flex flex-col justify-center">
                        <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">No meal planned</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Add Meal Button */}
      <div className="text-center">
        <button
          onClick={() => {
            // Simple meal addition logic would go here
            console.log('Add meal clicked');
          }}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Calendar className="h-5 w-5 mr-2" />
          Add Meal to Week
        </button>
      </div>
    </div>
  );
}
