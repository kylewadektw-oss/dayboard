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

'use client';

import { useState, memo } from 'react';
import {
  DollarSign,
  PieChart,
  Target,
  TrendingUp,
  CreditCard,
  Users,
  Calendar,
  Calculator,
  type LucideIcon
} from 'lucide-react';
import { BudgetOverviewTab } from './BudgetOverviewTab';
import { ExpenseTrackingTab } from './ExpenseTrackingTab';
import { SavingsGoalsTab } from './SavingsGoalsTab';
import { AnalyticsTab } from './AnalyticsTab';
import { BillsCalendarTab } from './BillsCalendarTab';
import { AllowanceTab } from './AllowanceTab';
import { FinancialPlanningTab } from './FinancialPlanningTab';
import { CalculatorsTab } from './CalculatorsTab';

type TabType =
  | 'overview'
  | 'expenses'
  | 'savings'
  | 'analytics'
  | 'bills'
  | 'allowance'
  | 'planning'
  | 'calculators';

interface Tab {
  id: TabType;
  label: string;
  icon: LucideIcon;
  component: React.ComponentType;
  available: boolean;
}

const tabs: Tab[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: DollarSign,
    component: BudgetOverviewTab,
    available: true
  },
  {
    id: 'expenses',
    label: 'Expenses',
    icon: CreditCard,
    component: ExpenseTrackingTab,
    available: true
  },
  {
    id: 'savings',
    label: 'Savings Goals',
    icon: Target,
    component: SavingsGoalsTab,
    available: true
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: PieChart,
    component: AnalyticsTab,
    available: true
  },
  {
    id: 'bills',
    label: 'Bills & Payments',
    icon: Calendar,
    component: BillsCalendarTab,
    available: true
  },
  {
    id: 'allowance',
    label: 'Kids Allowance',
    icon: Users,
    component: AllowanceTab,
    available: true
  },
  {
    id: 'planning',
    label: 'Financial Planning',
    icon: TrendingUp,
    component: FinancialPlanningTab,
    available: true
  },
  {
    id: 'calculators',
    label: 'Calculators',
    icon: Calculator,
    component: CalculatorsTab,
    available: true
  }
];

export const FinancialTabs = memo(() => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const ActiveComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || BudgetOverviewTab;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isAvailable = tab.available;

            return (
              <button
                key={tab.id}
                onClick={() => isAvailable && setActiveTab(tab.id)}
                disabled={!isAvailable}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap
                  ${
                    isActive && isAvailable
                      ? 'border-green-500 text-green-600 bg-green-50'
                      : isAvailable
                        ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        : 'border-transparent text-gray-300 cursor-not-allowed opacity-50'
                  }
                `}
                title={!isAvailable ? 'Coming soon!' : ''}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {!isAvailable && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full ml-2">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <ActiveComponent />
      </div>
    </div>
  );
});

FinancialTabs.displayName = 'FinancialTabs';
