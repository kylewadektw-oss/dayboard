// Recipe-related TypeScript types for Supabase integration
// Auto-generated types for recipes table and related functionality

export type RecipeDifficulty = 'easy' | 'medium' | 'hard';
export type RecipeMealType =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'dessert'
  | 'appetizer'
  | 'beverage';
export type RecipeDietType =
  | 'none'
  | 'vegetarian'
  | 'vegan'
  | 'gluten_free'
  | 'dairy_free'
  | 'keto'
  | 'paleo'
  | 'low_carb'
  | 'mediterranean';

export interface RecipeIngredient {
  name: string;
  amount: string;
  unit: string;
  notes?: string;
}

export interface RecipeNutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  image_emoji: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  total_time_minutes: number;
  servings: number;
  difficulty: RecipeDifficulty;
  cuisine?: string;
  meal_type: RecipeMealType[];
  diet_types: RecipeDietType[];
  tags: string[];
  ingredients: RecipeIngredient[];
  instructions: string[];
  notes?: string;
  nutrition?: RecipeNutrition;
  rating: number;
  rating_count: number;
  source_name?: string;
  source_url?: string;
  external_id?: string;
  household_id: string;
  created_by?: string;
  is_favorite: boolean;
  is_public: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_cooked_at?: string;
}

export interface RecipeRating {
  id: string;
  recipe_id: string;
  user_id: string;
  rating: number;
  review?: string;
  created_at: string;
  updated_at: string;
}

export interface RecipeFavorite {
  id: string;
  recipe_id: string;
  user_id: string;
  created_at: string;
}

export interface RecipeCookingHistory {
  id: string;
  recipe_id: string;
  cooked_by: string;
  household_id: string;
  cooked_at: string;
  servings_made?: number;
  notes?: string;
  rating?: number;
}

export interface MealPlan {
  id: string;
  recipe_id: string;
  household_id: string;
  planned_by: string;
  planned_date: string;
  meal_type: RecipeMealType;
  servings_planned: number;
  notes?: string;
  status: 'planned' | 'preparing' | 'completed' | 'skipped';
  created_at: string;
  updated_at: string;
}

