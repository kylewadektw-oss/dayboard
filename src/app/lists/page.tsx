export default function Lists() {
  const groceryItems = [
    { id: 1, name: "Milk (2%)", checked: false, category: "Dairy" },
    { id: 2, name: "Bananas", checked: true, category: "Produce" },
    { id: 3, name: "Whole grain bread", checked: false, category: "Bakery" },
    { id: 4, name: "Chicken breast", checked: false, category: "Meat" },
    { id: 5, name: "Greek yogurt", checked: true, category: "Dairy" },
    { id: 6, name: "Spinach", checked: false, category: "Produce" },
    { id: 7, name: "Eggs", checked: false, category: "Dairy" },
    { id: 8, name: "Olive oil", checked: false, category: "Pantry" },
  ];

  const todoItems = [
    { id: 1, name: "Schedule dentist appointment", checked: false, priority: "high" },
    { id: 2, name: "Pick up dry cleaning", checked: true, priority: "medium" },
    { id: 3, name: "Buy birthday gift for Emma", checked: false, priority: "medium" },
    { id: 4, name: "Call insurance company", checked: false, priority: "high" },
    { id: 5, name: "Water plants", checked: true, priority: "low" },
    { id: 6, name: "Organize garage", checked: false, priority: "low" },
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Family Lists</h1>
        <p className="text-gray-600">Keep track of groceries, tasks, and more</p>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grocery List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Grocery List</h2>
                <span className="text-sm text-gray-500">
                  {groceryItems.filter(item => !item.checked).length} remaining
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-3 mb-4">
                {groceryItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      readOnly
                    />
                    <span className={`flex-1 ${item.checked ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {item.name}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add new item..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Todo List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Todo List</h2>
                <span className="text-sm text-gray-500">
                  {todoItems.filter(item => !item.checked).length} remaining
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-3 mb-4">
                {todoItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      readOnly
                    />
                    <span className={`flex-1 ${item.checked ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {item.name}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.priority === 'high' ? 'bg-red-100 text-red-700' :
                      item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add new task..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Lists */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Shopping Lists */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shopping Lists</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Target Run</span>
                <span className="text-xs text-gray-500">3 items</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Costco Trip</span>
                <span className="text-xs text-gray-500">7 items</span>
              </div>
              <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 transition-colors">
                + New List
              </button>
            </div>
          </div>

          {/* Checklists */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Checklists</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Vacation Packing</span>
                <span className="text-xs text-gray-500">12/15 done</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Spring Cleaning</span>
                <span className="text-xs text-gray-500">5/20 done</span>
              </div>
              <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 transition-colors">
                + New Checklist
              </button>
            </div>
          </div>

          {/* Quick Add */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Add</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-100 text-blue-700 p-3 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
                🛒 Add to Grocery List
              </button>
              <button className="w-full bg-green-100 text-green-700 p-3 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
                ✓ Add Todo Item
              </button>
              <button className="w-full bg-purple-100 text-purple-700 p-3 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium">
                📝 Create New List
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}
