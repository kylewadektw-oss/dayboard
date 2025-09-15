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
import { EnhancedWeeklyMealPlan } from './EnhancedWeeklyMealPlan';
import type { Recipe, MealPlan } from '@/types/recipes';

// Supabase integration coming soon
// const supabase = createClient();

// Mock data for demonstration
const mockRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Overnight Oats',
    description: 'Healthy overnight oats with fresh berries',
    image_emoji: '🥣',
    prep_time_minutes: 5,
    cook_time_minutes: 0,
    total_time_minutes: 5,
    servings: 1,
    difficulty: 'easy',
    cuisine: 'American',
    meal_type: ['breakfast'],
    diet_types: ['vegetarian'],
    tags: ['healthy', 'quick', 'make-ahead'],
    ingredients: [
      { name: 'rolled oats', amount: '1/2', unit: 'cup' },
      { name: 'milk', amount: '1/2', unit: 'cup' },
      { name: 'chia seeds', amount: '1', unit: 'tbsp' },
      { name: 'honey', amount: '1', unit: 'tbsp' },
      { name: 'vanilla extract', amount: '1/2', unit: 'tsp' },
      { name: 'mixed berries', amount: '1/4', unit: 'cup' }
    ],
    instructions: [
      'Mix oats, milk, chia seeds, honey, and vanilla in a jar',
      'Refrigerate overnight',
      'Top with berries before serving'
    ],
    rating: 4.5,
    rating_count: 23,
    household_id: 'household-1',
    created_by: 'user-1',
    is_favorite: true,
    is_public: false,
    is_verified: true,
    created_at: '2025-09-10',
    updated_at: '2025-09-10'
  },
  {
    id: '2',
    title: 'Honey Garlic Chicken',
    description: 'Tender chicken with sweet and savory honey garlic sauce',
    image_emoji: '🍗',
    prep_time_minutes: 15,
    cook_time_minutes: 25,
    total_time_minutes: 40,
    servings: 4,
    difficulty: 'medium',
    cuisine: 'Asian',
    meal_type: ['dinner'],
    diet_types: ['none'],
    tags: ['family-friendly', 'chicken', 'sauce'],
    ingredients: [
      { name: 'chicken thighs', amount: '2', unit: 'lbs' },
      { name: 'honey', amount: '1/3', unit: 'cup' },
      { name: 'soy sauce', amount: '1/4', unit: 'cup' },
      { name: 'garlic', amount: '4', unit: 'cloves' },
      { name: 'rice vinegar', amount: '2', unit: 'tbsp' },
      { name: 'ginger', amount: '1', unit: 'tbsp' }
    ],
    instructions: [
      'Season chicken with salt and pepper',
      'Heat oil in large skillet over medium-high heat',
      'Cook chicken until golden brown, about 6-8 minutes per side',
      'Mix honey, soy sauce, garlic, vinegar, and ginger',
      'Pour sauce over chicken and simmer 10 minutes',
      'Serve with rice and steamed vegetables'
    ],
    rating: 4.8,
    rating_count: 45,
    household_id: 'household-1',
    created_by: 'user-1',
    is_favorite: true,
    is_public: false,
    is_verified: true,
    created_at: '2025-09-10',
    updated_at: '2025-09-10'
  },
  {
    id: '3',
    title: 'Mediterranean Quinoa Bowl',
    description: 'Fresh and healthy quinoa bowl with Mediterranean flavors',
    image_emoji: '🥗',
    prep_time_minutes: 20,
    cook_time_minutes: 15,
    total_time_minutes: 35,
    servings: 2,
    difficulty: 'easy',
    cuisine: 'Mediterranean',
    meal_type: ['lunch', 'dinner'],
    diet_types: ['vegetarian', 'gluten_free'],
    tags: ['healthy', 'fresh', 'bowl'],
    ingredients: [
      { name: 'quinoa', amount: '1', unit: 'cup' },
      { name: 'cucumber', amount: '1', unit: 'large' },
      { name: 'cherry tomatoes', amount: '1', unit: 'cup' },
      { name: 'feta cheese', amount: '1/2', unit: 'cup' },
      { name: 'olive oil', amount: '3', unit: 'tbsp' },
      { name: 'lemon juice', amount: '2', unit: 'tbsp' }
    ],
    instructions: [
      'Cook quinoa according to package directions',
      'Dice cucumber and halve cherry tomatoes',
      'Whisk olive oil, lemon juice, salt, and pepper',
      'Combine quinoa, vegetables, and feta',
      'Drizzle with dressing and toss to combine'
    ],
    rating: 4.3,
    rating_count: 18,
    household_id: 'household-1',
    created_by: 'user-1',
    is_favorite: false,
    is_public: false,
    is_verified: true,
    created_at: '2025-09-10',
    updated_at: '2025-09-10'
  }
];

const mockMealPlans: MealPlan[] = [
  {
    id: '1',
    recipe_id: '1',
    household_id: 'household-1',
    planned_by: 'user-1',
    planned_date: '2025-09-16', // Monday
    meal_type: 'breakfast',
    servings_planned: 1,
    status: 'planned',
    created_at: '2025-09-10',
    updated_at: '2025-09-10'
  },
  {
    id: '2',
    recipe_id: '2',
    household_id: 'household-1',
    planned_by: 'user-1',
    planned_date: '2025-09-16', // Monday
    meal_type: 'dinner',
    servings_planned: 4,
    status: 'planned',
    created_at: '2025-09-10',
    updated_at: '2025-09-10'
  }
];

export default function EnhancedMealPlanWrapper() {
  const [recipes] = useState<Recipe[]>(mockRecipes);
  // Unused setters commented out to fix build errors:
  // const [recipes, setRecipes] = useState<Recipe[]>(mockRecipes);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>(mockMealPlans);
  // Unused loading state commented out to fix build errors:
  // const [loading, setLoading] = useState(false);

  const handleUpdateMealPlan = async (mealPlan: Partial<MealPlan>) => {
    if (mealPlan.id) {
      setMealPlans(prev => prev.map(plan => 
        plan.id === mealPlan.id ? { ...plan, ...mealPlan } : plan
      ));
    }
  };

  const handleCreateMealPlan = async (mealPlan: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>) => {
    const newPlan: MealPlan = {
      ...mealPlan,
      id: `plan-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setMealPlans(prev => [...prev, newPlan]);
  };

  const handleDeleteMealPlan = async (id: string) => {
    setMealPlans(prev => prev.filter(plan => plan.id !== id));
  };

  return (
    <EnhancedWeeklyMealPlan
      recipes={recipes}
      mealPlans={mealPlans}
      onUpdateMealPlan={handleUpdateMealPlan}
      onCreateMealPlan={handleCreateMealPlan}
      onDeleteMealPlan={handleDeleteMealPlan}
      householdId="household-1"
      userId="user-1"
    />
  );
}
