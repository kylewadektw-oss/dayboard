/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 *
 * Copyright (c) 2025 Kyle Wade (kyle.wade.ktw@gmail.com)
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Search,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  RefreshCw
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';

interface Recipe {
  id: string;
  external_id: string;
  title: string;
  description?: string;
  image_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_review';
  created_at: string;
  servings?: number;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  cuisine?: string;
  diet_types?: string[];
  tags?: string[];
}

interface SearchState {
  query: string;
  loading: boolean;
  results: unknown[];
  selectedRecipes: Set<string>;
}

export default function RecipeManagementDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'search' | 'queue' | 'approved'>(
    'search'
  );
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    loading: false,
    results: [],
    selectedRecipes: new Set()
  });
  const [queueRecipes, setQueueRecipes] = useState<Recipe[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  // Load queue recipes and stats
  useEffect(() => {
    loadQueueRecipes();
    loadStats();
  }, []);

  const loadQueueRecipes = async () => {
    try {
      const response = await fetch('/api/recipes/queue');
      if (response.ok) {
        const data = await response.json();
        setQueueRecipes(data);
      }
    } catch (error) {
      console.error('Failed to load queue recipes:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/recipes/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const searchRecipes = async () => {
    if (!searchState.query.trim()) return;

    setSearchState((prev) => ({ ...prev, loading: true, results: [] }));

    try {
      const response = await fetch(
        `/api/spoonacular?query=${encodeURIComponent(searchState.query)}&number=12`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchState((prev) => ({
          ...prev,
          loading: false,
          results: data.results || []
        }));
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchState((prev) => ({ ...prev, loading: false }));
    }
  };

  const importSelectedRecipes = async () => {
    const selectedIds = Array.from(searchState.selectedRecipes);
    if (selectedIds.length === 0) return;

    try {
      const response = await fetch('/api/recipes/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeIds: selectedIds,
          userId: user?.id
        })
      });

      if (response.ok) {
        setSearchState((prev) => ({ ...prev, selectedRecipes: new Set() }));
        loadQueueRecipes();
        loadStats();
      }
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const updateRecipeStatus = async (
    recipeId: string,
    status: Recipe['status']
  ) => {
    try {
      const response = await fetch('/api/recipes/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId, status })
      });

      if (response.ok) {
        loadQueueRecipes();
        loadStats();
      }
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const getStatusBadge = (status: Recipe['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      needs_review: 'bg-blue-100 text-blue-800'
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-0">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Database className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Recipes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-0">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pending}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-0">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.approved}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-0">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 rounded-xl">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.rejected}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border-0">
        <div className="flex space-x-4">
          {[
            { id: 'search', label: 'Search & Import', icon: Search },
            { id: 'queue', label: 'Approval Queue', icon: Clock },
            { id: 'approved', label: 'Approved Recipes', icon: CheckCircle }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() =>
                setActiveTab(id as 'search' | 'queue' | 'approved')
              }
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                activeTab === id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
        {activeTab === 'search' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Search Spoonacular Recipes
              </h3>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search for recipes (e.g., 'chicken pasta', 'vegan desserts')"
                    value={searchState.query}
                    onChange={(value: string) =>
                      setSearchState((prev) => ({ ...prev, query: value }))
                    }
                    onKeyPress={(e: React.KeyboardEvent) =>
                      e.key === 'Enter' && searchRecipes()
                    }
                  />
                </div>
                <Button
                  onClick={searchRecipes}
                  disabled={searchState.loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl"
                >
                  {searchState.loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {searchState.selectedRecipes.size > 0 && (
              <div className="mb-4 p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-800">
                    {searchState.selectedRecipes.size} recipes selected
                  </span>
                  <Button
                    onClick={importSelectedRecipes}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Import Selected</span>
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchState.results.map((recipe) => {
                const r = recipe as Recipe & {
                  image?: string;
                  readyInMinutes?: number;
                };
                return (
                  <div
                    key={r.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      searchState.selectedRecipes.has(r.id.toString())
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => {
                      const newSelected = new Set(searchState.selectedRecipes);
                      const id = r.id.toString();
                      if (newSelected.has(id)) {
                        newSelected.delete(id);
                      } else {
                        newSelected.add(id);
                      }
                      setSearchState((prev) => ({
                        ...prev,
                        selectedRecipes: newSelected
                      }));
                    }}
                  >
                    {r.image && (
                      <Image
                        src={r.image}
                        alt={r.title}
                        width={300}
                        height={200}
                        className="w-full h-32 object-cover rounded mb-3"
                      />
                    )}
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {r.title}
                    </h4>
                    <div className="flex justify-between text-sm text-gray-600">
                      {r.readyInMinutes && <span>{r.readyInMinutes} min</span>}
                      {r.servings && <span>{r.servings} servings</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Pending Approval
            </h3>
            <div className="space-y-4">
              {queueRecipes
                .filter((r) => r.status === 'pending')
                .map((recipe) => (
                  <div
                    key={recipe.id}
                    className="p-4 border border-gray-200 rounded-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {recipe.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {recipe.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          {getStatusBadge(recipe.status)}
                          {recipe.cuisine && (
                            <span className="text-xs text-gray-500">
                              {recipe.cuisine}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() =>
                            updateRecipeStatus(recipe.id, 'approved')
                          }
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() =>
                            updateRecipeStatus(recipe.id, 'rejected')
                          }
                          className="bg-white border border-red-300 text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg text-sm"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'approved' && (
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Approved Recipes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {queueRecipes
                .filter((r) => r.status === 'approved')
                .map((recipe) => (
                  <div
                    key={recipe.id}
                    className="p-4 border border-gray-200 rounded-xl"
                  >
                    {recipe.image_url && (
                      <Image
                        src={recipe.image_url}
                        alt={recipe.title}
                        width={300}
                        height={128}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {recipe.title}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {recipe.prep_time_minutes && (
                        <span>{recipe.prep_time_minutes} min prep</span>
                      )}
                      {recipe.servings && (
                        <span>{recipe.servings} servings</span>
                      )}
                    </div>
                    <div className="mt-2">{getStatusBadge(recipe.status)}</div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
