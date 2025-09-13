'use client';

import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  Users, 
  PieChart,
  BarChart3,
  Coins,
  Gift
} from 'lucide-react';
import BudgetTest from '@/components/budget/BudgetTest';
import Button from '@/components/ui/Button';

type BudgetView = 'dashboard' | 'categories' | 'transactions' | 'analytics' | 'allowance' | 'goals';

const BudgetPage = () => {
  const [activeView, setActiveView] = useState<BudgetView>('dashboard');

  const navigationItems = [
    {
      id: 'dashboard' as BudgetView,
      label: 'Dashboard',
      icon: PieChart,
      description: 'Budget overview & insights'
    },
    {
      id: 'categories' as BudgetView,
      label: 'Categories',
      icon: BarChart3,
      description: 'Manage budget categories'
    },
    {
      id: 'transactions' as BudgetView,
      label: 'Transactions',
      icon: DollarSign,
      description: 'Track expenses & income'
    },
    {
      id: 'analytics' as BudgetView,
      label: 'Analytics',
      icon: TrendingUp,
      description: 'Spending trends & reports'
    },
    {
      id: 'goals' as BudgetView,
      label: 'Goals',
      icon: Target,
      description: 'Financial goal tracking'
    },
    {
      id: 'allowance' as BudgetView,
      label: 'Allowance',
      icon: Coins,
      description: 'Kids chores & allowance'
    }
  ];

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <BudgetTest />;
      case 'categories':
        return <div className="p-6">Categories - Coming Soon</div>;
      case 'transactions':
        return <div className="p-6">Transactions - Coming Soon</div>;
      case 'analytics':
        return <div className="p-6">Analytics - Coming Soon</div>;
      case 'goals':
        return <div className="p-6">Goals - Coming Soon</div>;
      case 'allowance':
        return <div className="p-6">Allowance - Coming Soon</div>;
      default:
        return <BudgetTest />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Family Budget</h1>
                <p className="text-sm text-gray-600">Comprehensive financial management</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Family Account</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeView === item.id;
                  
                  return (
                    <Button
                      key={item.id}
                      onClick={() => setActiveView(item.id)}
                      className={`w-full justify-start text-left p-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                      } border`}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-gray-500 hidden lg:block">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Stats Sidebar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mt-4 hidden lg:block">
              <h3 className="font-medium text-gray-900 mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="text-sm font-medium text-red-600">-$2,847</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Budget Left</span>
                  <span className="text-sm font-medium text-green-600">$1,653</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Savings Goal</span>
                  <span className="text-sm font-medium text-blue-600">67%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Kids Allowance</span>
                  <span className="text-sm font-medium text-purple-600">$47.50</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm">
              {renderActiveView()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;