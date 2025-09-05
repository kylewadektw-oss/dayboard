import { Calendar, Plus, Clock, Users } from 'lucide-react';

interface MealPlan {
  day: string;
  date: string;
  meals: {
    breakfast?: { name: string; time: string };
    lunch?: { name: string; time: string };
    dinner?: { name: string; time: string };
  };
}

// Mock weekly meal plan
const weeklyPlan: MealPlan[] = [
  {
    day: 'Monday',
    date: 'Sep 6',
    meals: {
      breakfast: { name: 'Overnight Oats', time: '7:00 AM' },
      dinner: { name: 'Honey Garlic Chicken', time: '6:30 PM' }
    }
  },
  {
    day: 'Tuesday', 
    date: 'Sep 7',
    meals: {
      breakfast: { name: 'Toast & Avocado', time: '7:00 AM' },
      lunch: { name: 'Leftover Chicken', time: '12:00 PM' }
    }
  },
  {
    day: 'Wednesday',
    date: 'Sep 8',
    meals: {
      dinner: { name: 'Spaghetti Carbonara', time: '6:30 PM' }
    }
  },
  {
    day: 'Thursday',
    date: 'Sep 9',
    meals: {
      breakfast: { name: 'Greek Yogurt Bowl', time: '7:00 AM' },
      dinner: { name: 'Vegetable Stir Fry', time: '6:00 PM' }
    }
  },
  {
    day: 'Friday',
    date: 'Sep 10',
    meals: {}
  },
  {
    day: 'Saturday',
    date: 'Sep 11',
    meals: {}
  },
  {
    day: 'Sunday',
    date: 'Sep 12',
    meals: {}
  }
];

const getMealEmoji = (mealType: string) => {
  switch (mealType) {
    case 'breakfast':
      return '🌅';
    case 'lunch':
      return '☀️';
    case 'dinner':
      return '🌙';
    default:
      return '🍽️';
  }
};

export function WeeklyMealPlan() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">This Week's Meal Plan</h3>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
          <Plus className="h-4 w-4 mr-1" />
          Auto-Fill Week
        </button>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {weeklyPlan.map((day) => (
          <div key={day.day} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-center mb-4">
              <div className="font-semibold text-gray-900">{day.day}</div>
              <div className="text-sm text-gray-500">{day.date}</div>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {/* Breakfast */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 hover:border-orange-300 transition-colors">
                {day.meals.breakfast ? (
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="text-sm">🌅</span>
                      <span className="text-xs text-gray-500 ml-1">Breakfast</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">{day.meals.breakfast.name}</div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {day.meals.breakfast.time}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Plus className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-500">Add Breakfast</div>
                  </div>
                )}
              </div>

              {/* Lunch */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 hover:border-yellow-300 transition-colors">
                {day.meals.lunch ? (
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="text-sm">☀️</span>
                      <span className="text-xs text-gray-500 ml-1">Lunch</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">{day.meals.lunch.name}</div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {day.meals.lunch.time}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Plus className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-500">Add Lunch</div>
                  </div>
                )}
              </div>

              {/* Dinner */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 hover:border-purple-300 transition-colors">
                {day.meals.dinner ? (
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="text-sm">🌙</span>
                      <span className="text-xs text-gray-500 ml-1">Dinner</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">{day.meals.dinner.name}</div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {day.meals.dinner.time}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Plus className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-500">Add Dinner</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Summary */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-blue-900">Weekly Progress</h4>
            <p className="text-sm text-blue-700">4 out of 21 meals planned (19% complete)</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Generate Grocery List
          </button>
        </div>
      </div>
    </div>
  );
}
