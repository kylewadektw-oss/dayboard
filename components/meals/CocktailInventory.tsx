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
import { Plus, Search, Filter, Wine, Coffee, Martini } from 'lucide-react';
import { CocktailInventoryItem } from '@/types/cocktails';

const MOCK_INVENTORY: CocktailInventoryItem[] = [
  {
    id: '1',
    household_id: 'household-1',
    ingredient_name: 'Vodka',
    quantity: 750,
    unit: 'ml',
    location: 'bar',
    brand: 'Grey Goose',
    cost: 45.99,
    created_at: '2025-09-10',
    updated_at: '2025-09-10'
  },
  {
    id: '2',
    household_id: 'household-1',
    ingredient_name: 'Rum',
    quantity: 500,
    unit: 'ml',
    location: 'bar',
    brand: 'Bacardi',
    cost: 28.99,
    expiry_date: '2026-12-31',
    created_at: '2025-09-10',
    updated_at: '2025-09-10'
  },
  {
    id: '3',
    household_id: 'household-1',
    ingredient_name: 'Lime Juice',
    quantity: 250,
    unit: 'ml',
    location: 'fridge',
    expiry_date: '2025-09-15',
    cost: 3.99,
    created_at: '2025-09-10',
    updated_at: '2025-09-10'
  },
  {
    id: '4',
    household_id: 'household-1',
    ingredient_name: 'Simple Syrup',
    quantity: 200,
    unit: 'ml',
    location: 'pantry',
    cost: 2.99,
    created_at: '2025-09-10',
    updated_at: '2025-09-10'
  },
  {
    id: '5',
    household_id: 'household-1',
    ingredient_name: 'Tonic Water',
    quantity: 6,
    unit: 'bottles',
    location: 'fridge',
    expiry_date: '2025-11-30',
    cost: 8.99,
    created_at: '2025-09-10',
    updated_at: '2025-09-10'
  }
];

const LOCATION_ICONS = {
  bar: '🍷',
  fridge: '❄️',
  pantry: '🥫'
};

const LOCATION_COLORS = {
  bar: 'bg-purple-100 text-purple-800',
  fridge: 'bg-blue-100 text-blue-800',
  pantry: 'bg-yellow-100 text-yellow-800'
};

export function CocktailInventory() {
  const [inventory, setInventory] = useState<CocktailInventoryItem[]>(MOCK_INVENTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.ingredient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || item.location === selectedLocation;
    
    return matchesSearch && matchesLocation;
  });

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return 'none';
    
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 7) return 'warning';
    if (daysUntilExpiry <= 30) return 'caution';
    return 'good';
  };

  const getExpiryColor = (status: string) => {
    switch (status) {
      case 'expired': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-orange-100 text-orange-800';
      case 'caution': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getExpiryText = (expiryDate?: string) => {
    if (!expiryDate) return '';
    
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return `Expired ${Math.abs(daysUntilExpiry)} days ago`;
    if (daysUntilExpiry === 0) return 'Expires today';
    if (daysUntilExpiry === 1) return 'Expires tomorrow';
    return `Expires in ${daysUntilExpiry} days`;
  };

  const totalValue = inventory.reduce((sum, item) => sum + (item.cost || 0), 0);
  const lowStockItems = inventory.filter(item => {
    const expiry = getExpiryStatus(item.expiry_date);
    return expiry === 'warning' || expiry === 'expired';
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            🍸 Cocktail Inventory
          </h2>
          <p className="text-gray-600 mt-1">Manage your household bar ingredients and supplies</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center hover:from-purple-700 hover:to-indigo-700 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Ingredient
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Wine className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-xl font-semibold text-gray-900">{inventory.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-lg">💰</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-xl font-semibold text-gray-900">${totalValue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-lg">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-xl font-semibold text-gray-900">{lowStockItems.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Martini className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Locations</p>
              <p className="text-xl font-semibold text-gray-900">3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ingredients or brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedLocation('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedLocation === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-purple-50'
            }`}
          >
            All Locations
          </button>
          {Object.entries(LOCATION_ICONS).map(([location, icon]) => (
            <button
              key={location}
              onClick={() => setSelectedLocation(location)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedLocation === location
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-purple-50'
              }`}
            >
              <span className="mr-1">{icon}</span>
              {location.charAt(0).toUpperCase() + location.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInventory.map((item) => {
          const expiryStatus = getExpiryStatus(item.expiry_date);
          return (
            <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.ingredient_name}</h3>
                  {item.brand && (
                    <p className="text-sm text-gray-600">{item.brand}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${LOCATION_COLORS[item.location as keyof typeof LOCATION_COLORS]}`}>
                    {LOCATION_ICONS[item.location as keyof typeof LOCATION_ICONS]} {item.location}
                  </span>
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Quantity</span>
                  <span className="font-medium text-gray-900">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              </div>

              {/* Cost */}
              {item.cost && (
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cost</span>
                    <span className="font-medium text-gray-900">${item.cost.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Expiry */}
              {item.expiry_date && (
                <div className="mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExpiryColor(expiryStatus)}`}>
                    {getExpiryText(item.expiry_date)}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded text-sm hover:bg-gray-200 transition-colors">
                  Edit
                </button>
                <button className="flex-1 bg-red-100 text-red-700 py-2 rounded text-sm hover:bg-red-200 transition-colors">
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍸</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ingredients found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or add some ingredients to get started</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add Your First Ingredient
          </button>
        </div>
      )}

      {/* Add Form Modal (placeholder) */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Ingredient</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🚧</div>
              <p className="text-gray-600">Ingredient management form coming soon!</p>
              <p className="text-sm text-gray-500 mt-2">This will allow you to add and track your bar inventory.</p>
            </div>

            <button
              onClick={() => setShowAddForm(false)}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
