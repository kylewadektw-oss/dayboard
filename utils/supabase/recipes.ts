// Recipe utility functions for database operations
// Centralized logic for recipe CRUD operations and data transformation

import { createClient } from '@/utils/supabase/client';
import { 
  Recipe, 
  RecipeWithDetails, 
  CreateRecipePayload, 
  UpdateRecipePayload,
  RecipeFilters,
  MealPlan,
  RecipeCookingHistory
} from '@/types/recipes';

const supabase = createClient();

export class RecipeService {
  /**
   * Get user's household ID
   */
  private static async getUserHousehold(): Promise<string | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('household_id')
      .eq('id', user.user.id)
      .single();

    return profile?.household_id || null;
  }

  /**
   * Fetch recipes with optional filters
   */
  static async getRecipes(filters?: RecipeFilters): Promise<RecipeWithDetails[]> {
    const householdId = await this.getUserHousehold();
    if (!householdId) return [];

    let query = supabase
      .from('recipes')
      .select(`
        *,
        profiles:created_by(id, name, avatar_url),
        recipe_favorites(user_id)
      `)
      .eq('household_id', householdId);

    // Apply filters
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,cuisine.ilike.%${filters.search}%`);
    }

    if (filters?.difficulty?.length) {
      query = query.in('difficulty', filters.difficulty);
    }

    if (filters?.meal_type?.length) {
      query = query.overlaps('meal_type', filters.meal_type);
    }

    if (filters?.diet_types?.length) {
      query = query.overlaps('diet_types', filters.diet_types);
    }

    if (filters?.cuisine?.length) {
      query = query.in('cuisine', filters.cuisine);
    }

    if (filters?.max_time) {
      query = query.lte('total_time_minutes', filters.max_time);
    }

    if (filters?.min_rating) {
      query = query.gte('rating', filters.min_rating);
    }

    if (filters?.tags?.length) {
      query = query.overlaps('tags', filters.tags);
    }

    const { data, error } = await query.order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching recipes:', error);
      return [];
    }

    // Get current user ID for favorite status
    const { data: user } = await supabase.auth.getUser();
    const currentUserId = user.user?.id;

    return data?.map(recipe => ({
      ...recipe,
      user_favorite: recipe.recipe_favorites?.some((fav: any) => fav.user_id === currentUserId) || false,
      creator: recipe.profiles ? {
        id: recipe.profiles.id,
        name: recipe.profiles.name || 'Unknown',
        avatar_url: recipe.profiles.avatar_url
      } : undefined
    })) || [];
  }

  /**
   * Get user's favorite recipes
   */
  static async getFavoriteRecipes(limit?: number): Promise<RecipeWithDetails[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    const householdId = await this.getUserHousehold();
    if (!householdId) return [];

    let query = supabase
      .from('recipes')
      .select(`
        *,
        profiles:created_by(id, name, avatar_url),
        recipe_favorites!inner(user_id, created_at)
      `)
      .eq('household_id', householdId)
      .eq('recipe_favorites.user_id', user.user.id)
      .order('recipe_favorites.created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching favorite recipes:', error);
      return [];
    }

    return data?.map(recipe => ({
      ...recipe,
      user_favorite: true,
      creator: recipe.profiles ? {
        id: recipe.profiles.id,
        name: recipe.profiles.name || 'Unknown',
        avatar_url: recipe.profiles.avatar_url
      } : undefined
    })) || [];
  }

  /**
   * Get a single recipe by ID
   */
  static async getRecipe(id: string): Promise<RecipeWithDetails | null> {
    const { data: user } = await supabase.auth.getUser();
    const currentUserId = user.user?.id;

    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        profiles:created_by(id, name, avatar_url),
        recipe_favorites(user_id),
        recipe_ratings(rating, review, user_id),
        recipe_cooking_history(cooked_at, cooked_by, servings_made)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching recipe:', error);
      return null;
    }

    return {
      ...data,
      user_favorite: data.recipe_favorites?.some((fav: any) => fav.user_id === currentUserId) || false,
      user_rating: data.recipe_ratings?.find((rating: any) => rating.user_id === currentUserId)?.rating,
      cooking_count: data.recipe_cooking_history?.length || 0,
      last_cooked: data.recipe_cooking_history?.[0]?.cooked_at,
      creator: data.profiles ? {
        id: data.profiles.id,
        name: data.profiles.name || 'Unknown',
        avatar_url: data.profiles.avatar_url
      } : undefined
    };
  }

  /**
   * Create a new recipe
   */
  static async createRecipe(payload: CreateRecipePayload): Promise<Recipe | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    const householdId = await this.getUserHousehold();
    if (!householdId) return null;

    const { data, error } = await supabase
      .from('recipes')
      .insert({
        ...payload,
        household_id: householdId,
        created_by: user.user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating recipe:', error);
      return null;
    }

    // Add to collections if specified
    if (payload.collection_ids?.length) {
      await this.addToCollections(data.id, payload.collection_ids);
    }

    return data;
  }

  /**
   * Update an existing recipe
   */
  static async updateRecipe(payload: UpdateRecipePayload): Promise<Recipe | null> {
    const { id, collection_ids, ...updateData } = payload;
    
    const { data, error } = await supabase
      .from('recipes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating recipe:', error);
      return null;
    }

    return data;
  }

  /**
   * Delete a recipe
   */
  static async deleteRecipe(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting recipe:', error);
      return false;
    }

    return true;
  }

  /**
   * Toggle recipe favorite status
   */
  static async toggleFavorite(recipeId: string, isFavorite: boolean): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    if (isFavorite) {
      // Remove from favorites
      const { error } = await supabase
        .from('recipe_favorites')
        .delete()
        .eq('recipe_id', recipeId)
        .eq('user_id', user.user.id);

      return !error;
    } else {
      // Add to favorites
      const { error } = await supabase
        .from('recipe_favorites')
        .insert({
          recipe_id: recipeId,
          user_id: user.user.id
        });

      return !error;
    }
  }

  /**
   * Rate a recipe
   */
  static async rateRecipe(recipeId: string, rating: number, review?: string): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    const { error } = await supabase
      .from('recipe_ratings')
      .upsert({
        recipe_id: recipeId,
        user_id: user.user.id,
        rating,
        review
      });

    return !error;
  }

  /**
   * Add recipe to cooking history
   */
  static async addCookingHistory(
    recipeId: string, 
    servingsMade?: number, 
    notes?: string, 
    rating?: number
  ): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    const householdId = await this.getUserHousehold();
    if (!householdId) return false;

    const { error } = await supabase
      .from('recipe_cooking_history')
      .insert({
        recipe_id: recipeId,
        cooked_by: user.user.id,
        household_id: householdId,
        servings_made: servingsMade,
        notes,
        rating
      });

    if (!error) {
      // Update recipe's last_cooked_at
      await supabase
        .from('recipes')
        .update({ last_cooked_at: new Date().toISOString() })
        .eq('id', recipeId);
    }

    return !error;
  }

  /**
   * Add recipe to meal plan
   */
  static async addToMealPlan(
    recipeId: string,
    plannedDate: string,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'appetizer' | 'beverage',
    servingsPlanned?: number,
    notes?: string
  ): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    const householdId = await this.getUserHousehold();
    if (!householdId) return false;

    const { error } = await supabase
      .from('meal_plans')
      .insert({
        recipe_id: recipeId,
        household_id: householdId,
        planned_by: user.user.id,
        planned_date: plannedDate,
        meal_type: mealType,
        servings_planned: servingsPlanned || 1,
        notes
      });

    return !error;
  }

  /**
   * Get meal plans for a date range
   */
  static async getMealPlans(startDate: string, endDate?: string): Promise<MealPlan[]> {
    const householdId = await this.getUserHousehold();
    if (!householdId) return [];

    let query = supabase
      .from('meal_plans')
      .select(`
        *,
        recipes(id, title, image_emoji, total_time_minutes, servings),
        profiles:planned_by(id, name, avatar_url)
      `)
      .eq('household_id', householdId)
      .gte('planned_date', startDate);

    if (endDate) {
      query = query.lte('planned_date', endDate);
    }

    const { data, error } = await query.order('planned_date');

    if (error) {
      console.error('Error fetching meal plans:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Add recipe to collections
   */
  private static async addToCollections(recipeId: string, collectionIds: string[]): Promise<void> {
    const items = collectionIds.map(collectionId => ({
      recipe_id: recipeId,
      collection_id: collectionId
    }));

    await supabase
      .from('recipe_collection_items')
      .insert(items);
  }

  /**
   * Get recipe statistics for household
   */
  static async getRecipeStats(): Promise<{
    totalRecipes: number;
    favoriteRecipes: number;
    recipesCooked: number;
    averageCookTime: number;
  }> {
    const householdId = await this.getUserHousehold();
    if (!householdId) return { totalRecipes: 0, favoriteRecipes: 0, recipesCooked: 0, averageCookTime: 0 };

    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;

    // Get total recipes count
    const { count: totalRecipes } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .eq('household_id', householdId);

    // Get user's favorite recipes count
    const { count: favoriteRecipes } = await supabase
      .from('recipe_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get recipes cooked this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: recipesCooked } = await supabase
      .from('recipe_cooking_history')
      .select('*', { count: 'exact', head: true })
      .eq('household_id', householdId)
      .gte('cooked_at', startOfMonth.toISOString());

    // Get average cook time
    const { data: avgData } = await supabase
      .from('recipes')
      .select('total_time_minutes')
      .eq('household_id', householdId);

    const averageCookTime = avgData?.length 
      ? avgData.reduce((sum, recipe) => sum + recipe.total_time_minutes, 0) / avgData.length
      : 0;

    return {
      totalRecipes: totalRecipes || 0,
      favoriteRecipes: favoriteRecipes || 0,
      recipesCooked: recipesCooked || 0,
      averageCookTime: Math.round(averageCookTime)
    };
  }
}
