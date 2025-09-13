import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  DollarSign, 
  MapPin,
  Clock,
  Check,
  X
} from 'lucide-react';

interface GroceryItem {
  id: number;
  content: string;
  details: {
    quantity?: string;
    unit?: string;
    category?: string;
    price?: number;
    store?: string;
    urgent?: boolean;
    brand_preference?: string;
  };
  checked: boolean;
  category?: string;
  tags: string[];
}

interface GroceryListTemplateProps {
  items: GroceryItem[];
  onToggleItem: (id: number, checked: boolean) => void;
  onAddItem: (item: Partial<GroceryItem>) => void;
  onUpdateItem: (id: number, updates: Partial<GroceryItem>) => void;
  onDeleteItem: (id: number) => void;
}

const GROCERY_CATEGORIES = [
  { name: 'Produce', icon: '🥬', color: 'bg-green-100 text-green-800' },
  { name: 'Dairy', icon: '🥛', color: 'bg-blue-100 text-blue-800' },
  { name: 'Meat & Seafood', icon: '🥩', color: 'bg-red-100 text-red-800' },
  { name: 'Pantry', icon: '🏠', color: 'bg-yellow-100 text-yellow-800' },
  { name: 'Frozen', icon: '❄️', color: 'bg-cyan-100 text-cyan-800' },
  { name: 'Bakery', icon: '🍞', color: 'bg-orange-100 text-orange-800' },
  { name: 'Snacks', icon: '🍪', color: 'bg-purple-100 text-purple-800' },
  { name: 'Beverages', icon: '🥤', color: 'bg-pink-100 text-pink-800' },
  { name: 'Health & Beauty', icon: '💊', color: 'bg-gray-100 text-gray-800' },
  { name: 'Household', icon: '🧽', color: 'bg-indigo-100 text-indigo-800' }
];

const COMMON_UNITS = ['lbs', 'oz', 'pieces', 'bunches', 'packages', 'bottles', 'cans'];

export default function GroceryListTemplate({ 
  items, 
  onToggleItem, 
  onAddItem, 
  onUpdateItem, 
  onDeleteItem 
}: GroceryListTemplateProps) {
  const [newItemName, setNewItemName] = React.useState('');
  const [newItemQuantity, setNewItemQuantity] = React.useState('');
  const [newItemUnit, setNewItemUnit] = React.useState('pieces');
  const [newItemCategory, setNewItemCategory] = React.useState('');
  const [showQuickAdd, setShowQuickAdd] = React.useState(false);

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.details.category || item.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  // Calculate totals
  const totalItems = items.length;
  const checkedItems = items.filter(item => item.checked).length;
  const estimatedTotal = items.reduce((sum, item) => {
    const price = item.details.price || 0;
    const quantity = parseFloat(item.details.quantity || '1');
    return sum + (price * quantity);
  }, 0);

  const addItem = () => {
    if (!newItemName.trim()) return;

    onAddItem({
      content: newItemName,
      details: {
        quantity: newItemQuantity || '1',
        unit: newItemUnit,
        category: newItemCategory
      },
      category: newItemCategory,
      checked: false,
      tags: []
    });

    setNewItemName('');
    setNewItemQuantity('');
    setNewItemCategory('');
    setShowQuickAdd(false);
  };

  const updateQuantity = (item: GroceryItem, change: number) => {
    const currentQuantity = parseFloat(item.details.quantity || '1');
    const newQuantity = Math.max(0, currentQuantity + change);
    
    onUpdateItem(item.id, {
      details: {
        ...item.details,
        quantity: newQuantity.toString()
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="w-6 h-6 text-green-600" />
              <div>
                <CardTitle>Grocery List Summary</CardTitle>
                <p className="text-sm text-gray-600">
                  {checkedItems} of {totalItems} items collected
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ${estimatedTotal.toFixed(2)}
              </div>
              <p className="text-sm text-gray-600">estimated total</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Shopping Progress</span>
              <span>{totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all"
                style={{ width: `${totalItems > 0 ? (checkedItems / totalItems) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Add Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Add Items</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQuickAdd(!showQuickAdd)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Quick Add
            </Button>
          </div>
        </CardHeader>
        
        {showQuickAdd && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Item name (e.g., Organic Bananas)"
                  value={newItemName}
                  onChange={(value) => setNewItemName(value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem()}
                />
              </div>
              
              <div className="flex space-x-2">
                <Input
                  placeholder="Qty"
                  value={newItemQuantity}
                  onChange={(value) => setNewItemQuantity(value)}
                  className="w-20"
                />
                <select
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {COMMON_UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-2">
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Category</option>
                  {GROCERY_CATEGORIES.map(category => (
                    <option key={category.name} value={category.name}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
                <Button onClick={addItem} disabled={!newItemName.trim()}>
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Category-organized items */}
      <div className="space-y-4">
        {Object.entries(groupedItems).map(([categoryName, categoryItems]) => {
          const categoryConfig = GROCERY_CATEGORIES.find(c => c.name === categoryName);
          
          return (
            <Card key={categoryName}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{categoryConfig?.icon || '📦'}</span>
                    <div>
                      <h3 className="font-semibold">{categoryName}</h3>
                      <p className="text-sm text-gray-600">
                        {categoryItems.filter(item => item.checked).length} of {categoryItems.length} collected
                      </p>
                    </div>
                  </div>
                  
                  {categoryConfig && (
                    <Badge className={categoryConfig.color}>
                      {categoryName}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {categoryItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3 flex-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleItem(item.id, item.checked)}
                        >
                          {item.checked ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                          )}
                        </Button>
                        
                        <div className="flex-1">
                          <div className={`font-medium ${item.checked ? 'line-through text-gray-500' : ''}`}>
                            {item.content}
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            {item.details.quantity && (
                              <span>
                                {item.details.quantity} {item.details.unit}
                              </span>
                            )}
                            
                            {item.details.price && (
                              <span className="flex items-center">
                                <DollarSign className="w-3 h-3 mr-1" />
                                {item.details.price.toFixed(2)}
                              </span>
                            )}
                            
                            {item.details.store && (
                              <span className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {item.details.store}
                              </span>
                            )}
                            
                            {item.details.urgent && (
                              <Badge className="bg-red-100 text-red-800">
                                Urgent
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item, -1)}
                          disabled={item.checked}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        
                        <span className="w-8 text-center text-sm">
                          {item.details.quantity || '1'}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item, 1)}
                          disabled={item.checked}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Shopping tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Shopping Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Store Layout Optimization</h4>
              <p className="text-gray-600">
                Items are organized by typical grocery store sections to minimize backtracking.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Budget Tracking</h4>
              <p className="text-gray-600">
                Add prices to track your spending in real-time as you shop.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}