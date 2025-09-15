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

import { useState, memo } from 'react';
import { DollarSign, PieChart, Calendar, Target, Users, CreditCard, type LucideIcon } from 'lucide-react';
import { BudgetOverviewTab } from './BudgetOverviewTab';
import { ExpenseTrackingTab } from './ExpenseTrackingTab';
import { BillsCalendarTab } from './BillsCalendarTab';
import { SavingsGoalsTab } from './SavingsGoalsTab';
import { AllowanceTab } from './AllowanceTab';
import { AccountsTab } from './AccountsTab';

type TabType = 'overview' | 'expenses' | 'bills' | 'savings' | 'allowance' | 'accounts';

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
    label: 'Budget Overview',
    icon: DollarSign,
    component: BudgetOverviewTab,
    available: true
  },
  {
    id: 'expenses',
    label: 'Expense Tracking',
    icon: PieChart,
    component: ExpenseTrackingTab,
    available: true
  },
  {
    id: 'bills',
    label: 'Bills Calendar',
    icon: Calendar,
    component: BillsCalendarTab,
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
    id: 'allowance',
    label: 'Kids & Allowance',
    icon: Users,
    component: AllowanceTab,
    available: true
  },
  {
    id: 'accounts',
    label: 'Accounts',
    icon: CreditCard,
    component: AccountsTab,
    available: true
  }
];

export const FinancialTabs = memo(() => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || BudgetOverviewTab;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex">
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
                  flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-all flex-1 min-w-0
                  ${isActive && isAvailable
                    ? 'border-green-500 text-green-600 bg-green-50' 
                    : isAvailable
                    ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    : 'border-transparent text-gray-400 cursor-not-allowed opacity-50'
                  }
                `}
                title={!isAvailable ? 'Coming soon!' : ''}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
                {!isAvailable && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full ml-2 flex-shrink-0">
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