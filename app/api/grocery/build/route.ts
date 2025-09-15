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

// app/api/grocery/build/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/** ---------- Normalization Maps ---------- */

// very small, extend as you go
const NAME_SYNONYMS: Record<string, string> = {
  scallions: "green onions",
  "green onion": "green onions",
  "spring onion": "green onions",
  cilantro: "coriander",
  "bell peppers": "bell pepper",
  "red pepper": "bell pepper",
  "yellow pepper": "bell pepper",
};

const STAPLES = new Set([
  "salt",
  "pepper",
  "black pepper",
  "olive oil",
  "vegetable oil",
  "canola oil",
  "water",
  "sugar",
  "flour",
  "baking powder",
  "baking soda",
  "vanilla extract",
  "soy sauce",
]);

// crude aisle classifier you can tune
function categorizeAisle(name: string): string {
  const n = name.toLowerCase();
  if (/(lettuce|onion|garlic|pepper|tomato|cilantro|cucumber|spinach|apple|banana|lime|lemon|avocado|herb)/.test(n))
    return "Produce";
  if (/(milk|yogurt|cheese|butter|cream)/.test(n)) return "Dairy";
  if (/(chicken|beef|pork|steak|turkey|sausage)/.test(n)) return "Meat";
  if (/(bread|bun|roll|bagel|tortilla)/.test(n)) return "Bakery";
  if (/(frozen|ice cream|peas \(frozen\)|corn \(frozen\))/.test(n)) return "Frozen";
  if (/(rice|pasta|beans|canned|broth|stock|tomato sauce|spice|salt|sugar|flour|oil)/.test(n)) return "Pantry";
  if (/(soda|juice|coffee|tea)/.test(n)) return "Beverages";
  return "Other";
}

/** ---------- Unit handling ---------- */

type UnitKind = "mass" | "volume" | "count";
const ML_PER_TSP = 5;
const ML_PER_TBSP = 15;
const ML_PER_CUP = 240;
const G_PER_OZ = 28.3495;
const G_PER_LB = 453.592;

function unitKind(unit?: string): UnitKind {
  const u = (unit || "").toLowerCase();
  if (["g", "gram", "grams", "kg", "oz", "ounce", "ounces", "lb", "pound", "pounds"].includes(u)) return "mass";
  if (["ml", "milliliter", "l", "liter", "tsp", "teaspoon", "tbsp", "tablespoon", "cup", "cups"].includes(u))
    return "volume";
  return "count";
}

function toCanonical(quantity: number, unit?: string): { qty: number; unit: string } {
  const u = (unit || "").toLowerCase();
  const kind = unitKind(u);
  if (kind === "count") return { qty: quantity, unit: "ct" };

  if (kind === "mass") {
    let g = quantity;
    if (["g", "gram", "grams"].includes(u)) g = quantity;
    else if (["kg"].includes(u)) g = quantity * 1000;
    else if (["oz", "ounce", "ounces"].includes(u)) g = quantity * G_PER_OZ;
    else if (["lb", "pound", "pounds"].includes(u)) g = quantity * G_PER_LB;
    return { qty: g, unit: "g" };
  }

  // volume
  let ml = quantity;
  if (["ml", "milliliter"].includes(u)) ml = quantity;
  else if (["l", "liter"].includes(u)) ml = quantity * 1000;
  else if (["tsp", "teaspoon"].includes(u)) ml = quantity * ML_PER_TSP;
  else if (["tbsp", "tablespoon"].includes(u)) ml = quantity * ML_PER_TBSP;
  else if (["cup", "cups"].includes(u)) ml = quantity * ML_PER_CUP;
  return { qty: ml, unit: "ml" };
}

