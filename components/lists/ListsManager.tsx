/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kyle.wade.ktw@gmail.com)
 * 
 * This file is part of Dayboard, a proprietary household command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: kyle.wade.ktw@gmail.com
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */


'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { Plus, ClipboardList, Check, X, ShoppingCart } from 'lucide-react';

interface ListItem {
  id: string;
  text: string;
  completed: boolean;
  category?: string;
}

interface List {
  id: string;
  name: string;
  type: 'grocery' | 'todo' | 'shopping';
  items: ListItem[];
  color: string;
}

// Mock lists data
const mockLists: List[] = [
  {
    id: '1',
    name: 'Grocery List',
    type: 'grocery',
    color: 'bg-green-500',
    items: [
      { id: '1', text: 'Milk (Whole)', completed: false, category: 'Dairy' },
      { id: '2', text: 'Chicken Breast', completed: false, category: 'Meat' },
      { id: '3', text: 'Bananas', completed: true, category: 'Produce' },
      { id: '4', text: 'Bread', completed: false, category: 'Bakery' },
      { id: '5', text: 'Greek Yogurt', completed: false, category: 'Dairy' }
    ]
  },
  {
    id: '2',
    name: 'Weekend Tasks',
    type: 'todo',
    color: 'bg-blue-500',
    items: [
      { id: '6', text: 'Clean garage', completed: false },
      { id: '7', text: 'Mow lawn', completed: true },
      { id: '8', text: 'Call plumber', completed: false },
      { id: '9', text: 'Grocery shopping', completed: false }
    ]
  },
  {
    id: '3',
    name: 'Back to School',
    type: 'shopping',
    color: 'bg-purple-500',
    items: [
      { id: '10', text: 'Backpack for Harper', completed: false },
      { id: '11', text: 'School supplies', completed: true },
      { id: '12', text: 'New shoes', completed: false }
    ]
  }
];

export function ListsManager() {
  const [lists, setLists] = useState(mockLists);
  const [newItemText, setNewItemText] = useState('');
  const [activeList, setActiveList] = useState(lists[0].id);

  // Memoize current list to avoid recalculation
  const currentList = useMemo(() => 
    lists.find(list => list.id === activeList), 
    [lists, activeList]
  );

  // Memoize toggle function with useCallback to prevent recreation
  const toggleItem = useCallback((listId: string, itemId: string) => {
    setLists(prev => prev.map(list => 
      list.id === listId 
        ? {
            ...list,
            items: list.items.map(item =>
              item.id === itemId ? { ...item, completed: !item.completed } : item
            )
          }
        : list
    ));
  }, []);

  // Memoize add function
  const addItem = useCallback((listId: string) => {
    if (!newItemText.trim()) return;

    const newItem: ListItem = {
      id: Date.now().toString(),
      text: newItemText,
      completed: false
    };

    setLists(prev => prev.map(list =>
      list.id === listId
        ? { ...list, items: [...list.items, newItem] }
        : list
    ));

    setNewItemText('');
  }, [newItemText]);

  // Memoize remove function
  const removeItem = useCallback((listId: string, itemId: string) => {
    setLists(prev => prev.map(list =>
      list.id === listId
        ? { ...list, items: list.items.filter(item => item.id !== itemId) }
        : list
    ));
  }, []);

  // Memoize completion percentage calculation
  const completionData = useMemo(() => {
    if (!currentList || currentList.items.length === 0) {
      return { completedCount: 0, totalCount: 0, percentage: 0 };
    }
    
    const completedCount = currentList.items.filter(item => item.completed).length;
    const totalCount = currentList.items.length;
    const percentage = Math.round((completedCount / totalCount) * 100);
    
    return { completedCount, totalCount, percentage };
  }, [currentList]);

  // Memoize the Enter key handler
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentList) {
      addItem(currentList.id);
    }
  }, [addItem, currentList]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Family Lists</h1>
                <p className="text-gray-600">Keep track of everything together</p>
              </div>
            </div>
            
            <button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center transition-all duration-200 shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              New List
            </button>
          </div>

          {/* List Tabs */}
          <div className="flex space-x-2">
            {lists.map((list) => (
              <button
                key={list.id}
                onClick={() => setActiveList(list.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeList === list.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-2 h-2 ${list.color} rounded-full mr-2`}></div>
                  {list.name}
                  <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                    {list.items.filter(item => !item.completed).length}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current List */}
      {currentList && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className={`w-3 h-3 ${currentList.color} rounded-full mr-2`}></div>
              <h2 className="text-lg font-semibold text-gray-900">{currentList.name}</h2>
              <span className="ml-3 text-sm text-gray-500">
                {currentList.items.filter(item => !item.completed).length} remaining
              </span>
            </div>
            
            {currentList.type === 'grocery' && (
              <button className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center">
                <ShoppingCart className="h-4 w-4 mr-1" />
                Generate from Meal Plan
              </button>
            )}
          </div>

          {/* Add New Item */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add new item..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => addItem(currentList.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* List Items */}
          <div className="space-y-2">
            {currentList.items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  item.completed 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-white border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center flex-1">
                  <button
                    onClick={() => toggleItem(currentList.id, item.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                      item.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 hover:border-green-500'
                    }`}
                  >
                    {item.completed && <Check className="h-3 w-3 text-white" />}
                  </button>
                  
                  <div className="flex-1">
                    <span className={`${
                      item.completed 
                        ? 'line-through text-gray-500' 
                        : 'text-gray-900'
                    }`}>
                      {item.text}
                    </span>
                    {item.category && (
                      <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => removeItem(currentList.id, item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* List Stats */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>
                {completionData.completedCount} of {completionData.totalCount} completed
              </span>
              <span>
                {completionData.percentage}% done
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all ${currentList.color}`}
                style={{
                  width: `${completionData.percentage}%`
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
