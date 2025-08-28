export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Good morning, Family!</h1>
          <p className="text-gray-600">Here&apos;s what&apos;s happening today</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {/* Weather Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Weather</h3>
              <div className="text-2xl">☀️</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-gray-900">72°F</div>
              <div className="text-sm text-gray-600">Sunny and clear</div>
              <div className="text-xs text-gray-500">High: 78° Low: 65°</div>
            </div>
          </div>

          {/* Calendar Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Today&apos;s Events</h3>
              <div className="text-2xl">📅</div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Soccer Practice</div>
                  <div className="text-xs text-gray-500">4:00 PM - 5:30 PM</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Family Dinner</div>
                  <div className="text-xs text-gray-500">6:30 PM</div>
                </div>
              </div>
            </div>
          </div>

          {/* Dinner Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tonight&apos;s Dinner</h3>
              <div className="text-2xl">🍽️</div>
            </div>
            <div className="space-y-2">
              <div className="text-lg font-medium text-gray-900">Chicken Teriyaki</div>
              <div className="text-sm text-gray-600">with steamed rice and vegetables</div>
              <button className="mt-3 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors">
                View Recipe
              </button>
            </div>
          </div>

          {/* Grocery Preview Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Grocery List</h3>
              <div className="text-2xl">🛒</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">5 items remaining</div>
              <div className="space-y-1">
                <div className="text-sm">• Milk</div>
                <div className="text-sm">• Bananas</div>
                <div className="text-sm">• Bread</div>
                <div className="text-sm text-gray-400">+ 2 more...</div>
              </div>
              <button className="mt-3 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors">
                View Full List
              </button>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 md:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="text-2xl mb-1">📋</div>
                <span className="text-xs text-gray-600">Lists</span>
              </button>
              <button className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="text-2xl mb-1">🍳</div>
                <span className="text-xs text-gray-600">Meals</span>
              </button>
              <button className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="text-2xl mb-1">🎒</div>
                <span className="text-xs text-gray-600">Daycare</span>
              </button>
              <button className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="text-2xl mb-1">💼</div>
                <span className="text-xs text-gray-600">Work</span>
              </button>
            </div>
          </div>

          {/* Family Updates Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 md:col-span-2 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Updates</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">M</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Mom added groceries to the list</div>
                  <div className="text-xs text-gray-500">2 hours ago</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-green-600">D</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Dad updated tomorrow&apos;s dinner plan</div>
                  <div className="text-xs text-gray-500">5 hours ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
