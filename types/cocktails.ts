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

export interface Cocktail {
  idDrink: string;
  strDrink: string;
  strDrinkAlternate?: string;
  strTags?: string;
  strVideo?: string;
  strCategory: string;
  strIBA?: string;
  strAlcoholic: 'Alcoholic' | 'Non alcoholic' | 'Optional alcohol';
  strGlass: string;
  strInstructions: string;
  strInstructionsES?: string;
  strInstructionsDE?: string;
  strInstructionsFR?: string;
  strInstructionsIT?: string;
  strDrinkThumb: string;
  strIngredient1?: string;
  strIngredient2?: string;
  strIngredient3?: string;
  strIngredient4?: string;
  strIngredient5?: string;
  strIngredient6?: string;
  strIngredient7?: string;
  strIngredient8?: string;
  strIngredient9?: string;
  strIngredient10?: string;
  strIngredient11?: string;
  strIngredient12?: string;
  strIngredient13?: string;
  strIngredient14?: string;
  strIngredient15?: string;
  strMeasure1?: string;
  strMeasure2?: string;
  strMeasure3?: string;
  strMeasure4?: string;
  strMeasure5?: string;
  strMeasure6?: string;
  strMeasure7?: string;
  strMeasure8?: string;
  strMeasure9?: string;
  strMeasure10?: string;
  strMeasure11?: string;
  strMeasure12?: string;
  strMeasure13?: string;
  strMeasure14?: string;
  strMeasure15?: string;
  strImageSource?: string;
  strImageAttribution?: string;
  strCreativeCommonsConfirmed?: string;
  dateModified?: string;
}

export interface CocktailSearchResponse {
  drinks: Cocktail[] | null;
}

export interface Ingredient {
  idIngredient: string;
  strIngredient: string;
  strDescription?: string;
  strType?: string;
  strABV?: string;
}

export interface IngredientSearchResponse {
  ingredients: Ingredient[] | null;
}

export interface CocktailFilters {
  search?: string;
  ingredient?: string;
  category?: string;
  glass?: string;
  alcoholic?: 'Alcoholic' | 'Non_Alcoholic';
  letter?: string;
}

export interface CocktailCategory {
  strCategory: string;
}

export interface CocktailGlass {
  strGlass: string;
}

export interface CocktailIngredientList {
  strIngredient1: string;
}

export interface ParsedCocktail extends Cocktail {
  ingredients: Array<{
    name: string;
    measure?: string;
  }>;
  isFavorite?: boolean;
  userRating?: number;
}

export interface HouseholdCocktailFavorite {
  id: string;
  cocktail_id: string;
  household_id: string;
  user_id: string;
  rating?: number;
  notes?: string;
  created_at: string;
  cocktail_data: Cocktail;
}

export interface CocktailInventoryItem {
  id: string;
  household_id: string;
  ingredient_name: string;
  quantity?: number;
  unit?: string;
  expiry_date?: string;
  location?: string; // 'bar', 'pantry', 'fridge'
  cost?: number;
  brand?: string;
  created_at: string;
  updated_at: string;
}
