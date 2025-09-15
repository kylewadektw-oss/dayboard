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
import { X, Calendar, Clock } from 'lucide-react';
import { RecipeWithDetails, MEAL_TYPES } from '@/types/recipes';

interface AddToMealPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: RecipeWithDetails;
  onSuccess?: () => void;
}

export function AddToMealPlanModal({ isOpen, onClose, recipe, onSuccess }: AddToMealPlanModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('dinner');
  const [loading, setLoading] = useState(false);

  // Generate next 14 days for selection
  const getDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        isToday: i === 0
      });
    }
    
    return dates;
  };

  const handleAddToMealPlan = async () => {
    if (!selectedDate || !selectedMealType) return;

    setLoading(true);
    try {
      // For now, just simulate adding to meal plan
      // Once the recipe tables are deployed, this will use real Supabase calls
      console.log(`Adding ${recipe.title} to ${selectedMealType} on ${selectedDate}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`Successfully added "${recipe.title}" to ${selectedMealType} on ${selectedDate}!`);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error in handleAddToMealPlan:', error);
      alert('Failed to add recipe to meal plan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const dateOptions = getDateOptions();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Add to Meal Plan
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Recipe Preview */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <span className="text-2xl mr-3">{recipe.image_emoji || '🍽️'}</span>
              <div>
                <h4 className="font-medium text-gray-900">{recipe.title}</h4>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-3 w-3 mr-1" />
                  {recipe.total_time_minutes} min • {recipe.servings} servings
                </div>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Select Date
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a date...</option>
              {dateOptions.map((date) => (
                <option key={date.value} value={date.value}>
                  {date.label} {date.isToday && '(Today)'}
                </option>
              ))}
            </select>
          </div>

          {/* Meal Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meal Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MEAL_TYPES.map((mealType) => (
                <button
                  key={mealType.value}
                  onClick={() => setSelectedMealType(mealType.value as 'breakfast' | 'lunch' | 'dinner')}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    selectedMealType === mealType.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-lg mb-1">{mealType.emoji}</div>
                  <div>{mealType.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddToMealPlan}
              disabled={!selectedDate || !selectedMealType || loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium"
            >
              {loading ? 'Adding...' : 'Add to Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
