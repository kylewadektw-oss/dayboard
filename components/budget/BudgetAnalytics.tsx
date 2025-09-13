import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { 
  mockTransactions, 
  mockBudgetCategories, 
  mockSavingsGoals,
  getTotalMonthlyIncome,
  getTotalMonthlyExpenses 
} from '@/fixtures/budget-data';
import type { Transaction, BudgetCategory, SavingsGoal } from '@/types/budget';

const BudgetAnalytics = () => {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [viewType, setViewType] = useState<'overview' | 'trends' | 'categories' | 'goals'>('overview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate spending by category
  const getSpendingByCategory = () => {
    const categorySpending = new Map<string, { category: BudgetCategory; spent: number; budget: number }>();
    
    mockBudgetCategories.forEach(category => {
      categorySpending.set(category.id, {
        category,
        spent: category.spentAmount,
        budget: category.budgetAmount
      });
    });

    return Array.from(categorySpending.values()).sort((a, b) => b.spent - a.spent);
  };

  // Calculate monthly trends (mock data for multiple months)
  const getMonthlyTrends = () => {
    return [
      { month: 'Jun', income: 5200, expenses: 4100, savings: 1100 },
      { month: 'Jul', income: 5200, expenses: 4350, savings: 850 },
      { month: 'Aug', income: 5400, expenses: 4200, savings: 1200 },
      { month: 'Sep', income: 5200, expenses: 4150, savings: 1050 },
    ];
  };

  // Calculate budget performance
  const getBudgetPerformance = () => {
    const totalBudget = mockBudgetCategories.reduce((sum, cat) => sum + cat.budgetAmount, 0);
    const totalSpent = mockBudgetCategories.reduce((sum, cat) => sum + cat.spentAmount, 0);
    const performance = ((totalBudget - totalSpent) / totalBudget) * 100;
    
    return {
      totalBudget,
      totalSpent,
      remaining: totalBudget - totalSpent,
      performance,
      status: performance > 10 ? 'excellent' : performance > 0 ? 'good' : 'over'
    };
  };

  // Calculate savings progress
  const getSavingsProgress = () => {
    const totalTargetAmount = mockSavingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalCurrentAmount = mockSavingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const progressPercentage = (totalCurrentAmount / totalTargetAmount) * 100;
    
    return {
      totalTargetAmount,
      totalCurrentAmount,
      progressPercentage,
      goalsOnTrack: mockSavingsGoals.filter(goal => 
        (goal.currentAmount / goal.targetAmount) * 100 >= 50
      ).length
    };
  };

  const categorySpending = getSpendingByCategory();
  const monthlyTrends = getMonthlyTrends();
  const budgetPerformance = getBudgetPerformance();
  const savingsProgress = getSavingsProgress();
  const totalIncome = getTotalMonthlyIncome();
  const totalExpenses = getTotalMonthlyExpenses();

  const getPerformanceColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'over': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget Analytics</h1>
          <p className="text-gray-600">Insights and trends for your household finances</p>
        </div>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={viewType} onValueChange={(value) => setViewType(value as any)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="trends">Trends</SelectItem>
              <SelectItem value="categories">Categories</SelectItem>
              <SelectItem value="goals">Goals</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Performance</p>
                <p className={`text-2xl font-bold ${budgetPerformance.performance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {budgetPerformance.performance.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(budgetPerformance.remaining)} {budgetPerformance.remaining >= 0 ? 'under' : 'over'}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Savings Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(totalIncome - totalExpenses)} saved
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Category</p>
                <p className="text-2xl font-bold text-orange-600">
                  {categorySpending[0]?.category.icon || '🏠'}
                </p>
                <p className="text-xs text-gray-500">
                  {categorySpending[0]?.category.name} - {formatCurrency(categorySpending[0]?.spent || 0)}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <PieChart className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Goals Progress</p>
                <p className="text-2xl font-bold text-green-600">
                  {savingsProgress.progressPercentage.toFixed(0)}%
                </p>
                <p className="text-xs text-gray-500">
                  {savingsProgress.goalsOnTrack}/{mockSavingsGoals.length} on track
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overview Section */}
      {viewType === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget vs Actual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Budget vs Actual Spending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categorySpending.slice(0, 6).map(({ category, spent, budget }) => {
                  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
                  const isOverBudget = spent > budget;
                  
                  return (
                    <div key={category.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-medium text-gray-900">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(spent)} / {formatCurrency(budget)}
                          </p>
                          <p className={`text-xs ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                            {percentage.toFixed(1)}% used
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            isOverBudget ? 'bg-red-500' : percentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Monthly Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyTrends.map((month, index) => (
                  <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        month.savings > 1000 ? 'bg-green-500' : 
                        month.savings > 500 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="font-medium">{month.month} 2025</span>
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <div className="text-green-600">
                        <span className="font-medium">+{formatCurrency(month.income)}</span>
                      </div>
                      <div className="text-red-600">
                        <span className="font-medium">-{formatCurrency(month.expenses)}</span>
                      </div>
                      <div className={`font-semibold ${month.savings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        <span>{formatCurrency(month.savings)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Analysis */}
      {viewType === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categorySpending.map(({ category, spent, budget }) => {
                  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
                  const status = percentage >= 90 ? 'danger' : percentage >= 75 ? 'warning' : 'good';
                  
                  return (
                    <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{category.name}</h4>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(spent)} of {formatCurrency(budget)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getPerformanceColor(status)}>
                          {status === 'danger' ? 'Over Budget' : 
                           status === 'warning' ? 'Near Limit' : 'On Track'}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {percentage.toFixed(1)}% used
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spending Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categorySpending.map(({ category, spent }) => {
                  const total = categorySpending.reduce((sum, item) => sum + item.spent, 0);
                  const percentage = total > 0 ? (spent / total) * 100 : 0;
                  
                  return (
                    <div key={category.id} className="flex items-center space-x-3">
                      <span className="text-lg">{category.icon}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{category.name}</span>
                          <span className="font-medium">{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 bg-blue-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {formatCurrency(spent)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Goals Analysis */}
      {viewType === 'goals' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Savings Goals Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSavingsGoals.map((goal) => {
                  const percentage = (goal.currentAmount / goal.targetAmount) * 100;
                  const remaining = goal.targetAmount - goal.currentAmount;
                  const monthsToTarget = new Date(goal.targetDate).getTime() - new Date().getTime();
                  const monthsRemaining = Math.ceil(monthsToTarget / (1000 * 60 * 60 * 24 * 30));
                  
                  return (
                    <div key={goal.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{goal.icon}</span>
                          <div>
                            <h4 className="font-semibold text-gray-900">{goal.name}</h4>
                            <p className="text-sm text-gray-600">
                              Target: {new Date(goal.targetDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge className={percentage >= 75 ? 'bg-green-100 text-green-800' : 
                                        percentage >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                                        'bg-red-100 text-red-800'}>
                          {percentage >= 75 ? 'On Track' : percentage >= 50 ? 'Behind' : 'Critical'}
                        </Badge>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
                          <span className="font-medium">{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{formatCurrency(remaining)} remaining</span>
                        <span>{monthsRemaining} months left</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Health Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">B+</div>
                <p className="text-gray-600">Good Financial Health</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Emergency Fund</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Good</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Savings Rate</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Good</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Budget Adherence</span>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Needs Attention</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Goal Progress</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Excellent</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Recommendations</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Consider reducing dining out expenses</li>
                  <li>• Increase emergency fund by $100/month</li>
                  <li>• Review and optimize recurring subscriptions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BudgetAnalytics;