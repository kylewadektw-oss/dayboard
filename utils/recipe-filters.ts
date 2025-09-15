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

import type { RecipeFilters } from "../components/meals/RecipeFiltersSheet";

/**
 * Convert RecipeFilters object to URL search parameters
 */
export function filtersToURLParams(filters: RecipeFilters): URLSearchParams {
  const params = new URLSearchParams();

  // Arrays as comma-separated values
  if (filters.diets?.length) params.set("diets", filters.diets.join(","));
  if (filters.allergensExclude?.length) params.set("allergens", filters.allergensExclude.join(","));
  if (filters.cuisines?.length) params.set("cuisines", filters.cuisines.join(","));
  if (filters.includeIngredients?.length) params.set("include", filters.includeIngredients.join(","));
  if (filters.excludeIngredients?.length) params.set("exclude", filters.excludeIngredients.join(","));

  // Numeric values
  if (filters.maxCookTime) params.set("maxCookTime", String(filters.maxCookTime));
  if (filters.minRating) params.set("minRating", String(filters.minRating));

  // Boolean flags (only set if true)
  if (filters.quickOnly) params.set("quickOnly", "true");
  if (filters.imagesOnly) params.set("imagesOnly", "true");

  return params;
}

/**
 * Parse URL search parameters into RecipeFilters object
 */
export function urlParamsToFilters(params: URLSearchParams): RecipeFilters {
  const splitComma = (v: string | null): string[] => v ? v.split(",").map(s => s.trim()).filter(Boolean) : [];

  return {
    diets: splitComma(params.get("diets")),
    allergensExclude: splitComma(params.get("allergens")),
    cuisines: splitComma(params.get("cuisines")),
    includeIngredients: splitComma(params.get("include")),
    excludeIngredients: splitComma(params.get("exclude")),
    maxCookTime: params.get("maxCookTime") ? Number(params.get("maxCookTime")) : undefined,
    minRating: params.get("minRating") ? Number(params.get("minRating")) : undefined,
    quickOnly: params.get("quickOnly") === "true",
    imagesOnly: params.get("imagesOnly") === "true",
  };
}

/**
 * Convert RecipeFilters to PostgreSQL WHERE clause conditions
 * For use with Supabase queries
 */
export function filtersToSupabaseQuery(filters: RecipeFilters) {
  const conditions: string[] = [];
  const bindings: Record<string, string | number | boolean | string[]> = {};

  let paramIndex = 1;

  // Diet restrictions (assuming recipes table has a 'diets' text array column)
  if (filters.diets?.length) {
    conditions.push(`diets && $${paramIndex}`);
    bindings[`$${paramIndex}`] = `{${filters.diets.join(",")}}`;
    paramIndex++;
  }

  // Allergen exclusions (assuming 'allergens' text array column)
  if (filters.allergensExclude?.length) {
    conditions.push(`NOT (allergens && $${paramIndex})`);
    bindings[`$${paramIndex}`] = `{${filters.allergensExclude.join(",")}}`;
    paramIndex++;
  }

  // Cuisine filter
  if (filters.cuisines?.length) {
    conditions.push(`cuisine = ANY($${paramIndex})`);
    bindings[`$${paramIndex}`] = `{${filters.cuisines.join(",")}}`;
    paramIndex++;
  }

  // Cook time limit
  if (filters.maxCookTime) {
    conditions.push(`cook_time_minutes <= $${paramIndex}`);
    bindings[`$${paramIndex}`] = filters.maxCookTime;
    paramIndex++;
  }

  // Minimum rating
  if (filters.minRating) {
    conditions.push(`rating >= $${paramIndex}`);
    bindings[`$${paramIndex}`] = filters.minRating;
    paramIndex++;
  }

  // Quick recipes only (≤ 20 minutes)
  if (filters.quickOnly) {
    conditions.push(`cook_time_minutes <= 20`);
  }

  // Recipes with images only
  if (filters.imagesOnly) {
    conditions.push(`image_url IS NOT NULL AND image_url != ''`);
  }

  // Include ingredients (must contain all specified ingredients)
  if (filters.includeIngredients?.length) {
    for (const ingredient of filters.includeIngredients) {
      conditions.push(`ingredients @> $${paramIndex}`);
      bindings[`$${paramIndex}`] = `["${ingredient}"]`;
      paramIndex++;
    }
  }

  // Exclude ingredients (must not contain any specified ingredients)
  if (filters.excludeIngredients?.length) {
    for (const ingredient of filters.excludeIngredients) {
      conditions.push(`NOT (ingredients @> $${paramIndex})`);
      bindings[`$${paramIndex}`] = `["${ingredient}"]`;
      paramIndex++;
    }
  }

  return {
    whereClause: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    bindings
  };
}

/**
 * Check if filters object has any active filters
 */
export function hasActiveFilters(filters: RecipeFilters): boolean {
  return !!(
    filters.diets?.length ||
    filters.allergensExclude?.length ||
    filters.cuisines?.length ||
    filters.includeIngredients?.length ||
    filters.excludeIngredients?.length ||
    filters.maxCookTime ||
    filters.minRating ||
    filters.quickOnly ||
    filters.imagesOnly
  );
}

/**
 * Get a human-readable summary of active filters
 */
export function getFiltersSummary(filters: RecipeFilters): string {
  const parts: string[] = [];

  if (filters.diets?.length) parts.push(`${filters.diets.join(", ")} diet`);
  if (filters.allergensExclude?.length) parts.push(`no ${filters.allergensExclude.join(", ")}`);
  if (filters.cuisines?.length) parts.push(`${filters.cuisines.join(", ")} cuisine`);
  if (filters.maxCookTime) parts.push(`≤ ${filters.maxCookTime}min`);
  if (filters.minRating) parts.push(`${filters.minRating}+ stars`);
  if (filters.quickOnly) parts.push("quick recipes");
  if (filters.imagesOnly) parts.push("with photos");
  if (filters.includeIngredients?.length) parts.push(`with ${filters.includeIngredients.join(", ")}`);
  if (filters.excludeIngredients?.length) parts.push(`without ${filters.excludeIngredients.join(", ")}`);

  return parts.length ? parts.join(" • ") : "No filters";
}