function prettyUnit(qty: number, unit: string) {
  // simple niceties: prefer cups/tbsp for volumes, lb/oz for mass if big/small
  if (unit === "ml") {
    if (qty >= 480 && Math.abs(qty / ML_PER_CUP - Math.round(qty / ML_PER_CUP)) < 0.05)
      return `${Math.round(qty / ML_PER_CUP)} cup(s)`;
    if (qty >= ML_PER_TBSP && qty % ML_PER_TBSP === 0) return `${qty / ML_PER_TBSP} tbsp`;
    if (qty >= ML_PER_TSP && qty % ML_PER_TSP === 0) return `${qty / ML_PER_TSP} tsp`;
    return `${Math.round(qty)} ml`;
  }
  if (unit === "g") {
    if (qty >= 900 && Math.abs(qty / G_PER_LB - Math.round(qty / G_PER_LB)) < 0.05)
      return `${(qty / G_PER_LB).toFixed(1)} lb`;
    if (qty >= G_PER_OZ && Math.abs(qty / G_PER_OZ - Math.round(qty / G_PER_OZ)) < 0.05)
      return `${Math.round(qty / G_PER_OZ)} oz`;
    return `${Math.round(qty)} g`;
  }
  // ct
  return `${qty} ct`;
}

/** ---------- Types ---------- */

type InIngredient = {
  name: string;
  quantity?: number;
  unit?: string;
  aisle?: string | null;
};

type ConsolidatedItem = {
  name: string;
  qty: number;
  unit: string;
  aisle: string;
};

/** ---------- Utilities ---------- */

function canonicalName(raw: string): string {
  const t = raw.trim().toLowerCase();
  const mapped = NAME_SYNONYMS[t] || t;
  return mapped;
}

function mergeIngredients(inputs: InIngredient[]): {
  consolidated: Record<string, ConsolidatedItem[]>;
  staples: ConsolidatedItem[];
  flat: ConsolidatedItem[];
} {
  const map = new Map<string, ConsolidatedItem>();
  const staples: ConsolidatedItem[] = [];

  for (const ing of inputs) {
    const name = canonicalName(ing.name);
    const { qty, unit } = toCanonical(ing.quantity ?? 1, ing.unit);
    const aisle = ing.aisle || categorizeAisle(name);

    const key = `${name}__${unit}__${aisle}`;

    if (STAPLES.has(name)) {
      // Accumulate staples separately
      const existing = staples.find((s) => s.name === name && s.unit === unit);
      if (existing) existing.qty += qty;
      else staples.push({ name, qty, unit, aisle });
      continue;
    }

    const curr = map.get(key);
    if (curr) curr.qty += qty;
    else map.set(key, { name, qty, unit, aisle });
  }

  // group by aisle
  const consolidatedByAisle: Record<string, ConsolidatedItem[]> = {};
  const flat: ConsolidatedItem[] = [];

  map.forEach(item => {
    (consolidatedByAisle[item.aisle] ||= []).push(item);
    flat.push(item);
  });

  // sort
  for (const a of Object.keys(consolidatedByAisle)) {
    consolidatedByAisle[a].sort((x, y) => x.name.localeCompare(y.name));
  }
  staples.sort((x, y) => x.name.localeCompare(y.name));

  return { consolidated: consolidatedByAisle, staples, flat };
}

function toPlainText(groups: Record<string, ConsolidatedItem[]>, staples: ConsolidatedItem[]) {
  const lines: string[] = [];
  for (const aisle of Object.keys(groups).sort()) {
    lines.push(`\n## ${aisle}`);
    for (const it of groups[aisle]) lines.push(`- ${it.name} — ${prettyUnit(Math.round(it.qty), it.unit)}`);
  }
  if (staples.length) {
    lines.push(`\n## Staples`);
    for (const it of staples) lines.push(`- ${it.name} — ${prettyUnit(Math.round(it.qty), it.unit)}`);
  }
  return lines.join("\n");
}

