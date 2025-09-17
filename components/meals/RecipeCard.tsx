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

'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Clock,
  Users,
  Star,
  Heart,
  Plus,
  MoreVertical,
  ChefHat
} from 'lucide-react';

interface RecipeData {
  id: number;
  title: string;
  image_url?: string;
  total_time_minutes?: number;
  servings?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  rating?: number;
  cuisine_type?: string;
  is_favorite?: boolean;
  quick_meal?: boolean;
  dietary_tags?: string[];
  description?: string;
  source?: string;
}

interface RecipeCardProps {
  recipe: RecipeData;
  onAddToWeek?: (recipeId: number) => void;
  onToggleFavorite?: (recipeId: number) => void;
  onViewDetails?: (recipeId: number) => void;
  onAction?: (action: string, recipeId: number) => void;
  draggable?: boolean;
  compact?: boolean;
}

export function RecipeCard({
  recipe,
  onAddToWeek,
  onToggleFavorite,
  onViewDetails,
  onAction,
  draggable = true,
  compact = false
}: RecipeCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('recipeId', recipe.id.toString());
    e.dataTransfer.effectAllowed = 'copy';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleAddToWeek = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToWeek) onAddToWeek(recipe.id);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(recipe.id);
  };

  const handleViewDetails = () => {
    if (onViewDetails) onViewDetails(recipe.id);
  };

  const handleAction = (action: string) => {
    if (onAction) onAction(action, recipe.id);
    setShowActions(false);
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-xs text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (compact) {
    return (
      <div
        draggable={draggable}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleViewDetails}
        className={`group relative bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all cursor-pointer ${
          isDragging ? 'opacity-50 scale-95' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Recipe Image */}
          {recipe.image_url ? (
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              width={48}
              height={48}
              className="w-12 h-12 rounded-md object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
              <ChefHat className="h-6 w-6 text-gray-400" />
            </div>
          )}

          {/* Recipe Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 text-sm leading-tight truncate">
              {recipe.title}
            </h4>

            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              {recipe.total_time_minutes && (
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {recipe.total_time_minutes}m
                </span>
              )}
              {recipe.servings && (
                <span className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {recipe.servings}
                </span>
              )}
              {recipe.rating && renderStars(recipe.rating)}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleToggleFavorite}
              className={`p-1.5 rounded-md transition-colors ${
                recipe.is_favorite
                  ? 'text-red-500 bg-red-50 hover:bg-red-100'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Heart
                className={`h-4 w-4 ${recipe.is_favorite ? 'fill-current' : ''}`}
              />
            </button>
            <button
              onClick={handleAddToWeek}
              className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      {/* Recipe Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat className="h-16 w-16 text-gray-400" />
          </div>
        )}

        {/* Overlay Actions */}
        <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              recipe.is_favorite
                ? 'text-white bg-red-500/80 hover:bg-red-600/80'
                : 'text-white bg-black/20 hover:bg-red-500/80'
            }`}
          >
            <Heart
              className={`h-4 w-4 ${recipe.is_favorite ? 'fill-current' : ''}`}
            />
          </button>
          <button
            onClick={handleAddToWeek}
            className="p-2 text-white bg-indigo-500/80 hover:bg-indigo-600/80 rounded-full backdrop-blur-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Recipe Tags */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          {recipe.quick_meal && (
            <span className="px-2 py-1 bg-indigo-600/90 text-white text-xs rounded-full backdrop-blur-sm">
              Quick
            </span>
          )}
          {recipe.difficulty && (
            <span
              className={`px-2 py-1 text-xs rounded-full backdrop-blur-sm ${
                recipe.difficulty === 'Easy'
                  ? 'bg-green-600/90 text-white'
                  : recipe.difficulty === 'Medium'
                    ? 'bg-yellow-600/90 text-white'
                    : 'bg-red-600/90 text-white'
              }`}
            >
              {recipe.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Recipe Details */}
      <div className="p-4" onClick={handleViewDetails}>
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight pr-2">
            {recipe.title}
          </h3>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showActions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />
                <div className="absolute right-0 top-6 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={() => handleAction('view')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700"
                  >
                    View Full Recipe
                  </button>
                  <button
                    onClick={() => handleAction('addToWeek')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700"
                  >
                    Add to This Week
                  </button>
                  <button
                    onClick={() => handleAction('addToGrocery')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700"
                  >
                    Add Ingredients to Grocery List
                  </button>
                  <button
                    onClick={() => handleAction('rate')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700"
                  >
                    Rate Recipe
                  </button>
                  <button
                    onClick={() => handleAction('share')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700"
                  >
                    Share Recipe
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={() => handleAction('duplicate')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700"
                  >
                    Duplicate & Modify
                  </button>
                  <button
                    onClick={() => handleAction('addToCollection')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700"
                  >
                    Add to Collection
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        {recipe.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {recipe.description}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {recipe.total_time_minutes && (
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {recipe.total_time_minutes}m
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {recipe.servings}
              </span>
            )}
          </div>
          {recipe.rating && renderStars(recipe.rating)}
        </div>

        {/* Cuisine & Dietary Tags */}
        <div className="flex items-center gap-2 mb-3">
          {recipe.cuisine_type && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              {recipe.cuisine_type}
            </span>
          )}
          {recipe.dietary_tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {recipe.dietary_tags && recipe.dietary_tags.length > 2 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{recipe.dietary_tags.length - 2}
            </span>
          )}
        </div>

        {/* Source */}
        {recipe.source && (
          <div className="text-xs text-gray-400 border-t border-gray-100 pt-2">
            From {recipe.source}
          </div>
        )}
      </div>

      {/* Drag Feedback */}
      {isDragging && (
        <div className="absolute inset-0 bg-indigo-100 bg-opacity-75 flex items-center justify-center">
          <div className="text-indigo-700 font-medium">
            Drag to meal planner
          </div>
        </div>
      )}
    </div>
  );
}
