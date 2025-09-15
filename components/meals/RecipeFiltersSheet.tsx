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

"use client";

import { useEffect, useRef } from "react";

export type RecipeFilters = {
  diets: string[];            // ["vegetarian","keto"]
  allergensExclude: string[]; // ["peanut","shellfish"]
  cuisines: string[];         // ["italian","mexican"]
  includeIngredients: string[];
  excludeIngredients: string[];
  maxCookTime?: number;       // minutes
  minRating?: number;         // 1..5
  quickOnly?: boolean;
  imagesOnly?: boolean;
};

const DIETS = ["vegetarian", "vegan", "keto", "gluten-free", "dairy-free"];
const ALLERGENS = ["peanut", "tree nut", "shellfish", "egg", "sesame", "soy", "gluten", "dairy"];
const CUISINES = ["italian", "mexican", "asian", "indian", "american", "mediterranean", "thai", "japanese"];

type Props = {
  open: boolean;
  onClose: () => void;
  value: RecipeFilters;
  onApply: (f: RecipeFilters) => void;
};

export function RecipeFiltersSheet({ open, onClose, value, onApply }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dlg = ref.current!;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  // simple local copy via form fields (no extra state lib)
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);
    const pickAll = (name: string) => fd.getAll(name).map(String);

    const filters: RecipeFilters = {
      diets: pickAll("diet"),
      allergensExclude: pickAll("allergen"),
      cuisines: pickAll("cuisine"),
      includeIngredients: (fd.get("include") as string)?.split(",").map(s=>s.trim()).filter(Boolean) ?? [],
      excludeIngredients: (fd.get("exclude") as string)?.split(",").map(s=>s.trim()).filter(Boolean) ?? [],
      maxCookTime: Number(fd.get("maxCookTime")) || undefined,
      minRating: Number(fd.get("minRating")) || undefined,
      quickOnly: fd.get("quickOnly") === "on",
      imagesOnly: fd.get("imagesOnly") === "on",
    };
    onApply(filters);
    onClose();
  }

  // helpers for checked values
  const isChecked = (arr: string[], v: string) => arr.includes(v);

  return (
    <dialog ref={ref} className="p-0 rounded-2xl shadow-2xl w-[min(720px,92vw)] border">
      <form method="dialog" onSubmit={handleSubmit} className="bg-white rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div className="text-lg font-semibold">Filters</div>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="p-5 grid md:grid-cols-2 gap-6 max-h-[70vh] overflow-auto">
          {/* Diets */}
          <fieldset>
            <legend className="text-sm font-medium mb-2">Diet</legend>
            <div className="flex flex-wrap gap-2">
              {DIETS.map(d => (
                <label key={d} className={`px-3 py-1.5 rounded-full border text-sm cursor-pointer
                  ${isChecked(value.diets, d) ? "bg-indigo-600 text-white border-indigo-600" : "hover:bg-gray-50"}`}>
                  <input defaultChecked={isChecked(value.diets, d)} name="diet" value={d} type="checkbox" className="hidden" />
                  {d}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Allergens */}
          <fieldset>
            <legend className="text-sm font-medium mb-2">Exclude Allergens</legend>
            <div className="flex flex-wrap gap-2">
              {ALLERGENS.map(a => (
                <label key={a} className={`px-3 py-1.5 rounded-full border text-sm cursor-pointer
                  ${isChecked(value.allergensExclude, a) ? "bg-rose-600 text-white border-rose-600" : "hover:bg-gray-50"}`}>
                  <input defaultChecked={isChecked(value.allergensExclude, a)} name="allergen" value={a} type="checkbox" className="hidden" />
                  {a}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Cuisines */}
          <fieldset className="md:col-span-2">
            <legend className="text-sm font-medium mb-2">Cuisines</legend>
            <div className="flex flex-wrap gap-2">
              {CUISINES.map(c => (
                <label key={c} className={`px-3 py-1.5 rounded-full border text-sm cursor-pointer
                  ${isChecked(value.cuisines, c) ? "bg-emerald-600 text-white border-emerald-600" : "hover:bg-gray-50"}`}>
                  <input defaultChecked={isChecked(value.cuisines, c)} name="cuisine" value={c} type="checkbox" className="hidden" />
                  {c}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Time & Rating */}
          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm">
              <div className="mb-1">Max cook time (min)</div>
              <input name="maxCookTime" defaultValue={value.maxCookTime ?? ""} type="number" min={1}
                className="w-full h-10 px-3 rounded-lg border" placeholder="e.g. 30" />
            </label>
            <label className="text-sm">
              <div className="mb-1">Min rating (1–5)</div>
              <input name="minRating" defaultValue={value.minRating ?? ""} type="number" min={1} max={5} step={0.5}
                className="w-full h-10 px-3 rounded-lg border" placeholder="e.g. 4" />
            </label>
          </div>

          {/* Ingredients include/exclude */}
          <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
            <label className="text-sm">
              <div className="mb-1">Include ingredients (comma separated)</div>
              <input name="include" defaultValue={value.includeIngredients?.join(", ") ?? ""} className="w-full h-10 px-3 rounded-lg border" />
            </label>
            <label className="text-sm">
              <div className="mb-1">Exclude ingredients (comma separated)</div>
              <input name="exclude" defaultValue={value.excludeIngredients?.join(", ") ?? ""} className="w-full h-10 px-3 rounded-lg border" />
            </label>
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input name="quickOnly" type="checkbox" defaultChecked={!!value.quickOnly} />
              Quick only (&lt;= 20m)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input name="imagesOnly" type="checkbox" defaultChecked={!!value.imagesOnly} />
              Has image
            </label>
          </div>
        </div>

        <div className="px-5 py-4 border-t flex items-center justify-between">
          <button
            type="button"
            onClick={() => onApply({
              diets: [], allergensExclude: [], cuisines: [],
              includeIngredients: [], excludeIngredients: [],
              maxCookTime: undefined, minRating: undefined, quickOnly: false, imagesOnly: false,
            })}
            className="text-gray-600 hover:text-gray-800"
          >
            Clear
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="h-10 px-4 rounded-lg border hover:bg-gray-50">Cancel</button>
            <button type="submit" className="h-10 px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Apply</button>
          </div>
        </div>
      </form>
    </dialog>
  );
}