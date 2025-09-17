/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 *
 * Copyright (c) 2025 BentLo Labs LLC (developer@bentlolabs.com)
 *
 * This file is part of Dayboard, a proprietary household command center application.
 *
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 *
 * For licensing inquiries: developer@bentlolabs.com
 *
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

import {
  Calendar,
  ShoppingCart,
  Wrench,
  ChefHat,
  Zap,
  Plus,
  Clock,
  Users,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import { memo, useMemo } from 'react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  category: 'primary' | 'secondary';
}

// 🚀 PERFORMANCE: Move icons outside component to prevent recreation
const ICONS = {
  calendar: <Calendar className="h-5 w-5" />,
  shoppingCart: <ShoppingCart className="h-5 w-5" />,
  wrench: <Wrench className="h-5 w-5" />,
  chefHat: <ChefHat className="h-5 w-5" />,
  plus: <Plus className="h-5 w-5" />,
  clock: <Clock className="h-5 w-5" />,
  users: <Users className="h-5 w-5" />,
  bell: <Bell className="h-5 w-5" />
} as const;

// 🚀 PERFORMANCE: Static data outside component
const STATIC_QUICK_ACTIONS: QuickAction[] = [
  {
    id: '1',
    title: 'Add Event',
    description: 'Calendar',
    icon: ICONS.calendar,
    href: '/calendar',
    color: 'bg-blue-500 hover:bg-blue-600 text-white',
    category: 'primary'
  },
  {
    id: '2',
    title: 'Add Item',
    description: 'Shopping',
    icon: ICONS.shoppingCart,
    href: '/lists',
    color: 'bg-green-500 hover:bg-green-600 text-white',
    category: 'primary'
  },
  {
    id: '3',
    title: 'New Project',
    description: 'Home',
    icon: ICONS.wrench,
    href: '/projects',
    color: 'bg-orange-500 hover:bg-orange-600 text-white',
    category: 'primary'
  },
  {
    id: '4',
    title: 'Add Recipe',
    description: 'Meals',
    icon: ICONS.chefHat,
    href: '/meals',
    color: 'bg-pink-500 hover:bg-pink-600 text-white',
    category: 'primary'
  },
  {
    id: '5',
    title: 'Quick Add',
    description: 'Anything',
    icon: ICONS.plus,
    href: '/quick-add',
    color: 'bg-purple-500 hover:bg-purple-600 text-white',
    category: 'secondary'
  },
  {
    id: '6',
    title: 'Time Log',
    description: 'Track',
    icon: ICONS.clock,
    href: '/time-tracking',
    color: 'bg-indigo-500 hover:bg-indigo-600 text-white',
    category: 'secondary'
  },
  {
    id: '7',
    title: 'Family',
    description: 'Connect',
    icon: ICONS.users,
    href: '/family',
    color: 'bg-teal-500 hover:bg-teal-600 text-white',
    category: 'secondary'
  },
  {
    id: '8',
    title: 'Reminders',
    description: 'Alerts',
    icon: ICONS.bell,
    href: '/reminders',
    color: 'bg-red-500 hover:bg-red-600 text-white',
    category: 'secondary'
  }
];

// Contextual suggestion component
const ContextualSuggestion = memo(
  ({
    suggestion
  }: {
    suggestion: {
      id: string;
      text: string;
      bgColor: string;
      borderColor: string;
      textColor: string;
    };
  }) => (
    <div
      className={`${suggestion.bgColor} border ${suggestion.borderColor} rounded-lg px-3 py-2 flex-shrink-0`}
    >
      <div
        className={`text-xs ${suggestion.textColor} font-medium whitespace-nowrap`}
      >
        {suggestion.text}
      </div>
    </div>
  )
);
ContextualSuggestion.displayName = 'ContextualSuggestion';

function QuickActionsRibbonComponent() {
  // 🚀 PERFORMANCE: Combine all actions into single array for single ribbon
  const allActions = useMemo(() => [...STATIC_QUICK_ACTIONS], []);

  // 🚀 PERFORMANCE: Memoize static suggestions array
  const suggestions = useMemo(
    () => [
      {
        id: 'dinner',
        text: '💡 Planning dinner? Check new recipes →',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800'
      },
      {
        id: 'weekend',
        text: '📅 Both parents free Saturday 2-6PM for projects',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800'
      },
      {
        id: 'voice',
        text: '🎙️ Try: "Hey assistant, add milk to grocery list"',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-800'
      }
    ],
    []
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="text-xs text-gray-500">
          Tap any action to get started
        </div>
      </div>

      {/* Single Actions Ribbon - Compact tabs in single row */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 ribbon-scroll">
          {allActions.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              className={`${action.color} rounded-lg px-2.5 py-1.5 transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation flex items-center gap-1.5 min-w-0 flex-shrink-0 text-xs font-medium whitespace-nowrap`}
            >
              <div className="flex-shrink-0">{action.icon}</div>
              <span className="truncate">{action.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Contextual Suggestions Row */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 ribbon-scroll">
          {suggestions.map((suggestion) => (
            <ContextualSuggestion key={suggestion.id} suggestion={suggestion} />
          ))}
        </div>
      </div>
    </div>
  );
}

// 🚀 PERFORMANCE: Export memoized component
export const QuickActionsRibbon = memo(QuickActionsRibbonComponent);
