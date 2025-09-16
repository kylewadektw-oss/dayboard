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

import { useState, useRef } from 'react';
import { GripVertical, Calendar, Clock, Star, Move } from 'lucide-react';
import { MealPlan, Recipe, RecipeMealType } from '@/types/recipes';

// Utility function for conditional classnames
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

interface MealDragDropProps {
  mealPlan: MealPlan;
  recipe: Recipe;
  dayIndex: number;
  mealIndex: number;
  onDragStart: (dragData: DragData) => void;
  onDragEnd: () => void;
  onDrop: (dragData: DragData, dropTarget: DropTarget) => void;
  isDragging: boolean;
  dragOverTarget: DropTarget | null;
  className?: string;
}

interface DragData {
  mealPlan: MealPlan;
  recipe: Recipe;
  dayIndex: number;
  mealIndex: number;
  sourceDayId: string;
  sourceMealType: RecipeMealType;
}

interface DropTarget {
  dayIndex: number;
  mealIndex: number;
  targetDayId: string;
  targetMealType: RecipeMealType;
  position: 'above' | 'below' | 'replace';
}

export function MealDragDrop({
  mealPlan,
  recipe,
  dayIndex,
  mealIndex,
  onDragStart,
  onDragEnd,
  onDrop,
  isDragging,
  dragOverTarget,
  className = ''
}: MealDragDropProps) {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  };

  const handleDragStart = (e: React.DragEvent) => {
    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }

    const dragData: DragData = {
      mealPlan,
      recipe,
      dayIndex,
      mealIndex,
      sourceDayId: mealPlan.planned_date,
      sourceMealType: mealPlan.meal_type
    };

    // Set drag data for cross-component communication
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';

    onDragStart(dragData);
  };

  const handleDragEnd = () => {
    onDragEnd();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    try {
      const dragDataStr = e.dataTransfer.getData('application/json');
      if (dragDataStr) {
        const dragData: DragData = JSON.parse(dragDataStr);

        // Determine drop position based on mouse position
        const rect = elementRef.current?.getBoundingClientRect();
        if (rect) {
          const dropY = e.clientY - rect.top;
          const position = dropY < rect.height / 2 ? 'above' : 'below';

          const dropTarget: DropTarget = {
            dayIndex,
            mealIndex,
            targetDayId: mealPlan.planned_date,
            targetMealType: mealPlan.meal_type,
            position
          };

          onDrop(dragData, dropTarget);
        }
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const isDropTarget =
    dragOverTarget &&
    dragOverTarget.dayIndex === dayIndex &&
    dragOverTarget.mealIndex === mealIndex;

  const showDropIndicator = isDropTarget && !isDragging;

  return (
    <div className="relative">
      {/* Drop Indicator Above */}
      {showDropIndicator && dragOverTarget?.position === 'above' && (
        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-10" />
      )}

      <div
        ref={elementRef}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={cn(
          'group relative bg-white border border-gray-200 rounded-lg p-3 cursor-move transition-all duration-200',
          'hover:border-blue-300 hover:shadow-md',
          isDragging &&
            'opacity-50 transform rotate-2 scale-105 shadow-lg z-20',
          isDropTarget &&
            dragOverTarget?.position === 'replace' &&
            'border-blue-500 bg-blue-50',
          className
        )}
        style={{
          transform: isDragging
            ? `translate(${dragOffset.x}px, ${dragOffset.y}px)`
            : undefined
        }}
      >
        {/* Drag Handle */}
        <div
          className={cn(
            'absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity',
            isHovering && 'opacity-100'
          )}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        {/* Meal Content */}
        <div className="flex items-start space-x-3 ml-2">
          {/* Recipe Emoji */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
              {recipe.image_emoji || '🍽️'}
            </div>
          </div>

          {/* Recipe Details */}
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
              <span>{recipe.servings} servings</span>
            </div>

            {/* Meal Status */}
            <div className="flex items-center justify-between mt-2">
              <span
                className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  mealPlan.status === 'completed' &&
                    'bg-green-100 text-green-700',
                  mealPlan.status === 'preparing' &&
                    'bg-yellow-100 text-yellow-700',
                  mealPlan.status === 'planned' && 'bg-blue-100 text-blue-700',
                  mealPlan.status === 'skipped' && 'bg-gray-100 text-gray-700'
                )}
              >
                {mealPlan.status.charAt(0).toUpperCase() +
                  mealPlan.status.slice(1)}
              </span>

              {/* Difficulty & Cuisine Tags */}
              <div className="flex items-center space-x-1">
                {recipe.difficulty && (
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded text-xs font-medium',
                      recipe.difficulty === 'easy' &&
                        'bg-green-100 text-green-600',
                      recipe.difficulty === 'medium' &&
                        'bg-yellow-100 text-yellow-600',
                      recipe.difficulty === 'hard' && 'bg-red-100 text-red-600'
                    )}
                  >
                    {recipe.difficulty}
                  </span>
                )}
                {recipe.cuisine && (
                  <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
                    {recipe.cuisine}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Move Indicator */}
        {isDragging && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
            <Move className="h-6 w-6 text-blue-600" />
          </div>
        )}

        {/* Dietary Restrictions Indicators */}
        {recipe.diet_types && recipe.diet_types.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-100">
            {recipe.diet_types.slice(0, 3).map((diet, index) => (
              <span
                key={index}
                className="px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded text-xs font-medium"
              >
                {diet.replace('_', ' ')}
              </span>
            ))}
            {recipe.diet_types.length > 3 && (
              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                +{recipe.diet_types.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Drop Indicator Below */}
      {showDropIndicator && dragOverTarget?.position === 'below' && (
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-10" />
      )}
    </div>
  );
}

// Drop Zone Component for empty meal slots
interface MealDropZoneProps {
  dayIndex: number;
  mealType: RecipeMealType;
  onDrop: (dragData: DragData, dropTarget: DropTarget) => void;
  isDragOver: boolean;
  className?: string;
}

export function MealDropZone({
  dayIndex,
  mealType,
  onDrop,
  isDragOver,
  className = ''
}: MealDropZoneProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    try {
      const dragDataStr = e.dataTransfer.getData('application/json');
      if (dragDataStr) {
        const dragData: DragData = JSON.parse(dragDataStr);

        const dropTarget: DropTarget = {
          dayIndex,
          mealIndex: 0,
          targetDayId: new Date().toISOString().split('T')[0], // Current date as placeholder
          targetMealType: mealType,
          position: 'replace'
        };

        onDrop(dragData, dropTarget);
      }
    } catch (error) {
      console.error('Error handling drop in zone:', error);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        'border-2 border-dashed border-gray-300 rounded-lg p-4 text-center transition-all duration-200',
        'hover:border-blue-400 hover:bg-blue-50',
        isDragOver && 'border-blue-500 bg-blue-100',
        className
      )}
    >
      <div className="text-gray-500">
        <Calendar className="h-6 w-6 mx-auto mb-2" />
        <p className="text-sm">Drop meal here</p>
        <p className="text-xs text-gray-400 mt-1">
          {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
        </p>
      </div>
    </div>
  );
}
