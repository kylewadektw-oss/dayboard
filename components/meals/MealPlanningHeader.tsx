import { ChefHat, Plus, Calendar, Clock } from 'lucide-react';

export function MealPlanningHeader() {
  return (
    <div className="mb-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Family Meals</h1>
              <p className="text-gray-600">Plan, cook, and enjoy together</p>
            </div>
          </div>
          
          <button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center transition-all duration-200 shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Recipe
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-orange-600 mr-2" />
              <div>
                <div className="text-sm text-orange-600 font-medium">This Week</div>
                <div className="text-lg font-bold text-orange-900">4/7 Meals Planned</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <ChefHat className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <div className="text-sm text-green-600 font-medium">Favorites</div>
                <div className="text-lg font-bold text-green-900">12 Saved Recipes</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <div className="text-sm text-blue-600 font-medium">Quick Meals</div>
                <div className="text-lg font-bold text-blue-900">8 Under 20min</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
