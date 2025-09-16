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
import { ThumbsUp, ThumbsDown, Heart, X } from 'lucide-react';
import { Recipe } from '@/types/recipes';

interface RecipeRatingProps {
  recipe: Recipe;
  currentRating?: number; // -2 to 2 scale (2 thumbs down to 2 thumbs up)
  onRate: (recipeId: string, rating: number) => void;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export type RecipeRating = -2 | -1 | 0 | 1 | 2;

export function RecipeRating({
  recipe,
  currentRating = 0,
  onRate,
  showLabel = true,
  size = 'md'
}: RecipeRatingProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-8 w-8';
      default:
        return 'h-6 w-6';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-sm';
    }
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case -2:
        return 'Strongly Dislike';
      case -1:
        return 'Dislike';
      case 0:
        return 'Not Rated';
      case 1:
        return 'Like';
      case 2:
        return 'Love It!';
      default:
        return 'Not Rated';
    }
  };

  const getRatingColor = (rating: number, isActive: boolean) => {
    if (!isActive) return 'text-gray-300';

    switch (rating) {
      case -2:
        return 'text-red-600';
      case -1:
        return 'text-red-400';
      case 1:
        return 'text-green-400';
      case 2:
        return 'text-green-600';
      default:
        return 'text-gray-300';
    }
  };

  const handleRating = (rating: number) => {
    onRate(recipe.id, rating);
  };

  const displayRating = hoveredRating !== null ? hoveredRating : currentRating;

  return (
    <div className="flex items-center space-x-1">
      {/* Two Thumbs Down */}
      <button
        onClick={() => handleRating(-2)}
        onMouseEnter={() => setHoveredRating(-2)}
        onMouseLeave={() => setHoveredRating(null)}
        className={`transition-all hover:scale-110 ${getRatingColor(-2, displayRating === -2)}`}
        title="Strongly Dislike"
      >
        <div className="flex">
          <ThumbsDown className={`${getSizeClasses()} rotate-180`} />
          <ThumbsDown className={`${getSizeClasses()} -ml-1 rotate-180`} />
        </div>
      </button>

      {/* One Thumb Down */}
      <button
        onClick={() => handleRating(-1)}
        onMouseEnter={() => setHoveredRating(-1)}
        onMouseLeave={() => setHoveredRating(null)}
        className={`transition-all hover:scale-110 ${getRatingColor(-1, displayRating === -1)}`}
        title="Dislike"
      >
        <ThumbsDown className={`${getSizeClasses()} rotate-180`} />
      </button>

      {/* Neutral/Clear Rating */}
      <button
        onClick={() => handleRating(0)}
        onMouseEnter={() => setHoveredRating(0)}
        onMouseLeave={() => setHoveredRating(null)}
        className={`transition-all hover:scale-110 ${displayRating === 0 ? 'text-gray-500' : 'text-gray-300'}`}
        title="Clear Rating"
      >
        <X className={getSizeClasses()} />
      </button>

      {/* One Thumb Up */}
      <button
        onClick={() => handleRating(1)}
        onMouseEnter={() => setHoveredRating(1)}
        onMouseLeave={() => setHoveredRating(null)}
        className={`transition-all hover:scale-110 ${getRatingColor(1, displayRating === 1)}`}
        title="Like"
      >
        <ThumbsUp className={getSizeClasses()} />
      </button>

      {/* Two Thumbs Up */}
      <button
        onClick={() => handleRating(2)}
        onMouseEnter={() => setHoveredRating(2)}
        onMouseLeave={() => setHoveredRating(null)}
        className={`transition-all hover:scale-110 ${getRatingColor(2, displayRating === 2)}`}
        title="Love It!"
      >
        <div className="flex">
          <ThumbsUp className={getSizeClasses()} />
          <ThumbsUp className={`${getSizeClasses()} -ml-1`} />
        </div>
      </button>

      {/* Favorite Heart */}
      <button
        onClick={() => handleRating(recipe.is_favorite ? 0 : 2)}
        className={`ml-2 transition-all hover:scale-110 ${
          recipe.is_favorite
            ? 'text-red-500'
            : 'text-gray-300 hover:text-red-400'
        }`}
        title={
          recipe.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'
        }
      >
        <Heart
          className={getSizeClasses()}
          fill={recipe.is_favorite ? 'currentColor' : 'none'}
        />
      </button>

      {/* Rating Label */}
      {showLabel && (
        <span
          className={`ml-2 font-medium ${getTextSize()} ${
            displayRating > 0
              ? 'text-green-600'
              : displayRating < 0
                ? 'text-red-600'
                : 'text-gray-500'
          }`}
        >
          {getRatingLabel(displayRating)}
        </span>
      )}
    </div>
  );
}

interface RecipeRatingStatsProps {
  recipe: Recipe;
  userRating?: number;
  className?: string;
}

export function RecipeRatingStats({
  recipe,
  userRating,
  className = ''
}: RecipeRatingStatsProps) {
  return (
    <div
      className={`flex items-center space-x-4 text-sm text-gray-600 ${className}`}
    >
      {/* Overall Rating */}
      <div className="flex items-center">
        <span className="font-medium text-yellow-600">
          {recipe.rating.toFixed(1)}
        </span>
        <span className="mx-1">★</span>
        <span>({recipe.rating_count} reviews)</span>
      </div>

      {/* User Rating */}
      {userRating !== undefined && userRating !== 0 && (
        <div className="flex items-center">
          <span className="text-xs text-gray-500">Your rating:</span>
          <span
            className={`ml-1 font-medium ${
              userRating > 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {userRating > 0 ? '👍' : '👎'}
            {Math.abs(userRating) > 1 && (userRating > 0 ? '👍' : '👎')}
          </span>
        </div>
      )}

      {/* Favorite Indicator */}
      {recipe.is_favorite && (
        <div className="flex items-center text-red-500">
          <Heart className="h-4 w-4 mr-1" fill="currentColor" />
          <span className="text-xs">Favorite</span>
        </div>
      )}
    </div>
  );
}
