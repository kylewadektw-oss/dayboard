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

import { useState, useEffect } from 'react';
import { Search, Filter, Shuffle, Heart, Wine, Coffee, Martini, Star, Package } from 'lucide-react';
import CocktailAPI from '@/utils/cocktailApi';
import { ParsedCocktail } from '@/types/cocktails';
import { CocktailInventory } from './CocktailInventory';

const COCKTAIL_TABS = [
  { id: 'discover', name: 'Discover', icon: Martini },
  { id: 'inventory', name: 'Bar Inventory', icon: Package }
];

export function Cocktails() {
  const [activeTab, setActiveTab] = useState('discover');
  const [cocktails, setCocktails] = useState<ParsedCocktail[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCocktail, setSelectedCocktail] = useState<ParsedCocktail | null>(null);

  useEffect(() => {
    if (activeTab === 'discover') {
      loadFeaturedCocktails();
    }
  }, [activeTab]);

  const loadFeaturedCocktails = async () => {
    setLoading(true);
    try {
      // Mock data for now
      const mockCocktails: ParsedCocktail[] = [
        {
          idDrink: '1',
          strDrink: 'Margarita',
          strCategory: 'Ordinary Drink',
          strAlcoholic: 'Alcoholic',
          strGlass: 'Cocktail glass',
          strInstructions: 'Mix tequila, lime juice, and triple sec. Serve with salt rim.',
          strDrinkThumb: '',
          ingredients: [
            { name: 'Tequila', measure: '2 oz' },
            { name: 'Lime juice', measure: '1 oz' },
            { name: 'Triple sec', measure: '0.5 oz' }
          ]
        },
        {
          idDrink: '2',
          strDrink: 'Mojito',
          strCategory: 'Cocktail',
          strAlcoholic: 'Alcoholic',
          strGlass: 'Highball glass',
          strInstructions: 'Muddle mint with simple syrup, add rum and lime juice, top with soda water.',
          strDrinkThumb: '',
          ingredients: [
            { name: 'White rum', measure: '2 oz' },
            { name: 'Lime juice', measure: '1 oz' },
            { name: 'Simple syrup', measure: '0.5 oz' },
            { name: 'Fresh mint', measure: '10 leaves' },
            { name: 'Soda water', measure: 'Top' }
          ]
        }
      ];
      setCocktails(mockCocktails);
    } catch (error) {
      console.error('Error loading featured cocktails:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && cocktails.length === 0 && activeTab === 'discover') {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              🍹 Cocktails & Beverages
            </h2>
            <p className="text-gray-600 mt-1">Discover and create amazing cocktails for your household</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8">
            {COCKTAIL_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'inventory' && <CocktailInventory />}
      
      {activeTab === 'discover' && (
        <div className="space-y-6">
          {/* Coming Soon Notice */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🍹</div>
              <h3 className="text-xl font-semibold text-purple-900 mb-2">Cocktail Discovery Coming Soon!</h3>
              <p className="text-purple-700 mb-4">
                We're integrating with TheCocktailDB API to bring you thousands of cocktail recipes, 
                ingredient search, and smart recommendations based on your bar inventory.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-600">
                <div className="bg-white/60 p-3 rounded-lg">
                  <strong>Features in development:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Search cocktails by name or ingredient</li>
                    <li>Browse by alcohol type (alcoholic/non-alcoholic)</li>
                    <li>Filter by glass type and category</li>
                    <li>Random cocktail discovery</li>
                  </ul>
                </div>
                <div className="bg-white/60 p-3 rounded-lg">
                  <strong>Smart integrations:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Auto-generate shopping lists from recipes</li>
                    <li>Track bar inventory and suggest cocktails</li>
                    <li>Household favorites and rating system</li>
                    <li>Integration with meal planning events</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Mock Cocktails Grid */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Cocktails Preview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cocktails.map((cocktail) => (
                <div
                  key={cocktail.idDrink}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Cocktail Image Placeholder */}
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 relative overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl">🍹</span>
                    </div>
                    
                    {/* Alcoholic Badge */}
                    <div className="absolute bottom-2 left-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cocktail.strAlcoholic === 'Alcoholic'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {cocktail.strAlcoholic === 'Alcoholic' ? '🍷 Alcoholic' : '🥤 Non-Alcoholic'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{cocktail.strDrink}</h3>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Wine className="h-4 w-4 mr-2" />
                        <span>{cocktail.strCategory}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Martini className="h-4 w-4 mr-2" />
                        <span>{cocktail.strGlass}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="text-xs">🧪</span>
                        <span className="ml-2">{cocktail.ingredients.length} ingredients</span>
                      </div>
                    </div>

                    {/* Quick ingredient preview */}
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-1">
                        {cocktail.ingredients.slice(0, 3).map((ingredient, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                          >
                            {ingredient.name}
                          </span>
                        ))}
                        {cocktail.ingredients.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                            +{cocktail.ingredients.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
