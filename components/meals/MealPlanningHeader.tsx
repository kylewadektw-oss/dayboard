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

import { useState } from 'react';
import {
  Calendar,
  Heart,
  Clock,
  Plus,
  MoreVertical,
  RefreshCw,
  Copy,
  Trash2,
  Download,
  Settings,
  Sparkles
} from 'lucide-react';

interface MealPlanningHeaderProps {
  onTabChange?: (tab: string) => void;
  enhancedMode?: boolean;
  onEnhancedModeToggle?: (enabled: boolean) => void;
}

// Mock data for KPI cards
const MOCK_KPI_DATA = {
  thisWeek: {
    plannedMeals: 12,
    totalCookTime: 240, // minutes
    estimatedCost: 87.5,
    completedMeals: 8
  },
  favorites: {
    totalFavorites: 24,
    avgRating: 4.3,
    recentAdditions: 3,
    mostUsedThisMonth: 'Chicken Tikka Masala'
  },
  quickMeals: {
    totalQuickMeals: 18,
    avgPrepTime: 15, // minutes
    usageFrequency: 3.2, // per week
    fastestMeal: 'Avocado Toast'
  }
};

export function MealPlanningHeader({
  onTabChange,
  enhancedMode = false,
  onEnhancedModeToggle
}: MealPlanningHeaderProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleKpiClick = (type: 'week' | 'favorites' | 'quick') => {
    switch (type) {
      case 'week':
        onTabChange?.('this-week');
        // TODO: Scroll to current week and open summary drawer
        break;
      case 'favorites':
        onTabChange?.('library');
        // TODO: Apply is_favorite=true filter
        break;
      case 'quick':
        onTabChange?.('quick-meals');
        // TODO: Apply quick meal filters
        break;
    }
  };

  const handleDropdownAction = (action: string) => {
    setActiveDropdown(null);

    switch (action) {
      case 'auto-fill':
        // TODO: Open auto-fill strategy selector
        console.log('Auto-fill week');
        break;
      case 'copy-last':
        // TODO: Copy last week's meal plan
        console.log('Copy last week');
        break;
      case 'clear-week':
        // TODO: Clear current week
        console.log('Clear week');
        break;
      case 'export-csv':
        // TODO: Export grocery list as CSV
        console.log('Export CSV');
        break;
      case 'export-instacart':
        // TODO: Export as Instacart JSON
        console.log('Export Instacart');
        break;
      case 'export-clipboard':
        // TODO: Copy to clipboard
        console.log('Copy to clipboard');
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Enhanced Mode Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            🍽️ Family Meals
          </h1>
          <p className="text-gray-600 mt-1">
            Plan, organize, and enjoy delicious meals together
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center hover:from-emerald-700 hover:to-green-700 transition-all shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Recipe
          </button>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Enhanced Mode</label>
            <button
              onClick={() => onEnhancedModeToggle?.(!enhancedMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enhancedMode ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enhancedMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            {enhancedMode && <Sparkles className="h-4 w-4 text-purple-600" />}
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* This Week Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 hover:shadow-md transition-all cursor-pointer relative group">
          <div
            onClick={() => handleKpiClick('week')}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">This Week</h3>
                <p className="text-sm text-amber-700">Sep 9 - Sep 15, 2025</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-600">
                {MOCK_KPI_DATA.thisWeek.plannedMeals}
              </div>
              <div className="text-sm text-amber-700">meals planned</div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-amber-700">
            <span>{MOCK_KPI_DATA.thisWeek.totalCookTime}min cook time</span>
            <span>${MOCK_KPI_DATA.thisWeek.estimatedCost}</span>
          </div>

          {/* Kebab Menu */}
          <div className="absolute top-4 right-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === 'week' ? null : 'week');
              }}
              className="p-1 text-amber-600 hover:bg-amber-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {activeDropdown === 'week' && (
              <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                <button
                  onClick={() => handleDropdownAction('auto-fill')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm"
                >
                  <RefreshCw className="h-4 w-4 mr-3" />
                  Auto-Fill Week
                </button>
                <button
                  onClick={() => handleDropdownAction('copy-last')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm"
                >
                  <Copy className="h-4 w-4 mr-3" />
                  Copy Last Week
                </button>
                <button
                  onClick={() => handleDropdownAction('clear-week')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  Clear Week
                </button>
                <hr className="my-2" />
                <div className="px-4 py-1 text-xs text-gray-500 font-medium">
                  Export Grocery List
                </div>
                <button
                  onClick={() => handleDropdownAction('export-csv')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm"
                >
                  <Download className="h-4 w-4 mr-3" />
                  CSV
                </button>
                <button
                  onClick={() => handleDropdownAction('export-instacart')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm"
                >
                  <Download className="h-4 w-4 mr-3" />
                  Instacart JSON
                </button>
                <button
                  onClick={() => handleDropdownAction('export-clipboard')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm"
                >
                  <Copy className="h-4 w-4 mr-3" />
                  Copy Text
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Favorites Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 hover:shadow-md transition-all cursor-pointer relative group">
          <div
            onClick={() => handleKpiClick('favorites')}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Favorites</h3>
                <p className="text-sm text-green-700">
                  ★ {MOCK_KPI_DATA.favorites.avgRating} avg rating
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {MOCK_KPI_DATA.favorites.totalFavorites}
              </div>
              <div className="text-sm text-green-700">saved recipes</div>
            </div>
          </div>

          <div className="mt-4 text-sm text-green-700">
            <span>
              +{MOCK_KPI_DATA.favorites.recentAdditions} added this week
            </span>
          </div>

          {/* Kebab Menu */}
          <div className="absolute top-4 right-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(
                  activeDropdown === 'favorites' ? null : 'favorites'
                );
              }}
              className="p-1 text-green-600 hover:bg-green-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {activeDropdown === 'favorites' && (
              <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm">
                  <Heart className="h-4 w-4 mr-3" />
                  View All Favorites
                </button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm">
                  <Plus className="h-4 w-4 mr-3" />
                  Add New Favorite
                </button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm">
                  <Settings className="h-4 w-4 mr-3" />
                  Manage Favorites
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Meals Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6 hover:shadow-md transition-all cursor-pointer relative group">
          <div
            onClick={() => handleKpiClick('quick')}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Clock className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-indigo-900">Quick Meals</h3>
                <p className="text-sm text-indigo-700">≤ 20 minutes</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">
                {MOCK_KPI_DATA.quickMeals.totalQuickMeals}
              </div>
              <div className="text-sm text-indigo-700">recipes ready</div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-indigo-700">
            <span>{MOCK_KPI_DATA.quickMeals.avgPrepTime}min average</span>
            <span>{MOCK_KPI_DATA.quickMeals.usageFrequency}x/week</span>
          </div>

          {/* Kebab Menu */}
          <div className="absolute top-4 right-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === 'quick' ? null : 'quick');
              }}
              className="p-1 text-indigo-600 hover:bg-indigo-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {activeDropdown === 'quick' && (
              <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-3" />
                  View All Quick Meals
                </button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm">
                  <Plus className="h-4 w-4 mr-3" />
                  Add Quick Recipe
                </button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm">
                  <Settings className="h-4 w-4 mr-3" />
                  Set Time Limit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Mode Indicators */}
      {enhancedMode && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-purple-900">
                  Enhanced Mode Active
                </h4>
                <p className="text-sm text-purple-700">
                  Smart suggestions, calendar conflicts, and nutrition insights
                  enabled
                </p>
              </div>
            </div>
            <div className="text-sm text-purple-600 space-y-1">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Smart suggestions</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Calendar integration</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span>Nutrition tracking</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click Outside Handler */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
}
