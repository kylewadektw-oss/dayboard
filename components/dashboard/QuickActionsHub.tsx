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

/*
 * 📋 QUICK ACTIONS HUB TYPES - Type Definitions
 * 
 * PURPOSE: TypeScript type definitions for quick actions hub data structures
 * 
 * TYPES:
 * - [List main type definitions]
 * - [Interface declarations]
 * - [Enum definitions]
 * - [Utility types and generics]
 * 
 * USAGE:
 * ```typescript
 * import type { TypeName } from '@/types/QuickActionsHub';
 * 
 * const example: TypeName = {
 *   // properties
 * };
 * ```
 * 
 * FEATURES:
 * - [Type safety guarantees]
 * - [Validation patterns]
 * - [Extensibility and composition]
 * - [Integration with other types]
 * 
 * TECHNICAL:
 * - [Type system design]
 * - [Runtime validation]
 * - [Performance implications]
 * - [Compatibility considerations]
 */


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

/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kylewadektw-oss)
 * 
 * This file is part of Dayboard, a proprietary family command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: [your-email@domain.com]
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

import { Plus, Calendar, ShoppingCart, Wrench, ChefHat, Zap } from 'lucide-react';
import Link from 'next/link';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    id: '1',
    title: 'Add Event',
    description: 'Calendar appointment',
    icon: <Calendar className="h-5 w-5" />,
    href: '/calendar',
    color: 'bg-blue-500 hover:bg-blue-600 text-white'
  },
  {
    id: '2',
    title: 'Add Grocery',
    description: 'Shopping list item',
    icon: <ShoppingCart className="h-5 w-5" />,
    href: '/lists',
    color: 'bg-green-500 hover:bg-green-600 text-white'
  },
  {
    id: '3',
    title: 'Log Project',
    description: 'Home improvement',
    icon: <Wrench className="h-5 w-5" />,
    href: '/projects',
    color: 'bg-orange-500 hover:bg-orange-600 text-white'
  },
  {
    id: '4',
    title: 'Add Recipe',
    description: 'Meal planning',
    icon: <ChefHat className="h-5 w-5" />,
    href: '/meals',
    color: 'bg-pink-500 hover:bg-pink-600 text-white'
  }
];

export function QuickActionsHub() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 h-fit">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600">Quick Actions</h3>
        <Zap className="h-4 w-4 text-gray-400" />
      </div>

      {/* Quick Action Buttons - Optimized for iPad/Touch */}
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.id}
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
        ))}
      </div>

      {/* Contextual Suggestions */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <h4 className="text-xs font-medium text-gray-500 mb-2">💡 Suggestions</h4>
        <div className="space-y-2">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
            <div className="text-xs text-yellow-800 font-medium">
              Planning dinner? Check new recipes →
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
            <div className="text-xs text-blue-800 font-medium">
              Both parents free Saturday 2-6PM for projects
            </div>
          </div>
        </div>
      </div>

      {/* Voice Commands Hint */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-center text-xs text-gray-500">
          <span className="mr-1">🎙️</span>
          <span>"Hey assistant, add milk to grocery list"</span>
        </div>
      </div>
    </div>
  );
}
