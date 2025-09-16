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
  Heart,
  Calendar,
  BookOpen,
  Zap,
  FlaskConical,
  ShoppingCart,
  Martini,
  Settings
} from 'lucide-react';
import { MealFavorites } from './MealFavorites';
import { WeeklyMealPlan } from './WeeklyMealPlan';
import EnhancedMealPlanWrapper from './EnhancedMealPlanWrapper';
import { RecipeLibrary } from './RecipeLibrary';
import { Cocktails } from './Cocktails';
import { GroceryBuilder } from './GroceryBuilder';

const tabs = [
  { id: 'favorites', name: 'Favorites', icon: Heart, color: 'text-pink-600' },
  { id: 'plan', name: 'This Week', icon: Calendar, color: 'text-blue-600' },
  {
    id: 'library',
    name: 'Recipe Library',
    icon: BookOpen,
    color: 'text-purple-600'
  },
  {
    id: 'cocktails',
    name: 'Cocktails',
    icon: Martini,
    color: 'text-indigo-600'
  },
  { id: 'quick', name: 'Quick Meals', icon: Zap, color: 'text-orange-600' },
  { id: 'try', name: 'To-Try', icon: FlaskConical, color: 'text-green-600' },
  {
    id: 'grocery',
    name: 'Grocery Builder',
    icon: ShoppingCart,
    color: 'text-red-600'
  }
];

export function MealTabs() {
  const [activeTab, setActiveTab] = useState('plan');
  const [useEnhancedMode, setUseEnhancedMode] = useState(true); // Default to enhanced mode

  return (
    <div className="bg-white rounded-2xl shadow-lg">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? `${tab.color} border-current`
                      : 'text-gray-500 hover:text-gray-700 border-transparent'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Enhanced Mode Toggle - only show on plan tab */}
          {activeTab === 'plan' && (
            <div className="flex items-center px-4 py-3">
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={useEnhancedMode}
                  onChange={(e) => setUseEnhancedMode(e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Settings className="h-4 w-4 mr-1" />
                Enhanced Mode
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'favorites' && <MealFavorites />}
        {activeTab === 'plan' &&
          (useEnhancedMode ? <EnhancedMealPlanWrapper /> : <WeeklyMealPlan />)}
        {activeTab === 'library' && <RecipeLibrary />}
        {activeTab === 'cocktails' && <Cocktails />}
        {activeTab === 'quick' && <div>Quick Meals - Coming Soon</div>}
        {activeTab === 'try' && <div>To-Try List - Coming Soon</div>}
        {activeTab === 'grocery' && <GroceryBuilder />}
      </div>
    </div>
  );
}
