export default function Meals() {
  const recipes = [
    {
      id: 1,
      name: "Chicken Teriyaki",
      description: "Tender chicken with homemade teriyaki sauce",
      time: "30 mins",
      servings: 4,
      image: "🍗",
      ingredients: ["Chicken breast", "Soy sauce", "Brown sugar", "Garlic", "Ginger", "Rice"]
    },
    {
      id: 2,
      name: "Spaghetti Bolognese",
      description: "Classic Italian pasta with rich meat sauce",
      time: "45 mins",
      servings: 6,
      image: "🍝",
      ingredients: ["Ground beef", "Tomato sauce", "Onion", "Garlic", "Spaghetti", "Parmesan"]
    },
    {
      id: 3,
      name: "Fish Tacos",
      description: "Fresh fish with cabbage slaw and lime",
      time: "25 mins",
      servings: 4,
      image: "🌮",
      ingredients: ["White fish", "Tortillas", "Cabbage", "Lime", "Cilantro", "Avocado"]
    },
    {
      id: 4,
      name: "Beef Stir Fry",
      description: "Quick and healthy vegetable stir fry",
      time: "20 mins",
      servings: 4,
      image: "🥩",
      ingredients: ["Beef strips", "Mixed vegetables", "Soy sauce", "Garlic", "Ginger", "Rice"]
    },
    {
      id: 5,
      name: "Veggie Curry",
      description: "Aromatic curry with seasonal vegetables",
      time: "35 mins",
      servings: 5,
      image: "🍛",
      ingredients: ["Mixed vegetables", "Coconut milk", "Curry powder", "Onion", "Garlic", "Rice"]
    },
    {
      id: 6,
      name: "BBQ Chicken Pizza",
      description: "Homemade pizza with BBQ sauce and chicken",
      time: "40 mins",
      servings: 4,
      image: "🍕",
      ingredients: ["Pizza dough", "BBQ sauce", "Chicken", "Mozzarella", "Red onion", "Cilantro"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meal Planning</h1>
          <p className="text-gray-600">Plan your family meals and manage ingredients</p>
        </div>

        {/* Add Recipe Button */}
        <div className="mb-6">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            + Add New Recipe
          </button>
        </div>

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Recipe Header */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-4xl">{recipe.image}</div>
                  <div className="text-right text-sm text-gray-500">
                    <div>{recipe.time}</div>
                    <div>{recipe.servings} servings</div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{recipe.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{recipe.description}</p>
                
                {/* Ingredients Preview */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Ingredients:</h4>
                  <div className="text-xs text-gray-600">
                    {recipe.ingredients.slice(0, 3).join(", ")}
                    {recipe.ingredients.length > 3 && "..."}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors">
                    Add to Grocery List
                  </button>
                  <button className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
                    View Recipe
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Meal Planner */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">This Week&apos;s Meal Plan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
              <div key={day} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 text-sm mb-3">{day}</h3>
                <div className="space-y-2">
                  {index === 0 && (
                    <div className="bg-blue-50 p-2 rounded text-xs">
                      <div className="font-medium text-blue-900">Chicken Teriyaki</div>
                      <div className="text-blue-700">6:30 PM</div>
                    </div>
                  )}
                  {index === 2 && (
                    <div className="bg-green-50 p-2 rounded text-xs">
                      <div className="font-medium text-green-900">Fish Tacos</div>
                      <div className="text-green-700">7:00 PM</div>
                    </div>
                  )}
                  <button className="w-full border-2 border-dashed border-gray-300 rounded p-2 text-xs text-gray-500 hover:border-gray-400 transition-colors">
                    + Add meal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
