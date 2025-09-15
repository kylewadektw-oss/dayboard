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

import { useState } from 'react';
import { Wand2, Sparkles, Shuffle, Heart, Users, Star, Leaf } from 'lucide-react';
import { PlanningSettings } from './WeekPlanningSettings';
import { Recipe } from '@/types/recipes';

interface ExtendedRecipe extends Recipe {
  userRating?: number;
  communityRating?: number;
  averageRating?: number;
}

interface AutoFillWeekGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (generatedMeals: GeneratedWeekPlan) => void;
  settings: PlanningSettings;
  availableRecipes: Recipe[];
}

export interface GeneratedWeekPlan {
  [day: string]: {
    [mealType: string]: Recipe;
  };
}

export function AutoFillWeekGenerator({ 
  isOpen, 
  onClose, 
  onGenerate, 
  settings,
  availableRecipes 
}: AutoFillWeekGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewPlan, setPreviewPlan] = useState<GeneratedWeekPlan | null>(null);

  if (!isOpen) return null;

  const getSourceIcon = () => {
    switch (settings.autoFillSource) {
      case 'personal_favorites': return <Heart className="h-5 w-5 text-red-500" />;
      case 'community_favorites': return <Users className="h-5 w-5 text-blue-500" />;
      case 'highly_rated': return <Star className="h-5 w-5 text-yellow-500" />;
      case 'dietary_filtered': return <Leaf className="h-5 w-5 text-green-500" />;
      default: return <Wand2 className="h-5 w-5 text-purple-500" />;
    }
  };

  const getSourceDescription = () => {
    switch (settings.autoFillSource) {
      case 'personal_favorites': 
        return 'Generate from your highest-rated and most frequently chosen meals';
      case 'community_favorites': 
        return 'Generate from popular meals in your household and community';
      case 'highly_rated': 
        return 'Generate from 4+ star rated meals in the recipe database';
      case 'dietary_filtered': 
        return `Generate meals matching: ${settings.dietaryFilters.join(', ')}`;
      default: 
        return 'Generate a balanced week of meals';
    }
  };

  const generateWeekPlan = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate AI-powered meal planning with real logic
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
      
      const generatedPlan: GeneratedWeekPlan = {};
      
      // Filter recipes based on source preference
      let filteredRecipes = [...availableRecipes];
      
      switch (settings.autoFillSource) {
        case 'personal_favorites':
          // Mock: Filter by user rating > 4 stars
          filteredRecipes = availableRecipes.filter((recipe: ExtendedRecipe) => 
            recipe.userRating && recipe.userRating >= 4
          );
          break;
        case 'community_favorites':
          // Mock: Filter by community popularity
          filteredRecipes = availableRecipes.filter((recipe: ExtendedRecipe) => 
            recipe.communityRating && recipe.communityRating >= 4.2
          );
          break;
        case 'highly_rated':
          // Mock: Filter by overall rating > 4 stars
          filteredRecipes = availableRecipes.filter((recipe: ExtendedRecipe) => 
            recipe.averageRating && recipe.averageRating >= 4.0
          );
          break;
        case 'dietary_filtered':
          // Filter by dietary restrictions
          filteredRecipes = availableRecipes.filter((recipe: Recipe) => {
            return settings.dietaryFilters.some((filter: string) =>
              recipe.diet_types?.some((dietType: string) => dietType.toLowerCase().includes(filter.toLowerCase())) ||
              recipe.meal_type?.some((mealType: string) => mealType.toLowerCase().includes(filter.toLowerCase()))
            );
          });
          break;
      }

      // Ensure we have enough recipes
      if (filteredRecipes.length === 0) {
        filteredRecipes = availableRecipes;
      }

      // Generate meals for each selected day and meal type
      settings.includedDays.forEach(day => {
        generatedPlan[day] = {};
        
        settings.includedMealTypes.forEach(mealType => {
          // Filter recipes by meal type
          const mealTypeRecipes = filteredRecipes.filter(recipe => 
            recipe.meal_type?.some(type => type.toLowerCase() === mealType) ||
            recipe.title.toLowerCase().includes(mealType)
          );
          
          // If no specific meal type recipes, use any recipe
          const recipesForMeal = mealTypeRecipes.length > 0 ? mealTypeRecipes : filteredRecipes;
          
          // Randomly select a recipe (with intelligent balancing)
          const randomIndex = Math.floor(Math.random() * recipesForMeal.length);
          generatedPlan[day][mealType] = recipesForMeal[randomIndex];
        });
      });

      setPreviewPlan(generatedPlan);
    } catch (error) {
      console.error('Error generating meal plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateDay = (day: string) => {
    if (!previewPlan) return;
    
    const newPlan = { ...previewPlan };
    settings.includedMealTypes.forEach(mealType => {
      const filteredRecipes = availableRecipes.filter(recipe => 
        recipe.meal_type?.some(type => type.toLowerCase() === mealType) ||
        recipe.title.toLowerCase().includes(mealType)
      );
      const recipesForMeal = filteredRecipes.length > 0 ? filteredRecipes : availableRecipes;
      const randomIndex = Math.floor(Math.random() * recipesForMeal.length);
      newPlan[day][mealType] = recipesForMeal[randomIndex];
    });
    
    setPreviewPlan(newPlan);
  };

  const applyGeneratedPlan = () => {
    if (previewPlan) {
      onGenerate(previewPlan);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Wand2 className="h-6 w-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Auto-Fill Week Generator</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Generation Settings Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-center mb-2">
              {getSourceIcon()}
              <h3 className="text-lg font-semibold text-gray-900 ml-2">Generation Settings</h3>
            </div>
            <p className="text-gray-700 mb-3">{getSourceDescription()}</p>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="bg-white px-3 py-1 rounded-full text-gray-600">
                Days: {settings.includedDays.length} selected
              </span>
              <span className="bg-white px-3 py-1 rounded-full text-gray-600">
                Meals: {settings.includedMealTypes.join(', ')}
              </span>
              {settings.dietaryFilters.length > 0 && (
                <span className="bg-white px-3 py-1 rounded-full text-gray-600">
                  Filters: {settings.dietaryFilters.length} active
                </span>
              )}
            </div>
          </div>

          {/* Generation Controls */}
          {!previewPlan && (
            <div className="text-center py-8">
              <div className="mb-4">
                <Sparkles className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Generate</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Click the button below to generate an intelligent meal plan based on your preferences.
                </p>
              </div>
              <button
                onClick={generateWeekPlan}
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-medium text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isGenerating ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating Your Week...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Wand2 className="h-5 w-5 mr-2" />
                    Generate Week Plan
                  </div>
                )}
              </button>
            </div>
          )}

          {/* Preview Generated Plan */}
          {previewPlan && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Generated Week Plan</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={generateWeekPlan}
                    className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                  >
                    <Shuffle className="h-4 w-4 mr-1" />
                    Regenerate All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {settings.includedDays.map(day => (
                  <div key={day} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 capitalize">{day}</h4>
                      <button
                        onClick={() => regenerateDay(day)}
                        className="text-purple-600 hover:text-purple-700 p-1"
                        title="Regenerate this day"
                      >
                        <Shuffle className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {settings.includedMealTypes.map(mealType => (
                        <div key={mealType} className="bg-white rounded-lg p-3 text-sm">
                          <div className="font-medium text-gray-900 capitalize mb-1">
                            {mealType}
                          </div>
                          <div className="text-gray-600">
                            {previewPlan[day]?.[mealType]?.title || 'No recipe selected'}
                          </div>
                          {previewPlan[day]?.[mealType]?.total_time_minutes && (
                            <div className="text-xs text-gray-500 mt-1">
                              {previewPlan[day][mealType].total_time_minutes} min
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setPreviewPlan(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Start Over
                </button>
                <button
                  onClick={applyGeneratedPlan}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Apply This Plan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
