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

import { memo } from 'react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target,
  AlertTriangle,
  Calendar,
  CreditCard
} from 'lucide-react';
import {
  mockBudgetCategories,
  mockSavingsGoals,
  getTotalMonthlyIncome,
  getTotalMonthlyExpenses
} from '@/fixtures/budget-data';

export const FinancialWidget = memo(() => {
  const totalIncome = getTotalMonthlyIncome();
  const totalExpenses = getTotalMonthlyExpenses();
  const netIncome = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((netIncome / totalIncome) * 100) : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get top savings goal
  const topSavingsGoal = mockSavingsGoals
    .sort((a, b) => (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount))[0];

  // Get categories that are over budget
  const overBudgetCategories = mockBudgetCategories.filter(cat => {
    const spent = cat.spentAmount || 0;
    return spent > cat.budgetAmount;
  });

  // Mock upcoming bills
  const upcomingBills = [
    { name: 'Mortgage', amount: 2450, dueDate: '2025-09-15' },
    { name: 'Electric', amount: 125, dueDate: '2025-09-18' },
    { name: 'Internet', amount: 89, dueDate: '2025-09-20' }
  ].filter(bill => {
    const dueDate = new Date(bill.dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 7 && daysUntilDue >= 0;
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1 rounded-lg tracking-wide">FINANCIAL OVERVIEW</h3>
        <DollarSign className="h-4 w-4 text-gray-400" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-700">Income</span>
          </div>
          <p className="text-sm font-bold text-green-800">{formatCurrency(totalIncome)}</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <span className="text-xs font-medium text-red-700">Expenses</span>
          </div>
          <p className="text-sm font-bold text-red-800">{formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      {/* Net Income */}
      <div className={`p-3 rounded-lg border mb-4 ${netIncome >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-medium ${netIncome >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            Net Income
          </span>
          <span className={`text-xs ${netIncome >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {savingsRate.toFixed(1)}% saved
          </span>
        </div>
        <p className={`text-sm font-bold ${netIncome >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
          {formatCurrency(netIncome)}
        </p>
      </div>

      {/* Top Savings Goal */}
      {topSavingsGoal && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-purple-700">{topSavingsGoal.name}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-purple-600">
              <span>{formatCurrency(topSavingsGoal.currentAmount)}</span>
              <span>{formatCurrency(topSavingsGoal.targetAmount)}</span>
            </div>
            <Progress 
              value={(topSavingsGoal.currentAmount / topSavingsGoal.targetAmount) * 100} 
              className="h-2"
            />
            <p className="text-xs text-purple-600">
              {((topSavingsGoal.currentAmount / topSavingsGoal.targetAmount) * 100).toFixed(1)}% complete
            </p>
          </div>
        </div>
      )}

      {/* Alerts & Upcoming Bills */}
      <div className="space-y-2 mb-4">
        {/* Over Budget Alerts */}
        {overBudgetCategories.length > 0 && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-xs text-red-700">
              {overBudgetCategories.length} categor{overBudgetCategories.length === 1 ? 'y' : 'ies'} over budget
            </span>
          </div>
        )}

        {/* Upcoming Bills */}
        {upcomingBills.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-medium text-gray-500">Due This Week</span>
            </div>
            <div className="space-y-1">
              {upcomingBills.slice(0, 2).map((bill, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{bill.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{formatCurrency(bill.amount)}</span>
                    <span className="text-gray-500">
                      {new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <Link href="/financial?tab=expenses">
          <button className="w-full py-2 px-3 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center">
            <CreditCard className="w-3 h-3 mr-1" />
            Add Expense
          </button>
        </Link>
        <Link href="/financial?tab=savings">
          <button className="w-full py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center">
            <Target className="w-3 h-3 mr-1" />
            Update Goal
          </button>
        </Link>
      </div>

      {/* This Month Summary */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Budget performance</span>
          <span className="font-medium text-gray-700">
            {netIncome >= 0 ? 'On Track' : 'Over Budget'}
          </span>
        </div>
      </div>
    </div>
  );
});

FinancialWidget.displayName = 'FinancialWidget';