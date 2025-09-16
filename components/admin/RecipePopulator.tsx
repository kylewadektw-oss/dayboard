'use client';

import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loader2, Search, Plus, ChefHat, Clock, Users } from 'lucide-react';

interface SpoonacularRecipe {
  id: number;
  title: string;
  image?: string;
  readyInMinutes?: number;
  servings?: number;
  aggregateLikes?: number;
  spoonacularScore?: number;
  cuisines?: string[];
  dishTypes?: string[];
  diets?: string[];
  summary?: string;
}

interface SearchResult {
  results: SpoonacularRecipe[];
  totalResults: number;
}

export default function RecipePopulator() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpoonacularRecipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState<Set<number>>(
    new Set()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkQueries, setBulkQueries] = useState('');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [results, setResults] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
    [key: string]: unknown;
  } | null>(null);
  const [activeTab, setActiveTab] = useState('search');

  const popularCategories = [
    'healthy breakfast',
    'quick lunch',
    'dinner main course',
    'vegetarian',
    'vegan',
    'low carb',
    'italian pasta',
    'mexican tacos',
    'asian stir fry',
    'comfort food',
    'dessert',
    'soup'
  ];

  const searchRecipes = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/spoonacular?action=search&query=${encodeURIComponent(searchQuery)}&number=20`
      );
      const data: SearchResult = await response.json();

      if (response.ok) {
        setSearchResults(data.results);
      } else {
        console.error('Search failed:', data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getRandomRecipes = async () => {
    setIsSearching(true);
    try {
      const response = await fetch('/api/spoonacular?action=random&number=10');
      const data = await response.json();

      if (response.ok) {
        setSearchResults(data.recipes);
      } else {
        console.error('Random recipes failed:', data);
      }
    } catch (error) {
      console.error('Random recipes error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleRecipeSelection = (recipeId: number) => {
    const newSelected = new Set(selectedRecipes);
    if (newSelected.has(recipeId)) {
      newSelected.delete(recipeId);
    } else {
      newSelected.add(recipeId);
    }
    setSelectedRecipes(newSelected);
  };

  const submitSelectedRecipes = async () => {
    if (selectedRecipes.size === 0) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/recipes/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_submit',
          recipeIds: Array.from(selectedRecipes)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
        setSelectedRecipes(new Set());
        alert(
          `Successfully submitted ${selectedRecipes.size} recipes to approval queue!`
        );
      } else {
        console.error('Submission failed:', data);
        alert('Failed to submit recipes: ' + data.error);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Error submitting recipes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const bulkPopulateCategories = async () => {
    const queries = bulkQueries.split('\n').filter((q) => q.trim());
    if (queries.length === 0) return;

    setIsBulkProcessing(true);
    try {
      const response = await fetch('/api/spoonacular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_import',
          queries,
          maxResults: 50
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
        alert('Bulk population completed!');
      } else {
        console.error('Bulk population failed:', data);
        alert('Failed to bulk populate: ' + data.error);
      }
    } catch (error) {
      console.error('Bulk population error:', error);
      alert('Error in bulk population');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const populateCategory = async (category: string) => {
    try {
      const response = await fetch('/api/spoonacular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'populate_category',
          category,
          maxResults: 15
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Added ${data.submitted} ${category} recipes to queue!`);
      } else {
        console.error('Category population failed:', data);
        alert('Failed to populate category: ' + data.error);
      }
    } catch (error) {
      console.error('Category population error:', error);
      alert('Error populating category');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Recipe Database Populator</h1>
        <p className="text-gray-600">
          Search and import recipes from Spoonacular API into approval queue
        </p>
      </div>

      {/* Simple tab navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        {[
          { id: 'search', label: 'Manual Search', icon: Search },
          { id: 'categories', label: 'Quick Categories', icon: ChefHat },
          { id: 'bulk', label: 'Bulk Import', icon: Plus }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
              activeTab === id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'search' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recipe Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for recipes (e.g., 'chicken pasta', 'vegan dessert')"
                    value={searchQuery}
                    onChange={setSearchQuery}
                  />
                  <Button onClick={searchRecipes} disabled={isSearching}>
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Search
                  </Button>
                  <Button
                    variant="slim"
                    onClick={getRandomRecipes}
                    disabled={isSearching}
                  >
                    Random
                  </Button>
                </div>

                {selectedRecipes.size > 0 && (
                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                    <span>{selectedRecipes.size} recipes selected</span>
                    <Button
                      onClick={submitSelectedRecipes}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      Submit to Queue
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((recipe) => (
                    <div
                      key={recipe.id}
                      className={`cursor-pointer p-4 border rounded-lg transition-all ${
                        selectedRecipes.has(recipe.id)
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                      onClick={() => toggleRecipeSelection(recipe.id)}
                    >
                      {recipe.image && (
                        <Image
                          src={recipe.image}
                          alt={recipe.title}
                          width={300}
                          height={128}
                          className="w-full h-32 object-cover rounded-md mb-3"
                        />
                      )}
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                        {recipe.title}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                        {recipe.readyInMinutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {recipe.readyInMinutes}m
                          </span>
                        )}
                        {recipe.servings && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {recipe.servings}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {recipe.cuisines?.slice(0, 2).map((cuisine) => (
                          <span
                            key={cuisine}
                            className="px-2 py-1 bg-gray-100 text-xs rounded"
                          >
                            {cuisine}
                          </span>
                        ))}
                        {recipe.dishTypes?.slice(0, 1).map((type) => (
                          <span
                            key={type}
                            className="px-2 py-1 border border-gray-200 text-xs rounded"
                          >
                            {type}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span>
                          Score: {recipe.spoonacularScore?.toFixed(0) || 'N/A'}
                        </span>
                        <span>❤️ {recipe.aggregateLikes || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'categories' && (
        <Card>
          <CardHeader>
            <CardTitle>Popular Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {popularCategories.map((category) => (
                <Button
                  key={category}
                  variant="slim"
                  className="h-auto p-4 text-left justify-start"
                  onClick={() => populateCategory(category)}
                >
                  <div>
                    <div className="font-medium">{category}</div>
                    <div className="text-xs text-gray-500">~15 recipes</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'bulk' && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Import</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter search queries, one per line:&#10;chicken breast recipes&#10;vegetarian pasta&#10;healthy smoothies&#10;chocolate desserts"
                value={bulkQueries}
                onChange={(e) => setBulkQueries(e.target.value)}
                rows={10}
              />
              <Button
                onClick={bulkPopulateCategories}
                disabled={isBulkProcessing || !bulkQueries.trim()}
                className="w-full"
              >
                {isBulkProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Bulk Import Recipes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {results && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Results:</h3>
          <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
