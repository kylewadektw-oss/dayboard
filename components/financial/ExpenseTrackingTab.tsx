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

import { memo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/progress';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Home,
  Car,
  Utensils,
  Plus,
  Filter,
  Calendar,
  Search,
  type LucideIcon
} from 'lucide-react';
import {
  mockBudgetCategories,
  mockTransactions,
  getTotalMonthlyExpenses
} from '@/fixtures/budget-data';
// Types imported but used for future type checking

export const ExpenseTrackingTab = memo(() => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('month');

  const categories = mockBudgetCategories;
  const transactions = mockTransactions;
  const totalExpenses = getTotalMonthlyExpenses();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, LucideIcon> = {
      Groceries: ShoppingCart,
      Housing: Home,
      Transportation: Car,
      'Dining Out': Utensils,
      default: DollarSign
    };
    return iconMap[category] || iconMap.default;
  };

  const getCategorySpent = (categoryId: string) => {
    return transactions
      .filter((t) => t.categoryId === categoryId)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const filteredTransactions =
    selectedCategory === 'all'
      ? transactions
      : transactions.filter((t) => t.categoryId === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expense Tracking</h2>
          <p className="text-gray-600">Monitor and categorize your spending</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.name);
          const spent = getCategorySpent(category.id);
          const percentage =
            category.budgetAmount > 0
              ? (spent / category.budgetAmount) * 100
              : 0;
          const remaining = category.budgetAmount - spent;

          return (
            <div
              key={category.name}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedCategory(category.id)}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <CardTitle className="text-sm font-medium">
                        {category.name}
                      </CardTitle>
                    </div>
                    <Badge
                      variant={
                        percentage > 90
                          ? 'destructive'
                          : percentage > 75
                            ? 'secondary'
                            : 'default'
                      }
                    >
                      {percentage.toFixed(0)}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Spent</span>
                      <span className="font-medium">
                        {formatCurrency(spent)}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(percentage, 100)}
                      className="h-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Remaining</span>
                      <span
                        className={
                          remaining >= 0 ? 'text-green-600' : 'text-red-600'
                        }
                      >
                        {formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm w-48"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTransactions.slice(0, 10).map((transaction, index) => {
              const category = categories.find(
                (c) => c.id === transaction.categoryId
              );
              const Icon = getCategoryIcon(
                category?.name || transaction.categoryId
              );
              const isExpense = transaction.amount < 0;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {transaction.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{category?.name || transaction.categoryId}</span>
                        <span>•</span>
                        <span>
                          {new Date(transaction.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${isExpense ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {isExpense ? '-' : '+'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </p>
                    {transaction.isRecurring && (
                      <Badge variant="outline" className="text-xs">
                        Recurring
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTransactions.length > 10 && (
            <div className="text-center mt-4">
              <Button variant="outline" size="sm">
                Load More Transactions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-lg font-bold text-blue-600">
                  {transactions.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Daily</p>
                <p className="text-lg font-bold text-yellow-600">
                  {formatCurrency(totalExpenses / 30)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

ExpenseTrackingTab.displayName = 'ExpenseTrackingTab';
