'use client';

import { useState } from 'react';
import { Heart, Calendar, BookOpen, Zap, FlaskConical, ShoppingCart } from 'lucide-react';
import { MealFavorites } from './MealFavorites';
import { WeeklyMealPlan } from './WeeklyMealPlan';
import { RecipeLibrary } from './RecipeLibrary';

const tabs = [
  { id: 'favorites', name: 'Favorites', icon: Heart, color: 'text-pink-600' },
  { id: 'plan', name: 'This Week', icon: Calendar, color: 'text-blue-600' },
  { id: 'library', name: 'Recipe Library', icon: BookOpen, color: 'text-purple-600' },
  { id: 'quick', name: 'Quick Meals', icon: Zap, color: 'text-orange-600' },
  { id: 'try', name: 'To-Try', icon: FlaskConical, color: 'text-green-600' },
  { id: 'grocery', name: 'Grocery Builder', icon: ShoppingCart, color: 'text-red-600' },
];

export function MealTabs() {
  const [activeTab, setActiveTab] = useState('plan');

  return (
    <div className="bg-white rounded-2xl shadow-lg">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
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
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'favorites' && <MealFavorites />}
        {activeTab === 'plan' && <WeeklyMealPlan />}
        {activeTab === 'library' && <RecipeLibrary />}
        {activeTab === 'quick' && <div>Quick Meals - Coming Soon</div>}
        {activeTab === 'try' && <div>To-Try List - Coming Soon</div>}
        {activeTab === 'grocery' && <div>Grocery Builder - Coming Soon</div>}
      </div>
    </div>
  );
}
