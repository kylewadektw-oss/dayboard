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

import {
  Cocktail,
  CocktailSearchResponse,
  Ingredient,
  IngredientSearchResponse,
  CocktailCategory,
  CocktailGlass,
  CocktailIngredientList,
  ParsedCocktail
} from '@/types/cocktails';

const API_BASE = 'https://www.thecocktaildb.com/api/json/v1/1';
const TEST_API_KEY = '1'; // Free test key for development

class CocktailAPI {
  /**
   * Search cocktail by name
   */
  static async searchByName(cocktailName: string): Promise<ParsedCocktail[]> {
    try {
      const response = await fetch(
        `${API_BASE}/search.php?s=${encodeURIComponent(cocktailName)}`
      );
      const data: CocktailSearchResponse = await response.json();

      if (!data.drinks) return [];

      return data.drinks.map(this.parseCocktail);
    } catch (error) {
      console.error('Error searching cocktails by name:', error);
      return [];
    }
  }

  /**
   * List all cocktails by first letter
   */
  static async searchByLetter(letter: string): Promise<ParsedCocktail[]> {
    try {
      const response = await fetch(
        `${API_BASE}/search.php?f=${letter.toLowerCase()}`
      );
      const data: CocktailSearchResponse = await response.json();

      if (!data.drinks) return [];

      return data.drinks.map(this.parseCocktail);
    } catch (error) {
      console.error('Error searching cocktails by letter:', error);
      return [];
    }
  }

  /**
   * Search ingredient by name
   */
  static async searchIngredient(ingredientName: string): Promise<Ingredient[]> {
    try {
      const response = await fetch(
        `${API_BASE}/search.php?i=${encodeURIComponent(ingredientName)}`
      );
      const data: IngredientSearchResponse = await response.json();

      return data.ingredients || [];
    } catch (error) {
      console.error('Error searching ingredients:', error);
      return [];
    }
  }

  /**
   * Lookup full cocktail details by ID
   */
  static async getCocktailById(
    cocktailId: string
  ): Promise<ParsedCocktail | null> {
    try {
      const response = await fetch(`${API_BASE}/lookup.php?i=${cocktailId}`);
      const data: CocktailSearchResponse = await response.json();

      if (!data.drinks || data.drinks.length === 0) return null;

      return this.parseCocktail(data.drinks[0]);
    } catch (error) {
      console.error('Error fetching cocktail by ID:', error);
      return null;
    }
  }

  /**
   * Lookup ingredient by ID
   */
  static async getIngredientById(
    ingredientId: string
  ): Promise<Ingredient | null> {
    try {
      const response = await fetch(
        `${API_BASE}/lookup.php?iid=${ingredientId}`
      );
      const data: IngredientSearchResponse = await response.json();

      if (!data.ingredients || data.ingredients.length === 0) return null;

      return data.ingredients[0];
    } catch (error) {
      console.error('Error fetching ingredient by ID:', error);
      return null;
    }
  }

  /**
   * Get a random cocktail
   */
  static async getRandomCocktail(): Promise<ParsedCocktail | null> {
    try {
      const response = await fetch(`${API_BASE}/random.php`);
      const data: CocktailSearchResponse = await response.json();

      if (!data.drinks || data.drinks.length === 0) return null;

      return this.parseCocktail(data.drinks[0]);
    } catch (error) {
      console.error('Error fetching random cocktail:', error);
      return null;
    }
  }

  /**
   * Search cocktails by ingredient
   */
  static async searchByIngredient(
    ingredient: string
  ): Promise<ParsedCocktail[]> {
    try {
      const response = await fetch(
        `${API_BASE}/filter.php?i=${encodeURIComponent(ingredient)}`
      );
      const data: CocktailSearchResponse = await response.json();

      if (!data.drinks) return [];

      return data.drinks.map(this.parseCocktail);
    } catch (error) {
      console.error('Error searching cocktails by ingredient:', error);
      return [];
    }
  }

