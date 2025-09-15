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


import { Calendar, ShoppingCart, Wrench, ChefHat, Zap } from 'lucide-react';
import Link from 'next/link';
import { memo, useMemo } from 'react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

// 🚀 PERFORMANCE: Move icons outside component to prevent recreation
const ICONS = {
  calendar: <Calendar className="h-5 w-5" />,
  shoppingCart: <ShoppingCart className="h-5 w-5" />,
  wrench: <Wrench className="h-5 w-5" />,
  chefHat: <ChefHat className="h-5 w-5" />
} as const;

// 🚀 PERFORMANCE: Static data outside component
const STATIC_QUICK_ACTIONS: QuickAction[] = [
  {
    id: '1',
    title: 'Add Event',
    description: 'Calendar appointment',
    icon: ICONS.calendar,
    href: '/calendar',
    color: 'bg-blue-500 hover:bg-blue-600 text-white'
  },
  {
    id: '2',
    title: 'Add Grocery',
    description: 'Shopping list item',
    icon: ICONS.shoppingCart,
    href: '/lists',
    color: 'bg-green-500 hover:bg-green-600 text-white'
  },
  {
    id: '3',
    title: 'Log Project',
    description: 'Home improvement',
    icon: ICONS.wrench,
    href: '/projects',
    color: 'bg-orange-500 hover:bg-orange-600 text-white'
  },
  {
    id: '4',
    title: 'Add Recipe',
    description: 'Meal planning',
    icon: ICONS.chefHat,
    href: '/meals',
    color: 'bg-pink-500 hover:bg-pink-600 text-white'
  }
];

// 🚀 PERFORMANCE: Memoized individual action component
const QuickActionButton = memo(({ action }: { action: QuickAction }) => (
  <Link
    href={action.href}
    className={`${action.color} rounded-xl p-4 transition-all duration-200 active:scale-95 touch-manipulation`}
  >
    <div className="flex flex-col items-center text-center">
      <div className="mb-2">
        {action.icon}
      </div>
      <div className="text-sm font-semibold">
        {action.title}
      </div>
      <div className="text-xs opacity-90 mt-1">
        {action.description}
      </div>
    </div>
  </Link>
));
QuickActionButton.displayName = 'QuickActionButton';

function QuickActionsHubComponent() {
  // 🚀 PERFORMANCE: Memoize static arrays to prevent recreating on each render
  const quickActions = useMemo(() => STATIC_QUICK_ACTIONS, []);

  // 🚀 PERFORMANCE: Memoize static suggestions array
  const suggestions = useMemo(() => [
    {
      id: 'dinner',
      text: 'Planning dinner? Check new recipes →',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800'
    },
    {
      id: 'weekend',
      text: 'Both parents free Saturday 2-6PM for projects',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800'
    }
  ], []);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 h-fit">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600">Quick Actions</h3>
        <Zap className="h-4 w-4 text-gray-400" />
      </div>

      {/* Quick Action Buttons - Optimized for iPad/Touch */}
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <QuickActionButton key={action.id} action={action} />
        ))}
      </div>

      {/* Contextual Suggestions */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <h4 className="text-xs font-medium text-gray-500 mb-2">💡 Suggestions</h4>
        <div className="space-y-2">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`${suggestion.bgColor} border ${suggestion.borderColor} rounded-lg p-2`}
            >
              <div className={`text-xs ${suggestion.textColor} font-medium`}>
                {suggestion.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voice Commands Hint */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-center text-xs text-gray-500">
          <span className="mr-1">🎙️</span>
          <span>&quot;Hey assistant, add milk to grocery list&quot;</span>
        </div>
      </div>
    </div>
  );
}

// 🚀 PERFORMANCE: Export memoized component
export const QuickActionsHub = memo(QuickActionsHubComponent);