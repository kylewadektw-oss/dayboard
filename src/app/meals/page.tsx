"use client";

import { useState, useEffect } from 'react';

interface Recipe {
  id: string;
  title: string;
  image?: string;
  category: string;
  area?: string;
  instructions?: string;
  ingredients: string[];
  measurements: string[];
  favorite: boolean;
}

interface MealDBRecipe {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  [key: string]: string;
}

export default function MealsPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('library');

  const categories = ['Beef', 'Chicken', 'Dessert', 'Lamb', 'Miscellaneous', 'Pasta', 'Pork', 'Seafood', 'Side', 'Starter', 'Vegan', 'Vegetarian'];
  const areas = ['American', 'British', 'Canadian', 'Chinese', 'Croatian', 'Dutch', 'Egyptian', 'French', 'Greek', 'Indian', 'Irish', 'Italian', 'Jamaican', 'Japanese', 'Kenyan', 'Malaysian', 'Mexican', 'Moroccan', 'Polish', 'Portuguese', 'Russian', 'Spanish', 'Thai', 'Tunisian', 'Turkish', 'Vietnamese'];

  // Meal planning state
  const [weeklyPlan, setWeeklyPlan] = useState<{[key: string]: {breakfast?: Recipe, lunch?: Recipe, dinner?: Recipe}}>({});
  const [mealPrepItems, setMealPrepItems] = useState<Recipe[]>([]);
  const [leftovers, setLeftovers] = useState<{recipe: Recipe, suggestions: string[]}[]>([]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTimes = ['breakfast', 'lunch', 'dinner'] as const;

  // Sample fallback recipes
  const fallbackRecipes: Recipe[] = [
    {
      id: 'fallback-1',
      title: 'Spaghetti Carbonara',
      image: 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg',
      category: 'Pasta',
      area: 'Italian',
      instructions: 'Cook spaghetti according to package directions. In a bowl, whisk together eggs, parmesan, and black pepper. Drain pasta and immediately toss with egg mixture.',
      ingredients: ['Spaghetti', 'Eggs', 'Parmesan cheese', 'Pancetta', 'Black pepper'],
      measurements: ['400g', '4 large', '100g', '150g', 'To taste'],
      favorite: false,
    },
    {
      id: 'fallback-2',
      title: 'Chicken Teriyaki',
      image: 'https://www.themealdb.com/images/media/meals/teriyaki-chicken-casserole.jpg',
      category: 'Chicken',
      area: 'Japanese',
      instructions: 'Marinate chicken in teriyaki sauce. Grill until cooked through. Serve with steamed rice.',
      ingredients: ['Chicken breast', 'Teriyaki sauce', 'Rice', 'Green onions'],
      measurements: ['4 pieces', '1/2 cup', '2 cups', '2 stalks'],
      favorite: true,
    },
    {
      id: 'fallback-3',
      title: 'Beef Stir Fry',
      image: 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg',
      category: 'Beef',
      area: 'Chinese',
      instructions: 'Heat oil in wok. Stir fry beef until browned. Add vegetables and sauce. Cook until vegetables are tender.',
      ingredients: ['Beef strips', 'Mixed vegetables', 'Soy sauce', 'Garlic', 'Ginger'],
      measurements: ['500g', '2 cups', '3 tbsp', '3 cloves', '1 inch piece'],
      favorite: false,
    }
  ];

  useEffect(() => {
    loadRandomRecipes();
  }, []);

  const loadRandomRecipes = async () => {
    setLoading(true);
    try {
      const fetchedRecipes: Recipe[] = [];
      
      // Fetch 8 random recipes
      for (let i = 0; i < 8; i++) {
        try {
          const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
          const data = await response.json();
          
          if (data.meals && data.meals[0]) {
            const meal = data.meals[0];
            const recipe = transformMealDBRecipe(meal);
            fetchedRecipes.push(recipe);
          }
        } catch (err) {
          console.error('Error fetching random recipe:', err);
        }
      }
      
      if (fetchedRecipes.length > 0) {
        setRecipes(fetchedRecipes);
      } else {
        // Use fallback recipes if API fails
        setRecipes(fallbackRecipes);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
      setRecipes(fallbackRecipes);
    } finally {
      setLoading(false);
    }
  };

  const searchRecipes = async () => {
    if (!searchTerm.trim()) {
      loadRandomRecipes();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      
      if (data.meals) {
        const transformedRecipes = data.meals.map(transformMealDBRecipe);
        setRecipes(transformedRecipes);
      } else {
        setRecipes([]);
      }
    } catch (error) {
      console.error('Error searching recipes:', error);
      setRecipes(fallbackRecipes);
    } finally {
      setLoading(false);
    }
  };

  const loadRecipesByCategory = async (category: string) => {
    if (!category) {
      loadRandomRecipes();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
      const data = await response.json();
      
      if (data.meals) {
        // Take first 12 recipes and get their full details
        const limitedMeals = data.meals.slice(0, 12);
        const detailedRecipes = await Promise.all(
          limitedMeals.map(async (meal: any) => {
            try {
              const detailResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
              const detailData = await detailResponse.json();
              return detailData.meals ? transformMealDBRecipe(detailData.meals[0]) : null;
            } catch {
              return null;
            }
          })
        );
        
        const validRecipes = detailedRecipes.filter(recipe => recipe !== null) as Recipe[];
        setRecipes(validRecipes);
      } else {
        setRecipes([]);
      }
    } catch (error) {
      console.error('Error loading category recipes:', error);
      setRecipes(fallbackRecipes);
    } finally {
      setLoading(false);
    }
  };

  const loadRecipesByArea = async (area: string) => {
    if (!area) {
      loadRandomRecipes();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`);
      const data = await response.json();
      
      if (data.meals) {
        const limitedMeals = data.meals.slice(0, 12);
        const detailedRecipes = await Promise.all(
          limitedMeals.map(async (meal: any) => {
            try {
              const detailResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
              const detailData = await detailResponse.json();
              return detailData.meals ? transformMealDBRecipe(detailData.meals[0]) : null;
            } catch {
              return null;
            }
          })
        );
        
        const validRecipes = detailedRecipes.filter(recipe => recipe !== null) as Recipe[];
        setRecipes(validRecipes);
      } else {
        setRecipes([]);
      }
    } catch (error) {
      console.error('Error loading area recipes:', error);
      setRecipes(fallbackRecipes);
    } finally {
      setLoading(false);
    }
  };

  const transformMealDBRecipe = (meal: MealDBRecipe): Recipe => {
    const ingredients = [];
    const measurements = [];
    
    // Extract ingredients and measurements (API provides up to 20)
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measurement = meal[`strMeasure${i}`];
      
      if (ingredient && ingredient.trim()) {
        ingredients.push(ingredient.trim());
        measurements.push(measurement ? measurement.trim() : '');
      }
    }

    return {
      id: meal.idMeal,
      title: meal.strMeal,
      image: meal.strMealThumb,
      category: meal.strCategory,
      area: meal.strArea,
      instructions: meal.strInstructions,
      ingredients,
      measurements,
      favorite: false,
    };
  };

  const toggleFavorite = (recipeId: string) => {
    setRecipes(prev => 
      prev.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, favorite: !recipe.favorite }
          : recipe
      )
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchRecipes();
  };

  const favoriteRecipes = recipes.filter(recipe => recipe.favorite);

  // Helper functions for meal planning
  const addToWeeklyPlan = (day: string, mealTime: string, recipe: Recipe) => {
    setWeeklyPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealTime]: recipe
      }
    }));
  };

  const removeFromWeeklyPlan = (day: string, mealTime: string) => {
    setWeeklyPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealTime]: undefined
      }
    }));
  };

  const addToMealPrep = (recipe: Recipe) => {
    if (!mealPrepItems.find(item => item.id === recipe.id)) {
      setMealPrepItems(prev => [...prev, recipe]);
    }
  };

  const generateLeftoverSuggestions = (recipe: Recipe): string[] => {
    const suggestions: {[key: string]: string[]} = {
      'Chicken': ['Chicken salad sandwich', 'Chicken fried rice', 'Chicken quesadilla', 'Chicken soup'],
      'Beef': ['Beef tacos', 'Beef stir fry', 'Beef sandwich', 'Beef and rice bowl'],
      'Pasta': ['Pasta salad', 'Baked pasta casserole', 'Pasta soup'],
      'Rice': ['Fried rice', 'Rice pudding', 'Rice salad', 'Stuffed peppers'],
    };
    
    const category = recipe.category;
    return suggestions[category] || ['Use in stir fry', 'Make into sandwich', 'Add to salad', 'Use in soup'];
  };

  const addToLeftovers = (recipe: Recipe) => {
    const suggestions = generateLeftoverSuggestions(recipe);
    setLeftovers(prev => [...prev, { recipe, suggestions }]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🍽️ Meal Planning</h1>
            <p className="text-gray-600 mt-2">Plan, discover, and organize your family meals</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'favorites', name: 'Meal Favorites', icon: '❤️' },
                { id: 'weekly', name: "This Week's Plan", icon: '📅' },
                { id: 'library', name: 'Recipe Library', icon: '📚' },
                { id: 'mealprep', name: 'Meal Prep', icon: '🥡' },
                { id: 'leftovers', name: 'Leftovers & Reuse', icon: '♻️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon} {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'favorites' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">❤️ Your Favorite Meals</h2>
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  {favoriteRecipes.length} favorites
                </span>
              </div>
              <p className="text-gray-600 mb-6">Quick access to your household's favorite recipes for easy meal planning.</p>
              
              {favoriteRecipes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💝</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                  <p className="text-gray-500 mb-4">Start adding recipes to your favorites from the Recipe Library</p>
                  <button
                    onClick={() => setActiveTab('library')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse Recipe Library
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favoriteRecipes.map((recipe) => (
                    <div key={recipe.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 line-clamp-2">{recipe.title}</h3>
                        <span className="text-red-500 text-lg">❤️</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">{recipe.category}</span>
                        {recipe.area && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{recipe.area}</span>}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedRecipe(recipe)}
                          className="flex-1 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                        >
                          View Recipe
                        </button>
                        <div className="relative group">
                          <button className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors">
                            Add to Plan
                          </button>
                          <div className="absolute bottom-full left-0 mb-2 w-48 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            Go to This Week's Plan to add to schedule
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'weekly' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📅 This Week's Meal Plan</h2>
              <p className="text-gray-600 mb-6">Plan your meals for the entire week. Drag favorites or add new recipes to each meal slot.</p>
              
              <div className="overflow-x-auto">
                <div className="grid grid-cols-7 gap-4 min-w-full">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="bg-gray-50 rounded-lg p-4 min-w-[200px]">
                      <h3 className="font-medium text-gray-900 mb-3 text-center">{day}</h3>
                      <div className="space-y-3">
                        {mealTimes.map((mealTime) => (
                          <div key={mealTime} className="bg-white rounded border border-gray-200 p-2">
                            <div className="text-xs font-medium text-gray-500 mb-1 capitalize">{mealTime}</div>
                            {weeklyPlan[day]?.[mealTime] ? (
                              <div className="group">
                                <div className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                                  {weeklyPlan[day][mealTime]!.title}
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => setSelectedRecipe(weeklyPlan[day][mealTime]!)}
                                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => removeFromWeeklyPlan(day, mealTime)}
                                    className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-2">
                                <button
                                  onClick={() => setActiveTab('favorites')}
                                  className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                  + Add meal
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Go to Meal Favorites to quickly add your starred recipes to the weekly plan, or browse the Recipe Library for new meal ideas.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="space-y-6">
            {/* API Status */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <span className="text-lg">✅</span>
                <p className="text-sm">
                  <strong>Connected to TheMealDB API</strong> - Browse thousands of recipes from around the world
                </p>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={loadRandomRecipes}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? '🔄 Loading...' : '🎲 Random Recipes'}
              </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for recipes... (e.g., 'chicken', 'pasta', 'curry')"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    🔍 Search
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedArea('');
                      loadRecipesByCategory(e.target.value);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Cuisine</label>
                  <select
                    value={selectedArea}
                    onChange={(e) => {
                      setSelectedArea(e.target.value);
                      setSelectedCategory('');
                      loadRecipesByArea(e.target.value);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Cuisines</option>
                    {areas.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">📚</span>
                    <span className="text-gray-600">Total Recipes: {recipes.length}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">❤️</span>
                    <span className="text-gray-600">Favorites: {favoriteRecipes.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading delicious recipes...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && recipes.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No recipes found</h3>
                <p className="text-gray-500 mb-6">Try searching for something else or browse random recipes</p>
                <button
                  onClick={loadRandomRecipes}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🎲 Load Random Recipes
                </button>
              </div>
            )}

            {/* Recipes Grid */}
            {!loading && recipes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recipes.map((recipe) => (
                  <div key={recipe.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img 
                        src={recipe.image || '/placeholder-recipe.jpg'} 
                        alt={recipe.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-recipe.jpg';
                        }}
                      />
                      <button
                        onClick={() => toggleFavorite(recipe.id)}
                        className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
                          recipe.favorite 
                            ? 'bg-red-500 text-white' 
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {recipe.favorite ? '❤️' : '🤍'}
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{recipe.title}</h3>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {recipe.category}
                        </span>
                        {recipe.area && (
                          <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {recipe.area}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedRecipe(recipe)}
                          className="flex-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                        >
                          View Recipe
                        </button>
                        <button
                          onClick={() => addToMealPrep(recipe)}
                          className="text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200 transition-colors"
                        >
                          Meal Prep
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'mealprep' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">🥡 Meal Prep Recipes</h2>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  {mealPrepItems.length} items
                </span>
              </div>
              <p className="text-gray-600 mb-6">Batch-cooking recipes perfect for meal prepping. Cook once, eat multiple times!</p>
              
              {mealPrepItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🥡</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No meal prep items yet</h3>
                  <p className="text-gray-500 mb-4">Add recipes from the Recipe Library that are great for batch cooking</p>
                  <button
                    onClick={() => setActiveTab('library')}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Browse Recipes
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mealPrepItems.map((recipe) => (
                    <div key={recipe.id} className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{recipe.title}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">{recipe.category}</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Meal Prep</span>
                      </div>
                      <div className="space-y-2 mb-3">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Best for:</span> Batch cooking, freezer meals
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Storage:</span> 3-4 days fridge, 3 months freezer
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedRecipe(recipe)}
                          className="flex-1 text-sm bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 transition-colors"
                        >
                          View Recipe
                        </button>
                        <button
                          onClick={() => addToLeftovers(recipe)}
                          className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                        >
                          Leftovers
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'leftovers' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">♻️ Leftovers & Reuse Ideas</h2>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {leftovers.length} items
                </span>
              </div>
              <p className="text-gray-600 mb-6">Transform your leftovers into exciting new meals and reduce food waste.</p>
              
              {leftovers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">♻️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No leftover items yet</h3>
                  <p className="text-gray-500 mb-4">Add recipes from Meal Prep to get creative leftover suggestions</p>
                  <button
                    onClick={() => setActiveTab('mealprep')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    View Meal Prep
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {leftovers.map((item, index) => (
                    <div key={index} className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{item.recipe.title}</h3>
                          <span className="text-sm text-green-700 bg-green-100 px-2 py-1 rounded mt-1 inline-block">
                            {item.recipe.category} Leftovers
                          </span>
                        </div>
                        <button
                          onClick={() => setLeftovers(prev => prev.filter((_, i) => i !== index))}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">💡 Reuse Ideas:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.suggestions.map((suggestion, suggestionIndex) => (
                            <div
                              key={suggestionIndex}
                              className="text-sm bg-white p-2 rounded border border-green-100"
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedRecipe(item.recipe)}
                        className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                      >
                        View Original Recipe
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedRecipe.title}</h2>
                  <div className="flex gap-2">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {selectedRecipe.category}
                    </span>
                    {selectedRecipe.area && (
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {selectedRecipe.area}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img 
                    src={selectedRecipe.image || '/placeholder-recipe.jpg'} 
                    alt={selectedRecipe.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ingredients</h3>
                    <button
                      onClick={() => toggleFavorite(selectedRecipe.id)}
                      className={`p-2 rounded-full transition-colors ${
                        selectedRecipe.favorite 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {selectedRecipe.favorite ? '❤️' : '🤍'}
                    </button>
                  </div>
                  <ul className="space-y-1">
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="text-gray-700">
                        <span className="font-medium">{selectedRecipe.measurements[index]}</span> {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Instructions</h3>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {selectedRecipe.instructions}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