function toCSV(groups: Record<string, ConsolidatedItem[]>, staples: ConsolidatedItem[]) {
  const rows = [["aisle", "name", "qty", "unit"]];
  const push = (it: ConsolidatedItem) => rows.push([it.aisle, it.name, String(Math.round(it.qty)), it.unit]);
  for (const aisle of Object.keys(groups)) groups[aisle].forEach(push);
  staples.forEach(push);
  return rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
}

// placeholder shape for later Instacart integration
function toInstacartDraft(groups: Record<string, ConsolidatedItem[]>) {
  return {
    version: 1,
    aisles: Object.keys(groups).map((aisle) => ({
      aisle,
      items: groups[aisle].map((it) => ({
        name: it.name,
        quantity: Math.round(it.qty),
        unit: it.unit,
      })),
    })),
  };
}

/** ---------- Data Fetch Helpers (optional) ---------- */

async function fetchIngredientsForMealPlan(supabase: SupabaseClient, mealPlanId: string): Promise<InIngredient[]> {
  // expects tables: meal_plan_items (recipe_id, servings), recipe_ingredients (recipe_id, name, quantity, unit)
  const { data: items, error } = await supabase
    .from("meal_plan_items")
    .select("recipe_id, servings, recipes:recipe_id(recipe_ingredients(name,quantity,unit,aisle))")
    .eq("meal_plan_id", mealPlanId);

  if (error) throw error;

  const result: InIngredient[] = [];
  for (const row of items || []) {
    const servings = row.servings ?? 1;
    const ingredients = Array.isArray(row.recipes) ? row.recipes.flatMap(r => r.recipe_ingredients || []) : [];
    for (const ing of ingredients) {
      result.push({
        name: ing.name,
        quantity: (ing.quantity ?? 1) * servings,
        unit: ing.unit ?? undefined,
        aisle: ing.aisle ?? null,
      });
    }
  }
  return result;
}

async function fetchIngredientsForRecipes(
  supabase: SupabaseClient,
  recipes: { id: number; servings?: number }[]
): Promise<InIngredient[]> {
  const ids = recipes.map((r) => r.id);
  const { data, error } = await supabase
    .from("recipe_ingredients")
    .select("recipe_id,name,quantity,unit,aisle")
    .in("recipe_id", ids);
  if (error) throw error;

  const byId = new Map<number, InIngredient[]>();
  for (const r of recipes) byId.set(r.id, []);

  for (const row of data || []) {
    const base: InIngredient = {
      name: row.name,
      quantity: row.quantity ?? 1,
      unit: row.unit ?? undefined,
      aisle: row.aisle ?? null,
    };
    const servings = recipes.find((x) => x.id === row.recipe_id)?.servings ?? 1;
    (byId.get(row.recipe_id) as InIngredient[]).push({
      ...base,
      quantity: (base.quantity ?? 1) * servings,
    });
  }

  const result: InIngredient[] = [];
  byId.forEach(ingredients => {
    result.push(...ingredients);
  });

  return result;
}

/** ---------- Route ---------- */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let ingredients: InIngredient[] = [];

    if (Array.isArray(body.ingredients)) {
      ingredients = body.ingredients;
    } else {
      const SUPABASE_URL = process.env.SUPABASE_URL!;
      const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

      if (body.mealPlanId) {
        ingredients = await fetchIngredientsForMealPlan(supabase, body.mealPlanId);
      } else if (Array.isArray(body.recipes)) {
        ingredients = await fetchIngredientsForRecipes(supabase, body.recipes);
      } else {
        return NextResponse.json({ error: "Provide `ingredients[]`, `mealPlanId`, or `recipes[]`." }, { status: 400 });
      }
    }

    const { consolidated, staples } = mergeIngredients(ingredients);
    const plainText = toPlainText(consolidated, staples);
    const csv = toCSV(consolidated, staples);
    const instacartDraft = toInstacartDraft(consolidated);

    return NextResponse.json({ consolidated, staples, plainText, csv, instacartDraft });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to build grocery list";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}