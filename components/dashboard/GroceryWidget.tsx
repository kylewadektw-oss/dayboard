import { ShoppingCart, Plus, Eye, AlertTriangle } from 'lucide-react';

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  urgent?: boolean;
  addedBy: string;
}

// Mock grocery data
const mockGroceryItems: GroceryItem[] = [
  { id: '1', name: 'Milk (Whole)', category: 'Dairy', urgent: true, addedBy: 'Ashley' },
  { id: '2', name: 'Chicken Breast', category: 'Meat', urgent: false, addedBy: 'Kyle' },
  { id: '3', name: 'Bananas', category: 'Produce', urgent: false, addedBy: 'Harper' },
  { id: '4', name: 'Bread', category: 'Bakery', urgent: true, addedBy: 'Kyle' },
  { id: '5', name: 'Greek Yogurt', category: 'Dairy', urgent: false, addedBy: 'Ashley' },
  { id: '6', name: 'Apples (Honeycrisp)', category: 'Produce', urgent: false, addedBy: 'Harper' },
  { id: '7', name: 'Ground Turkey', category: 'Meat', urgent: false, addedBy: 'Kyle' }
];

const pantryStats = {
  inPantry: 23,
  needed: mockGroceryItems.length,
  urgent: mockGroceryItems.filter(item => item.urgent).length
};

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'produce':
      return '🥕';
    case 'dairy':
      return '🥛';
    case 'meat':
      return '🥩';
    case 'bakery':
      return '🍞';
    default:
      return '🛒';
  }
};

export function GroceryWidget() {
  const topItems = mockGroceryItems.slice(0, 5);
  const remainingCount = Math.max(0, mockGroceryItems.length - 5);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 h-fit">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600">Grocery List</h3>
        <ShoppingCart className="h-4 w-4 text-gray-400" />
      </div>

      {/* Urgent Items Alert */}
      {pantryStats.urgent > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
          <div className="flex items-center">
            <AlertTriangle className="h-3 w-3 text-red-500 mr-1" />
            <span className="text-xs text-red-700 font-medium">
              {pantryStats.urgent} urgent item{pantryStats.urgent !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Top 5 Items */}
      <div className="space-y-2 mb-4">
        {topItems.map((item) => (
          <div key={item.id} className={`flex items-center justify-between p-2 rounded-lg ${
            item.urgent ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
          }`}>
            <div className="flex items-center flex-1 min-w-0">
              <span className="text-sm mr-2">{getCategoryIcon(item.category)}</span>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${
                  item.urgent ? 'text-red-900' : 'text-gray-900'
                }`}>
                  {item.name}
                </div>
                <div className="text-xs text-gray-500">
                  by {item.addedBy}
                </div>
              </div>
            </div>
            {item.urgent && (
              <div className="ml-2">
                <AlertTriangle className="h-3 w-3 text-red-500" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Show remaining items */}
      {remainingCount > 0 && (
        <div className="text-center mb-3">
          <button className="text-xs text-gray-500 hover:text-gray-700">
            + {remainingCount} more item{remainingCount !== 1 ? 's' : ''}
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-2">
        <button className="w-full py-2 px-3 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center">
          <Plus className="h-3 w-3 mr-1" />
          Add Item
        </button>
        
        <button className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center">
          <Eye className="h-3 w-3 mr-1" />
          View Full List
        </button>
      </div>

      {/* Pantry Stats */}
      <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Items needed</span>
          <span className="font-medium text-gray-700">{pantryStats.needed}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Items in pantry</span>
          <span className="font-medium text-gray-700">{pantryStats.inPantry}</span>
        </div>
      </div>

      {/* Allergy Warning (if applicable) */}
      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center">
          <span className="text-yellow-600 text-xs">⚠️</span>
          <span className="text-xs text-yellow-700 ml-1">
            Check for nut allergies (Harper)
          </span>
        </div>
      </div>
    </div>
  );
}