export interface MealPlanWithRecipe extends MealPlan {
  recipe: Recipe;
  planner?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface RecipeCollection {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  household_id: string;
  created_by: string;
  is_default: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface RecipeCollectionItem {
  id: string;
  recipe_id: string;
  collection_id: string;
  added_at: string;
}

// Enhanced recipe with related data
export interface RecipeWithDetails extends Recipe {
  creator?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  user_rating?: number;
  user_favorite?: boolean;
  cooking_count?: number;
  last_cooked?: string;
  collections?: RecipeCollection[];
}

// Recipe filters for searching and filtering
export interface RecipeFilters {
  search?: string;
  difficulty?: RecipeDifficulty[];
  meal_type?: RecipeMealType[];
  diet_types?: RecipeDietType[];
  cuisine?: string[];
  max_time?: number;
  min_rating?: number;
  tags?: string[];
  is_favorite?: boolean;
  collections?: string[];
}

// Recipe creation/update payloads
export interface CreateRecipePayload {
  title: string;
  description?: string;
  image_url?: string;
  image_emoji?: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  difficulty: RecipeDifficulty;
  cuisine?: string;
  meal_type: RecipeMealType[];
  diet_types?: RecipeDietType[];
  tags?: string[];
  ingredients: RecipeIngredient[];
  instructions: string[];
  notes?: string;
  nutrition?: RecipeNutrition;
  source_name?: string;
  source_url?: string;
  is_public?: boolean;
  collection_ids?: string[];
}

export interface UpdateRecipePayload extends Partial<CreateRecipePayload> {
  id: string;
}

// API response types
export interface RecipeSearchResponse {
  recipes: RecipeWithDetails[];
  total_count: number;
  page: number;
  limit: number;
  filters_applied: RecipeFilters;
}

export interface PopularRecipe {
  recipe: RecipeWithDetails;
  cooking_frequency: number;
  average_rating: number;
  last_cooked: string;
}

export interface RecipeStats {
  total_recipes: number;
  favorite_recipes: number;
  recipes_cooked_this_month: number;
  average_cook_time: number;
  most_popular_cuisine: string;
  top_collections: RecipeCollection[];
}

// Component props types
export interface RecipeCardProps {
  recipe: RecipeWithDetails;
  onFavorite?: (recipeId: string, isFavorite: boolean) => void;
  onRate?: (recipeId: string, rating: number) => void;
  onAddToMealPlan?: (
    recipeId: string,
    date: string,
    mealType: RecipeMealType
  ) => void;
  onViewDetails?: (recipeId: string) => void;
  showQuickActions?: boolean;
  compact?: boolean;
}

export interface RecipeFormProps {
  recipe?: Recipe;
  onSubmit: (
    recipe: CreateRecipePayload | UpdateRecipePayload
  ) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface MealPlannerProps {
  household_id: string;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  showAddRecipe?: boolean;
}

// Utility types for recipe operations
export type RecipeAction =
  | { type: 'FAVORITE'; recipeId: string; isFavorite: boolean }
  | { type: 'RATE'; recipeId: string; rating: number; review?: string }
  | { type: 'COOK'; recipeId: string; servings?: number; notes?: string }
  | { type: 'ADD_TO_COLLECTION'; recipeId: string; collectionId: string }
  | { type: 'REMOVE_FROM_COLLECTION'; recipeId: string; collectionId: string }
  | {
      type: 'SCHEDULE';
      recipeId: string;
      date: string;
      mealType: RecipeMealType;
    };

// Constants for UI
export const RECIPE_DIFFICULTIES: {
  value: RecipeDifficulty;
  label: string;
  color: string;
}[] = [
  { value: 'easy', label: 'Easy', color: 'text-green-600 bg-green-100' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-100' },
  { value: 'hard', label: 'Hard', color: 'text-red-600 bg-red-100' }
];

export const MEAL_TYPES: {
  value: RecipeMealType;
  label: string;
  emoji: string;
}[] = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { value: 'lunch', label: 'Lunch', emoji: '🌞' },
  { value: 'dinner', label: 'Dinner', emoji: '🌙' },
  { value: 'snack', label: 'Snack', emoji: '🍿' },
  { value: 'dessert', label: 'Dessert', emoji: '🍰' },
  { value: 'appetizer', label: 'Appetizer', emoji: '🥗' },
  { value: 'beverage', label: 'Beverage', emoji: '🥤' }
];

export const DIET_TYPES: {
  value: RecipeDietType;
  label: string;
  emoji: string;
}[] = [
  { value: 'none', label: 'No Restrictions', emoji: '🍽️' },
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥬' },
  { value: 'vegan', label: 'Vegan', emoji: '🌱' },
  { value: 'gluten_free', label: 'Gluten Free', emoji: '🌾' },
  { value: 'dairy_free', label: 'Dairy Free', emoji: '🥛' },
  { value: 'keto', label: 'Keto', emoji: '🥑' },
  { value: 'paleo', label: 'Paleo', emoji: '🦴' },
  { value: 'low_carb', label: 'Low Carb', emoji: '🥒' },
  { value: 'mediterranean', label: 'Mediterranean', emoji: '🫒' }
];

export const COMMON_CUISINES = [
  'American',
  'Italian',
  'Mexican',
  'Chinese',
  'Japanese',
  'Thai',
  'Indian',
  'French',
  'Greek',
  'Mediterranean',
  'Korean',
  'Vietnamese',
  'Spanish',
  'German',
  'British',
  'Middle Eastern',
  'Brazilian',
  'Moroccan'
];

export const COMMON_TAGS = [
  'quick',
  'easy',
  'healthy',
  'comfort food',
  'one pot',
  'slow cooker',
  'grilled',
  'baked',
  'fried',
  'roasted',
  'spicy',
  'sweet',
  'savory',
  'kid-friendly',
  'date night',
  'holiday',
  'meal prep',
  'budget friendly',
  'high protein',
  'low fat',
  'low sodium',
  'make ahead',
  'freezer friendly'
];
