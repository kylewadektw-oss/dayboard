'use client';

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { 
  Plus, 
  Search, 
  CheckSquare, 
  Square, 
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input/Input';
import { Badge } from '@/components/ui/badge/Badge';
import { createOptimizedDebounce } from '@/utils/performance';

// 🚀 PERFORMANCE: Memoize static configurations
const LIST_TYPES = {
  // 🛒 Household & Food
  grocery: { icon: '🛒', label: 'Grocery List', color: '#22c55e', category: 'Household & Food' },
  chores: { icon: '✅', label: 'Chores', color: '#06b6d4', category: 'Home & Projects' },
  goals: { icon: '🎯', label: 'Goals', color: '#f59e0b', category: 'Personal & Growth' },
  books: { icon: '📚', label: 'Books to Read', color: '#6366f1', category: 'Entertainment & Learning' },
  gifts: { icon: '🎁', label: 'Gift Ideas', color: '#f59e0b', category: 'Gifting & Special Occasions' }
} as const;

// 🚀 PERFORMANCE: Memoize categories to prevent recalculation
const CATEGORIES = Array.from(new Set(Object.values(LIST_TYPES).map(type => type.category)));

interface List {
  id: number;
  title: string;
  type: string;
  description?: string;
  icon?: string;
  color?: string;
  item_count: number;
  checked_count: number;
  last_updated: string;
}

interface ListItem {
  id: number;
  content: string;
  details: any;
  checked: boolean;
  position: number;
  created_at: string;
  updated_at: string;
  due_date?: string;
  priority?: string;
  category?: string;
  tags: string[];
  created_by_name?: string;
  assigned_to_name?: string;
}

// 🚀 PERFORMANCE: Memoized ListCard component
const ListCard = memo(({ 
  list, 
  listConfig, 
  progress, 
  onSelect 
}: { 
  list: List; 
  listConfig: typeof LIST_TYPES[keyof typeof LIST_TYPES]; 
  progress: number; 
  onSelect: (list: List) => void;
}) => (
  <Card 
    className="cursor-pointer hover:shadow-md transition-shadow"
  >
    <div onClick={() => onSelect(list)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{list.icon || listConfig?.icon}</span>
            <div>
              <CardTitle className="text-lg">{list.title}</CardTitle>
              {list.description && (
                <p className="text-sm text-gray-600 mt-1">{list.description}</p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{list.item_count} items</span>
          <span>{list.checked_count} completed</span>
        </div>
        
        {list.item_count > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-3">
          Updated {new Date(list.last_updated).toLocaleDateString()}
        </div>
      </CardContent>
    </div>
  </Card>
));

ListCard.displayName = 'ListCard';

// 🚀 PERFORMANCE: Memoized ListItem component
const ListItemCard = memo(({ 
  item, 
  onToggle, 
  onDelete 
}: { 
  item: ListItem; 
  onToggle: (id: number, checked: boolean) => void;
  onDelete?: (id: number) => void;
}) => (
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3 flex-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggle(item.id, item.checked)}
        >
          {item.checked ? (
            <CheckSquare className="w-5 h-5 text-green-600" />
          ) : (
            <Square className="w-5 h-5 text-gray-400" />
          )}
        </Button>
        
        <div className="flex-1">
          <div className={`text-lg ${item.checked ? 'line-through text-gray-500' : ''}`}>
            {item.content}
          </div>
          
          {item.details.quantity && (
            <div className="text-sm text-gray-600 mt-1">
              Quantity: {item.details.quantity}
            </div>
          )}
          
          {item.tags.length > 0 && (
            <div className="flex space-x-1 mt-2">
              {item.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {onDelete && (
        <Button 
          variant="ghost" 
          size="sm"
          className="text-red-600 hover:text-red-800"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  </Card>
));

ListItemCard.displayName = 'ListItemCard';

function EnhancedListsManager() {
  const [lists, setLists] = useState<List[]>([]);
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newItemContent, setNewItemContent] = useState('');

  // 🚀 PERFORMANCE: Memoize mock data to prevent recreation
  const mockLists = useMemo<List[]>(() => [
    {
      id: 1,
      title: 'Weekly Groceries',
      type: 'grocery',
      description: 'Our weekly grocery shopping list',
      icon: '🛒',
      color: '#22c55e',
      item_count: 8,
      checked_count: 3,
      last_updated: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Family Chores',
      type: 'chores',
      description: 'Weekly household tasks',
      icon: '✅',
      color: '#06b6d4',
      item_count: 12,
      checked_count: 7,
      last_updated: new Date().toISOString()
    },
    {
      id: 3,
      title: 'Life Goals',
      type: 'goals',
      description: 'Our family aspirations',
      icon: '🎯',
      color: '#f59e0b',
      item_count: 5,
      checked_count: 2,
      last_updated: new Date().toISOString()
    }
  ], []);

  const mockItems = useMemo<ListItem[]>(() => [
    {
      id: 1,
      content: 'Buy organic bananas',
      details: { quantity: '2 bunches', category: 'Produce' },
      checked: false,
      position: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: ['produce', 'organic']
    },
    {
      id: 2,
      content: 'Milk (whole, organic)',
      details: { quantity: '1 gallon', category: 'Dairy' },
      checked: true,
      position: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: ['dairy', 'organic']
    }
  ], []);

  // 🚀 PERFORMANCE: Load data only once with useEffect
  useEffect(() => {
    setLists(mockLists);
    setLoading(false);
  }, [mockLists]);

  // 🚀 PERFORMANCE: Debounced search to reduce re-renders
  const debouncedSearchTerm = useMemo(() => {
    const debouncer = createOptimizedDebounce((term: string) => term, 300);
    return debouncer(searchTerm);
  }, [searchTerm]);

  // 🚀 PERFORMANCE: Memoized filtered lists to prevent recalculation
  const filteredLists = useMemo(() => 
    lists.filter(list => 
      list.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    ), [lists, debouncedSearchTerm]);

  // 🚀 PERFORMANCE: Memoized grouped lists
  const groupedLists = useMemo(() => {
    return filteredLists.reduce((acc, list) => {
      const listConfig = LIST_TYPES[list.type as keyof typeof LIST_TYPES];
      const category = listConfig?.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(list);
      return acc;
    }, {} as Record<string, List[]>);
  }, [filteredLists]);

  // 🚀 PERFORMANCE: Optimized callbacks with useCallback
  const toggleItemChecked = useCallback((itemId: number, checked: boolean) => {
    setListItems(items => 
      items.map(item => 
        item.id === itemId ? { ...item, checked: !checked } : item
      )
    );
  }, []);

  const handleListSelect = useCallback((list: List) => {
    setSelectedList(list);
    if (list.id === 1) {
      setListItems(mockItems);
    } else {
      setListItems([]);
    }
  }, [mockItems]);

  const addItem = useCallback(() => {
    if (!newItemContent.trim() || !selectedList) return;

    const newItem: ListItem = {
      id: Date.now(),
      content: newItemContent,
      details: {},
      checked: false,
      position: listItems.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: []
    };

    setListItems(items => [...items, newItem]);
    setNewItemContent('');
  }, [newItemContent, selectedList, listItems.length]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleNewItemChange = useCallback((value: string) => {
    setNewItemContent(value);
  }, []);

  const handleBackToLists = useCallback(() => {
    setSelectedList(null);
    setListItems([]);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Family Lists</h1>
          <p className="text-gray-600">
            Organize everything your household needs - from groceries to dreams
          </p>
        </div>
        
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New List
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search lists..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lists Grid */}
      {selectedList ? (
        // Selected List View
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleBackToLists}
              >
                ← Back to Lists
              </Button>
              <span className="text-2xl">{selectedList.icon}</span>
              <div>
                <h2 className="text-2xl font-bold">{selectedList.title}</h2>
                {selectedList.description && (
                  <p className="text-gray-600">{selectedList.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Input
                placeholder="Add new item..."
                value={newItemContent}
                onChange={handleNewItemChange}
              />
              <Button onClick={addItem} disabled={!newItemContent.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* List Items */}
          <div className="space-y-2">
            {listItems.map((item) => (
              <ListItemCard
                key={item.id}
                item={item}
                onToggle={toggleItemChecked}
              />
            ))}
            
            {listItems.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium mb-2">No items yet</h3>
                <p>Add your first item to get started!</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Lists Overview
        <div>
          {Object.entries(groupedLists).map(([category, categoryLists]) => (
            <div key={category} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryLists.map((list) => {
                  const listConfig = LIST_TYPES[list.type as keyof typeof LIST_TYPES];
                  const progress = list.item_count > 0 ? (list.checked_count / list.item_count) * 100 : 0;
                  
                  return (
                    <ListCard
                      key={list.id}
                      list={list}
                      listConfig={listConfig}
                      progress={progress}
                      onSelect={handleListSelect}
                    />
                  );
                })}
              </div>
            </div>
          ))}
          
          {filteredLists.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium mb-2">No lists found</h3>
              <p>Create your first list to get organized!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 🚀 PERFORMANCE: Export memoized component
export default memo(EnhancedListsManager);