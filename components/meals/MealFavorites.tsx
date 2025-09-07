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

/*
 * 📋 MEAL FAVORITES TYPES - Type Definitions
 * 
 * PURPOSE: TypeScript type definitions for meal favorites data structures
 * 
 * TYPES:
 * - [List main type definitions]
 * - [Interface declarations]
 * - [Enum definitions]
 * - [Utility types and generics]
 * 
 * USAGE:
 * ```typescript
 * import type { TypeName } from '@/types/MealFavorites';
 * 
 * const example: TypeName = {
 *   // properties
 * };
 * ```
 * 
 * FEATURES:
 * - [Type safety guarantees]
 * - [Validation patterns]
 * - [Extensibility and composition]
 * - [Integration with other types]
 * 
 * TECHNICAL:
 * - [Type system design]
 * - [Runtime validation]
 * - [Performance implications]
 * - [Compatibility considerations]
 */


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

/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kylewadektw-oss)
 * 
 * This file is part of Dayboard, a proprietary household command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: [your-email@domain.com]
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

import { Heart, Clock, Users, Star } from 'lucide-react';

interface Recipe {
  id: string;
  title: string;
  image: string;
  cookTime: number;
  servings: number;
  rating: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

// Mock favorite recipes
const favoriteRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Honey Garlic Chicken',
    image: '🍗',
    cookTime: 25,
    servings: 4,
    rating: 4.8,
    difficulty: 'easy',
    tags: ['Dinner', 'Chicken', 'Easy']
  },
  {
    id: '2',
    title: 'Vegetable Stir Fry',
    image: '🥕',
    cookTime: 15,
    servings: 3,
    rating: 4.5,
    difficulty: 'easy',
    tags: ['Quick', 'Vegetarian', 'Healthy']
  },
  {
    id: '3',
    title: 'Spaghetti Carbonara',
    image: '🍝',
    cookTime: 20,
    servings: 4,
    rating: 4.7,
    difficulty: 'medium',
    tags: ['Italian', 'Pasta', 'Dinner']
  },
  {
    id: '4',
    title: 'Overnight Oats',
    image: '🥣',
    cookTime: 5,
    servings: 2,
    rating: 4.6,
    difficulty: 'easy',
    tags: ['Breakfast', 'Healthy', 'Make-ahead']
  }
];

const getDifficultyColor = (difficulty: Recipe['difficulty']) => {
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

export function MealFavorites() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Your Favorite Recipes</h3>
        <button className="text-sm text-pink-600 hover:text-pink-700 font-medium">
          View All ({favoriteRecipes.length + 8})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {favoriteRecipes.map((recipe) => (
          <div key={recipe.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="text-3xl">{recipe.image}</div>
              <div className="flex items-center">
                <Heart className="h-4 w-4 text-pink-500 fill-current" />
              </div>
            </div>

            <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {recipe.title}
            </h4>

            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {recipe.cookTime} min
                </div>
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {recipe.servings} servings
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm text-gray-600">{recipe.rating}</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                  {recipe.difficulty}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {recipe.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            <button className="w-full bg-pink-50 hover:bg-pink-100 text-pink-700 py-2 rounded-lg text-sm font-medium transition-colors">
              Add to This Week
            </button>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 p-4 bg-pink-50 border border-pink-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-pink-900">Need inspiration?</h4>
            <p className="text-sm text-pink-700">Browse our recipe collection or import from your favorite cooking sites.</p>
          </div>
          <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Browse Recipes
          </button>
        </div>
      </div>
    </div>
  );
}