  /**
   * Filter by alcoholic/non-alcoholic
   */
  static async filterByAlcoholic(
    alcoholic: 'Alcoholic' | 'Non_Alcoholic'
  ): Promise<ParsedCocktail[]> {
    try {
      const response = await fetch(`${API_BASE}/filter.php?a=${alcoholic}`);
      const data: CocktailSearchResponse = await response.json();

      if (!data.drinks) return [];

      return data.drinks.map(this.parseCocktail);
    } catch (error) {
      console.error('Error filtering by alcoholic:', error);
      return [];
    }
  }

  /**
   * Filter by category
   */
  static async filterByCategory(category: string): Promise<ParsedCocktail[]> {
    try {
      const response = await fetch(
        `${API_BASE}/filter.php?c=${encodeURIComponent(category)}`
      );
      const data: CocktailSearchResponse = await response.json();

      if (!data.drinks) return [];

      return data.drinks.map(this.parseCocktail);
    } catch (error) {
      console.error('Error filtering by category:', error);
      return [];
    }
  }

  /**
   * Filter by glass type
   */
  static async filterByGlass(glass: string): Promise<ParsedCocktail[]> {
    try {
      const response = await fetch(
        `${API_BASE}/filter.php?g=${encodeURIComponent(glass)}`
      );
      const data: CocktailSearchResponse = await response.json();

      if (!data.drinks) return [];

      return data.drinks.map(this.parseCocktail);
    } catch (error) {
      console.error('Error filtering by glass:', error);
      return [];
    }
  }

  /**
   * Get list of categories
   */
  static async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE}/list.php?c=list`);
      const data: { drinks: CocktailCategory[] } = await response.json();

      return data.drinks?.map((item) => item.strCategory) || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Get list of glass types
   */
  static async getGlasses(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE}/list.php?g=list`);
      const data: { drinks: CocktailGlass[] } = await response.json();

      return data.drinks?.map((item) => item.strGlass) || [];
    } catch (error) {
      console.error('Error fetching glasses:', error);
      return [];
    }
  }

  /**
   * Get list of ingredients
   */
  static async getIngredients(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE}/list.php?i=list`);
      const data: { drinks: CocktailIngredientList[] } = await response.json();

      return data.drinks?.map((item) => item.strIngredient1) || [];
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      return [];
    }
  }

  /**
   * Parse cocktail data to include structured ingredients
   */
  private static parseCocktail(cocktail: Cocktail): ParsedCocktail {
    const ingredients = [];

    // Parse ingredients and measurements
    for (let i = 1; i <= 15; i++) {
      const ingredient = cocktail[
        `strIngredient${i}` as keyof Cocktail
      ] as string;
      const measure = cocktail[`strMeasure${i}` as keyof Cocktail] as string;

      if (ingredient && ingredient.trim()) {
        ingredients.push({
          name: ingredient.trim(),
          measure: measure?.trim() || undefined
        });
      }
    }

    return {
      ...cocktail,
      ingredients,
      isFavorite: false, // Will be set based on user data
      userRating: undefined // Will be set based on user data
    };
  }

  /**
   * Get ingredient image URL
   */
  static getIngredientImageUrl(
    ingredientName: string,
    size: 'small' | 'medium' | 'large' = 'medium'
  ): string {
    const baseUrl = 'https://www.thecocktaildb.com/images/ingredients';
    const normalizedName = ingredientName.toLowerCase().replace(/ /g, '%20');

    switch (size) {
      case 'small':
        return `${baseUrl}/${normalizedName}-small.png`;
      case 'large':
        return `${baseUrl}/${normalizedName}.png`;
      case 'medium':
      default:
        return `${baseUrl}/${normalizedName}-medium.png`;
    }
  }

  /**
   * Get cocktail image thumbnail URL with size variants
   */
  static getCocktailImageUrl(
    originalUrl: string,
    size: 'small' | 'medium' | 'large' = 'medium'
  ): string {
    if (!originalUrl) return '';

    switch (size) {
      case 'small':
        return originalUrl + '/small';
      case 'large':
        return originalUrl + '/large';
      case 'medium':
      default:
        return originalUrl + '/medium';
    }
  }
}

export default CocktailAPI;
