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
import {
  Plus,
  Search,
  Wine,
  Camera,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
// Unused imports commented out to fix build errors:
// import { Coffee, Martini, TrendingUp, Package } from 'lucide-react';
import { CocktailInventoryItem } from '@/types/cocktails';

// 🍸 Comprehensive Liquor Inventory Mock Data
// Demonstrates barcode scanning capabilities and professional bar management
const MOCK_INVENTORY: CocktailInventoryItem[] = [
  // Premium Spirits & Liquors
  {
    id: '1',
    household_id: 'household-1',
    ingredient_name: 'Grey Goose Vodka',
    quantity: 680,
    unit: 'ml',
    location: 'bar',
    brand: 'Grey Goose',
    cost: 49.99,
    barcode: '0089540104058',
    alcohol_content: 40.0,
    bottle_size: 750,
    fill_percentage: 91,
    purchase_date: '2025-01-15',
    location_details: 'Top shelf, main bar cabinet',
    created_at: '2025-01-15',
    updated_at: '2025-01-24'
  },
  {
    id: '2',
    household_id: 'household-1',
    ingredient_name: 'Bacardi Superior Rum',
    quantity: 425,
    unit: 'ml',
    location: 'bar',
    brand: 'Bacardi',
    cost: 24.99,
    barcode: '0080480000059',
    alcohol_content: 40.0,
    bottle_size: 750,
    fill_percentage: 57,
    expiry_date: '2028-12-31',
    purchase_date: '2024-12-10',
    location_details: 'Middle shelf, left side',
    created_at: '2024-12-10',
    updated_at: '2025-01-20'
  },
  {
    id: '3',
    household_id: 'household-1',
    ingredient_name: 'Tanqueray London Dry Gin',
    quantity: 1000,
    unit: 'ml',
    location: 'bar',
    brand: 'Tanqueray',
    cost: 34.99,
    barcode: '0088110140021',
    alcohol_content: 47.3,
    bottle_size: 1000,
    fill_percentage: 100,
    expiry_date: '2030-06-15',
    purchase_date: '2025-01-20',
    location_details: 'Top shelf, center position',
    created_at: '2025-01-20',
    updated_at: '2025-01-20'
  },
  {
    id: '4',
    household_id: 'household-1',
    ingredient_name: 'Bulleit Bourbon Whiskey',
    quantity: 320,
    unit: 'ml',
    location: 'bar',
    brand: 'Bulleit',
    cost: 28.99,
    barcode: '0087000007086',
    alcohol_content: 45.0,
    bottle_size: 750,
    fill_percentage: 43,
    purchase_date: '2024-11-30',
    location_details: 'Middle shelf, whiskey section',
    created_at: '2024-11-30',
    updated_at: '2025-01-22'
  },
  {
    id: '5',
    household_id: 'household-1',
    ingredient_name: 'Jose Cuervo Silver Tequila',
    quantity: 580,
    unit: 'ml',
    location: 'bar',
    brand: 'Jose Cuervo',
    cost: 22.99,
    barcode: '0084279007571',
    alcohol_content: 40.0,
    bottle_size: 750,
    fill_percentage: 77,
    purchase_date: '2025-01-05',
    location_details: 'Bottom shelf, tequila section',
    created_at: '2025-01-05',
    updated_at: '2025-01-18'
  },

  // Liqueurs & Specialty Spirits
  {
    id: '6',
    household_id: 'household-1',
    ingredient_name: 'Cointreau Triple Sec',
    quantity: 180,
    unit: 'ml',
    location: 'bar',
    brand: 'Cointreau',
    cost: 39.99,
    barcode: '3035540001061',
    alcohol_content: 40.0,
    bottle_size: 350,
    fill_percentage: 51,
    purchase_date: '2024-10-15',
    location_details: 'Liqueur cabinet, top shelf',
    created_at: '2024-10-15',
    updated_at: '2025-01-19'
  },
  {
    id: '7',
    household_id: 'household-1',
    ingredient_name: 'Kahlua Coffee Liqueur',
    quantity: 420,
    unit: 'ml',
    location: 'bar',
    brand: 'Kahlua',
    cost: 24.99,
    barcode: '0089540104751',
    alcohol_content: 20.0,
    bottle_size: 750,
    fill_percentage: 56,
    expiry_date: '2027-08-30',
    purchase_date: '2024-09-20',
    location_details: 'Liqueur cabinet, middle shelf',
    created_at: '2024-09-20',
    updated_at: '2025-01-17'
  },
  {
    id: '8',
    household_id: 'household-1',
    ingredient_name: 'Baileys Irish Cream',
    quantity: 290,
    unit: 'ml',
    location: 'fridge',
    brand: 'Baileys',
    cost: 29.99,
    barcode: '5011013011036',
    alcohol_content: 17.0,
    bottle_size: 750,
    fill_percentage: 39,
    expiry_date: '2025-12-15',
    purchase_date: '2024-12-01',
    location_details: 'Refrigerator door, top shelf',
    created_at: '2024-12-01',
    updated_at: '2025-01-23'
  },

  // Wine & Champagne
  {
    id: '9',
    household_id: 'household-1',
    ingredient_name: 'Prosecco di Valdobbiadene',
    quantity: 1,
    unit: 'bottle',
    location: 'wine_fridge',
    brand: 'La Marca',
    cost: 14.99,
    barcode: '8033993581616',
    alcohol_content: 11.0,
    bottle_size: 750,
    fill_percentage: 100,
    expiry_date: '2026-06-30',
    purchase_date: '2025-01-10',
    location_details: 'Wine fridge, sparkling section',
    created_at: '2025-01-10',
    updated_at: '2025-01-10'
  },
  {
    id: '10',
    household_id: 'household-1',
    ingredient_name: 'Dry Vermouth',
    quantity: 680,
    unit: 'ml',
    location: 'fridge',
    brand: 'Dolin',
    cost: 18.99,
    barcode: '3760134830057',
    alcohol_content: 17.5,
    bottle_size: 750,
    fill_percentage: 91,
    expiry_date: '2025-08-15',
    purchase_date: '2024-11-20',
    location_details: 'Refrigerator, vermouth section',
    created_at: '2024-11-20',
    updated_at: '2025-01-21'
  },

  // Mixers & Non-Alcoholic Ingredients
  {
    id: '11',
    household_id: 'household-1',
    ingredient_name: 'Fresh Lime Juice',
    quantity: 180,
    unit: 'ml',
    location: 'fridge',
    brand: 'Freshly Squeezed',
    cost: 0.0, // Homemade
    bottle_size: 250,
    fill_percentage: 72,
    expiry_date: '2025-01-28',
    purchase_date: '2025-01-25',
    location_details: 'Refrigerator, fresh juice section',
    created_at: '2025-01-25',
    updated_at: '2025-01-25'
  },
  {
    id: '12',
    household_id: 'household-1',
    ingredient_name: 'Simple Syrup',
    quantity: 350,
    unit: 'ml',
    location: 'pantry',
    brand: 'Homemade',
    cost: 2.5,
    bottle_size: 500,
    fill_percentage: 70,
    expiry_date: '2025-02-25',
    purchase_date: '2025-01-15',
    location_details: 'Pantry, syrup shelf',
    created_at: '2025-01-15',
    updated_at: '2025-01-23'
  },
  {
    id: '13',
    household_id: 'household-1',
    ingredient_name: 'Fever-Tree Tonic Water',
    quantity: 4,
    unit: 'bottles',
    location: 'fridge',
    brand: 'Fever-Tree',
    cost: 7.99,
    barcode: '0851261002036',
    bottle_size: 200,
    fill_percentage: 100,
    expiry_date: '2025-11-30',
    purchase_date: '2025-01-12',
    location_details: 'Refrigerator, mixer section',
    created_at: '2025-01-12',
    updated_at: '2025-01-22'
  },
  {
    id: '14',
    household_id: 'household-1',
    ingredient_name: 'Club Soda',
    quantity: 8,
    unit: 'cans',
    location: 'pantry',
    brand: 'Canada Dry',
    cost: 4.99,
    barcode: '0078000082616',
    bottle_size: 355,
    fill_percentage: 100,
    expiry_date: '2025-07-15',
    purchase_date: '2025-01-08',
    location_details: 'Pantry, beverage storage',
    created_at: '2025-01-08',
    updated_at: '2025-01-08'
  },
  {
    id: '15',
    household_id: 'household-1',
    ingredient_name: 'Angostura Bitters',
    quantity: 95,
    unit: 'ml',
    location: 'bar',
    brand: 'Angostura',
    cost: 8.99,
    barcode: '0075496000064',
    alcohol_content: 44.7,
    bottle_size: 118,
    fill_percentage: 81,
    purchase_date: '2024-08-15',
    location_details: 'Bar cabinet, bitters collection',
    created_at: '2024-08-15',
    updated_at: '2025-01-20'
  },

  // Garnishes & Fresh Ingredients
  {
    id: '16',
    household_id: 'household-1',
    ingredient_name: 'Maraschino Cherries',
    quantity: 18,
    unit: 'pieces',
    location: 'fridge',
    brand: 'Luxardo',
    cost: 19.99,
    barcode: '8005030011009',
    bottle_size: 400,
    fill_percentage: 45,
    expiry_date: '2025-12-31',
    purchase_date: '2024-11-10',
    location_details: 'Refrigerator, garnish section',
    created_at: '2024-11-10',
    updated_at: '2025-01-24'
  },
  {
    id: '17',
    household_id: 'household-1',
    ingredient_name: 'Orange Bitters',
    quantity: 110,
    unit: 'ml',
    location: 'bar',
    brand: "Regan's",
    cost: 12.99,
    barcode: '0851261000025',
    alcohol_content: 45.0,
    bottle_size: 148,
    fill_percentage: 74,
    purchase_date: '2024-10-05',
    location_details: 'Bar cabinet, bitters collection',
    created_at: '2024-10-05',
    updated_at: '2025-01-19'
  },
  {
    id: '18',
    household_id: 'household-1',
    ingredient_name: 'Grenadine Syrup',
    quantity: 240,
    unit: 'ml',
    location: 'fridge',
    brand: "Rose's",
    cost: 4.99,
    barcode: '0041570051207',
    bottle_size: 354,
    fill_percentage: 68,
    expiry_date: '2025-09-30',
    purchase_date: '2024-12-15',
    location_details: 'Refrigerator, syrup section',
    created_at: '2024-12-15',
    updated_at: '2025-01-21'
  }
];

const LOCATION_ICONS = {
  bar: '🍷',
  fridge: '❄️',
  pantry: '🥫',
  wine_fridge: '🍾'
};

const LOCATION_COLORS = {
  bar: 'bg-purple-100 text-purple-800',
  fridge: 'bg-blue-100 text-blue-800',
  pantry: 'bg-yellow-100 text-yellow-800',
  wine_fridge: 'bg-indigo-100 text-indigo-800'
};

export function CocktailInventory() {
  const [inventory] = useState<CocktailInventoryItem[]>(MOCK_INVENTORY);
  // Unused setter commented out to fix build errors:
  // const [inventory, setInventory] = useState<CocktailInventoryItem[]>(MOCK_INVENTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [sortBy, setSortBy] = useState<
    'name' | 'quantity' | 'cost' | 'expiry' | 'fill_percentage'
  >('name');
  const [showLowStock, setShowLowStock] = useState(false);

  const filteredInventory = inventory
    .filter((item) => {
      const matchesSearch =
        item.ingredient_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation =
        selectedLocation === 'all' || item.location === selectedLocation;
      const isLowStock = showLowStock
        ? item.fill_percentage && item.fill_percentage < 25
        : true;

      return matchesSearch && matchesLocation && isLowStock;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.ingredient_name.localeCompare(b.ingredient_name);
        case 'quantity':
          return (b.quantity || 0) - (a.quantity || 0);
        case 'cost':
          return (b.cost || 0) - (a.cost || 0);
        case 'fill_percentage':
          return (b.fill_percentage || 100) - (a.fill_percentage || 100);
        case 'expiry':
          if (!a.expiry_date && !b.expiry_date) return 0;
          if (!a.expiry_date) return 1;
          if (!b.expiry_date) return -1;
          return (
            new Date(a.expiry_date).getTime() -
            new Date(b.expiry_date).getTime()
          );
        default:
          return 0;
      }
    });

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return 'none';

    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 7) return 'warning';
    if (daysUntilExpiry <= 30) return 'caution';
    return 'good';
  };

  const getExpiryColor = (status: string) => {
    switch (status) {
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-orange-100 text-orange-800';
      case 'caution':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getExpiryText = (expiryDate?: string) => {
    if (!expiryDate) return '';

    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0)
      return `Expired ${Math.abs(daysUntilExpiry)} days ago`;
    if (daysUntilExpiry === 0) return 'Expires today';
    if (daysUntilExpiry === 1) return 'Expires tomorrow';
    return `Expires in ${daysUntilExpiry} days`;
  };

  const totalValue = inventory.reduce((sum, item) => sum + (item.cost || 0), 0);
  const lowStockItems = inventory.filter(
    (item) => item.fill_percentage && item.fill_percentage < 25
  );
  const expiringItems = inventory.filter((item) => {
    const expiry = getExpiryStatus(item.expiry_date);
    return expiry === 'warning' || expiry === 'expired';
  });
  const uniqueLocations = Array.from(
    new Set(inventory.map((item) => item.location).filter(Boolean))
  ).length;
  const averageFillLevel =
    inventory.reduce((sum, item) => sum + (item.fill_percentage || 100), 0) /
    inventory.length;
  const premiumItems = inventory.filter((item) => item.cost && item.cost > 30);
  const totalBottles = inventory.filter(
    (item) => item.unit === 'ml' || item.unit === 'bottle'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            🍸 Cocktail Inventory
          </h2>
          <p className="text-gray-600 mt-1">
            Manage your household bar ingredients and supplies
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center hover:from-purple-700 hover:to-indigo-700 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Ingredient
        </button>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Wine className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-xl font-semibold text-gray-900">
                {inventory.length}
              </p>
              <p className="text-xs text-gray-500">{totalBottles} bottles</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-lg">💰</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-xl font-semibold text-gray-900">
                ${totalValue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                {premiumItems.length} premium items
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-xl font-semibold text-gray-900">
                {lowStockItems.length}
              </p>
              <p className="text-xs text-gray-500">
                {expiringItems.length} expiring soon
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Avg. Fill Level</p>
              <p className="text-xl font-semibold text-gray-900">
                {averageFillLevel.toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500">
                {uniqueLocations} locations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Barcode Scanning & Quick Actions */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <Camera className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Quick Add with Barcode Scanning
              </h3>
              <p className="text-sm text-gray-600">
                Scan product barcodes to instantly add items to your inventory
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowBarcodeScanner(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center"
          >
            <Camera className="h-4 w-4 mr-2" />
            Scan Barcode
          </button>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ingredients, brands, or barcodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as
                  | 'name'
                  | 'quantity'
                  | 'cost'
                  | 'fill_percentage'
                  | 'expiry'
              )
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
          >
            <option value="name">Sort by Name</option>
            <option value="quantity">Sort by Quantity</option>
            <option value="cost">Sort by Cost</option>
            <option value="fill_percentage">Sort by Fill Level</option>
            <option value="expiry">Sort by Expiry</option>
          </select>
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
            All Locations ({inventory.length})
          </button>
          {Object.entries(LOCATION_ICONS).map(([location, icon]) => {
            const count = inventory.filter(
              (item) => item.location === location
            ).length;
            return (
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
                {location.charAt(0).toUpperCase() +
                  location.slice(1).replace('_', ' ')}{' '}
                ({count})
              </button>
            );
          })}
          <button
            onClick={() => setShowLowStock(!showLowStock)}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showLowStock
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-600 hover:bg-orange-50'
            }`}
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            Low Stock Only ({lowStockItems.length})
          </button>
        </div>
      </div>

      {/* Enhanced Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInventory.map((item) => {
          const expiryStatus = getExpiryStatus(item.expiry_date);
          const fillLevel = item.fill_percentage || 100;
          const isLowStock = fillLevel < 25;
          const isVeryLowStock = fillLevel < 10;

          return (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              {/* Header with fill level indicator */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    {item.ingredient_name}
                    {isVeryLowStock && (
                      <span className="ml-2 text-red-500">🚨</span>
                    )}
                    {isLowStock && !isVeryLowStock && (
                      <span className="ml-2 text-orange-500">⚠️</span>
                    )}
                  </h3>
                  {item.brand && (
                    <p className="text-sm text-gray-600">{item.brand}</p>
                  )}
                  {item.barcode && (
                    <p className="text-xs text-gray-400 font-mono">
                      #{item.barcode}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${LOCATION_COLORS[item.location as keyof typeof LOCATION_COLORS]}`}
                  >
                    {
                      LOCATION_ICONS[
                        item.location as keyof typeof LOCATION_ICONS
                      ]
                    }{' '}
                    {item.location?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Fill Level Progress Bar */}
              {item.fill_percentage !== undefined && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Fill Level</span>
                    <span
                      className={`font-medium ${isVeryLowStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-green-600'}`}
                    >
                      {fillLevel}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isVeryLowStock
                          ? 'bg-red-500'
                          : isLowStock
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${fillLevel}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Quantity and Details */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Quantity</span>
                  <span className="font-medium text-gray-900">
                    {item.quantity} {item.unit}
                    {item.bottle_size && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({item.bottle_size}ml bottle)
                      </span>
                    )}
                  </span>
                </div>

                {item.alcohol_content && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ABV</span>
                    <span className="font-medium text-gray-900">
                      {item.alcohol_content}%
                    </span>
                  </div>
                )}

                {item.cost && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cost</span>
                    <span className="font-medium text-gray-900">
                      ${item.cost.toFixed(2)}
                    </span>
                  </div>
                )}

                {item.purchase_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Purchased</span>
                    <span className="text-sm text-gray-900">
                      {new Date(item.purchase_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {item.location_details && (
                  <div className="text-xs text-gray-500 italic">
                    📍 {item.location_details}
                  </div>
                )}
              </div>

              {/* Expiry Status */}
              {item.expiry_date && (
                <div className="mb-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getExpiryColor(expiryStatus)}`}
                  >
                    {getExpiryText(item.expiry_date)}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button className="flex-1 bg-blue-100 text-blue-700 py-2 rounded text-sm hover:bg-blue-200 transition-colors font-medium">
                  📱 Scan Update
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded text-sm hover:bg-gray-200 transition-colors">
                  Edit
                </button>
                <button className="px-3 bg-red-100 text-red-700 py-2 rounded text-sm hover:bg-red-200 transition-colors">
                  🗑️
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No ingredients found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search or add some ingredients to get started
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add Your First Ingredient
          </button>
        </div>
      )}

      {/* Enhanced Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Add Ingredient
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="text-center py-8">
              <div className="text-4xl mb-4">🚧</div>
              <p className="text-gray-600">
                Manual ingredient entry form coming soon!
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Use the barcode scanner for quick additions.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setShowBarcodeScanner(true);
                }}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <Camera className="h-4 w-4 mr-2" />
                Scan Barcode Instead
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                Barcode Scanner
              </h3>
              <button
                onClick={() => setShowBarcodeScanner(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Scanner Interface Demo */}
            <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 mb-4">
              <div className="text-center">
                <div className="text-6xl mb-4">📷</div>
                <div className="animate-pulse">
                  <div className="h-2 bg-purple-200 rounded-full w-full mb-2"></div>
                  <div className="h-2 bg-purple-300 rounded-full w-3/4 mx-auto mb-2"></div>
                  <div className="h-2 bg-purple-200 rounded-full w-1/2 mx-auto"></div>
                </div>
                <p className="text-purple-600 font-medium mt-4">
                  Scanning for barcodes...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Point camera at product barcode
                </p>
              </div>
            </div>

            {/* Mock Scan Results */}
            <div className="space-y-3 mb-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-green-800">
                  <span className="text-lg mr-2">✅</span>
                  <div>
                    <p className="font-medium">
                      Last Scan: Hendrick&apos;s Gin
                    </p>
                    <p className="text-sm">Barcode: 083664871555 • $34.99</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center text-blue-800">
                  <span className="text-lg mr-2">📱</span>
                  <div>
                    <p className="font-medium">ZXing-js Scanner Active</p>
                    <p className="text-sm">Auto-lookup via UPCitemdb API</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scanner Features */}
            <div className="text-sm text-gray-600 mb-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Scanner Features:
              </h4>
              <ul className="space-y-1">
                <li>• 📱 Web-based scanning with ZXing-js</li>
                <li>• 🔍 Automatic product lookup</li>
                <li>• 🍾 TTB COLA registry for alcohol verification</li>
                <li>• 💰 Price tracking and comparison</li>
                <li>• 📊 Automatic inventory updates</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                📷 Start Camera
              </button>
              <button
                onClick={() => setShowBarcodeScanner(false)}
                className="px-4 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>

            <div className="mt-3 text-xs text-gray-500 text-center">
              Demo mode - Full barcode scanning coming in v2.0
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
