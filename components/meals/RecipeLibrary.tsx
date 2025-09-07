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
 * 📋 RECIPE LIBRARY TYPES - Type Definitions
 * 
 * PURPOSE: TypeScript type definitions for recipe library data structures
 * 
 * TYPES:
 * - [List main type definitions]
 * - [Interface declarations]
 * - [Enum definitions]
 * - [Utility types and generics]
 * 
 * USAGE:
 * ```typescript
 * import type { TypeName } from '@/types/RecipeLibrary';
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

import { Search, Filter, Clock, Users, Star } from 'lucide-react';

interface Recipe {
  id: string;
  title: string;
  image: string;
  cookTime: number;
  servings: number;
  rating: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  tags: string[];
  description: string;
}

// Mock recipe library
const recipeLibrary: Recipe[] = [
  {
    id: '1',
    title: 'Classic Beef Tacos',
    image: '🌮',
    cookTime: 30,
    servings: 4,
    rating: 4.6,
    difficulty: 'easy',
    cuisine: 'Mexican',
    tags: ['Ground Beef', 'Quick', 'Family-friendly'],
    description: 'Delicious and authentic beef tacos with fresh toppings'
  },
  {
    id: '2',
    title: 'Chicken Caesar Salad',
    image: '🥗',
    cookTime: 20,
    servings: 2,
    rating: 4.4,
    difficulty: 'easy',
    cuisine: 'American',
    tags: ['Chicken', 'Salad', 'Healthy'],
    description: 'Crispy romaine with grilled chicken and homemade dressing'
  },
  {
    id: '3',
    title: 'Beef Stroganoff',
    image: '🍲',
    cookTime: 45,
    servings: 6,
    rating: 4.8,
    difficulty: 'medium',
    cuisine: 'Russian',
    tags: ['Beef', 'Comfort Food', 'One-pot'],
    description: 'Rich and creamy beef stroganoff with egg noodles'
  },
  {
    id: '4',
    title: 'Mediterranean Quinoa Bowl',
    image: '🍜',
    cookTime: 25,
    servings: 3,
    rating: 4.5,
    difficulty: 'easy',
    cuisine: 'Mediterranean',
    tags: ['Vegetarian', 'Healthy', 'Quinoa'],
    description: 'Fresh and nutritious quinoa bowl with Mediterranean flavors'
  },
  {
    id: '5',
    title: 'BBQ Pulled Pork',
    image: '🥪',
    cookTime: 240,
    servings: 8,
    rating: 4.9,
    difficulty: 'hard',
    cuisine: 'American',
    tags: ['Pork', 'BBQ', 'Slow-cooked'],
    description: 'Tender, flavorful pulled pork perfect for sandwiches'
  },
  {
    id: '6',
    title: 'Vegetable Pad Thai',
    image: '🍜',
    cookTime: 20,
    servings: 4,
    rating: 4.3,
    difficulty: 'medium',
    cuisine: 'Thai',
    tags: ['Vegetarian', 'Asian', 'Noodles'],
    description: 'Authentic pad thai with fresh vegetables and tangy sauce'
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

export function RecipeLibrary() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes, ingredients, or cuisine..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters */}
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </button>
      </div>

      {/* Filter Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['All', 'Quick (<20min)', 'Vegetarian', 'Chicken', 'Beef', 'Italian', 'Mexican', 'Asian'].map((filter) => (
          <button
            key={filter}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'All'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipeLibrary.map((recipe) => (
          <div key={recipe.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="text-4xl">{recipe.image}</div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                {recipe.difficulty}
              </div>
            </div>

            <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {recipe.title}
            </h4>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {recipe.description}
            </p>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {recipe.cookTime} min
              </div>
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {recipe.servings} servings
              </div>
              <div className="flex items-center">
                <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                {recipe.rating}
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 font-medium">{recipe.cuisine}</span>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {recipe.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 py-2 rounded-lg text-sm font-medium transition-colors">
                View Recipe
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                ❤️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium">
          Load More Recipes
        </button>
      </div>

      {/* API Integration Notice */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-1">🚀 Coming Soon: Live Recipe API</h4>
        <p className="text-sm text-yellow-700">
          We're integrating with TheMealDB for thousands of free recipes, plus Spoonacular for nutrition info and advanced meal planning.
        </p>
      </div>
    </div>
  );
}
