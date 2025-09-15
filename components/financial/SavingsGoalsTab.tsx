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
  Target, 
  Plus, 
  TrendingUp,
  Calendar,
  DollarSign,
  Home,
  Car,
  Plane,
  GraduationCap,
  Heart,
  Gift,
  Edit,
  Trash2,
  type LucideIcon
} from 'lucide-react';
import { mockSavingsGoals } from '@/fixtures/budget-data';
import type { SavingsGoal } from '@/types/budget';

export const SavingsGoalsTab = memo(() => {
  const goals = mockSavingsGoals;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getGoalIcon = (category: string) => {
    const iconMap: Record<string, LucideIcon> = {
      'vacation': Plane,
      'emergency': Heart,
      'home': Home,
      'car': Car,
      'education': GraduationCap,
      'gift': Gift,
      'default': Target
    };
    return iconMap[category.toLowerCase()] || iconMap.default;
  };

  const getDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getMonthlyTarget = (goal: SavingsGoal) => {
    const daysRemaining = getDaysRemaining(goal.targetDate);
    const monthsRemaining = Math.max(1, daysRemaining / 30);
    const remaining = goal.targetAmount - goal.currentAmount;
    return remaining / monthsRemaining;
  };

  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length;
  const totalTargetAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSavedAmount = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress = totalTargetAmount > 0 ? (totalSavedAmount / totalTargetAmount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Savings Goals</h2>
          <p className="text-gray-600">Track your progress toward financial milestones</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
            >
              List
            </button>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Goals</p>
                <p className="text-lg font-bold text-blue-600">{totalGoals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-lg font-bold text-green-600">{completedGoals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Saved</p>
                <p className="text-lg font-bold text-purple-600">{formatCurrency(totalSavedAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Target className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Overall Progress</p>
                <p className="text-lg font-bold text-yellow-600">{overallProgress.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Display */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {goals.map((goal) => {
          const Icon = getGoalIcon(goal.category);
          const percentage = (goal.currentAmount / goal.targetAmount) * 100;
          const daysRemaining = getDaysRemaining(goal.targetDate);
          const monthlyTarget = getMonthlyTarget(goal);
          const isCompleted = goal.currentAmount >= goal.targetAmount;
          const isOverdue = daysRemaining < 0;
          
          if (viewMode === 'grid') {
            return (
              <Card key={goal.id} className={`hover:shadow-lg transition-shadow ${isCompleted ? 'border-green-500' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <Icon className={`w-5 h-5 ${isCompleted ? 'text-green-600' : 'text-gray-600'}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{goal.name}</CardTitle>
                        <p className="text-sm text-gray-600 capitalize">{goal.category}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">
                          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(percentage, 100)} 
                        className="h-3"
                      />
                      <div className="flex justify-between text-sm mt-1">
                        <span className={`font-medium ${isCompleted ? 'text-green-600' : 'text-gray-900'}`}>
                          {percentage.toFixed(1)}%
                        </span>
                        {isCompleted && (
                          <Badge className="bg-green-100 text-green-800">
                            Completed!
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Target:</span>
                      <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                        {new Date(goal.targetDate).toLocaleDateString()}
                      </span>
                      {!isCompleted && (
                        <Badge variant={isOverdue ? 'destructive' : 'secondary'}>
                          {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
                        </Badge>
                      )}
                    </div>

                    {/* Monthly Target */}
                    {!isCompleted && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-600 font-medium">Monthly Target</span>
                          <span className="text-lg font-bold text-blue-700">
                            {formatCurrency(monthlyTarget)}
                          </span>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                          To reach your goal on time
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        Add Money
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          } else {
            // List view
            return (
              <Card key={goal.id} className={`hover:shadow-md transition-shadow ${isCompleted ? 'border-green-500' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <Icon className={`w-5 h-5 ${isCompleted ? 'text-green-600' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-lg">{goal.name}</h3>
                          <Badge variant="outline" className="capitalize">{goal.category}</Badge>
                          {isCompleted && (
                            <Badge className="bg-green-100 text-green-800">Completed!</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <span>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
                          <span>•</span>
                          <span>{percentage.toFixed(1)}% complete</span>
                          <span>•</span>
                          <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                          {!isCompleted && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-blue-600">
                                {formatCurrency(monthlyTarget)}/month needed
                              </span>
                            </>
                          )}
                        </div>
                        <Progress value={Math.min(percentage, 100)} className="h-2 mt-2" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">Add Money</Button>
                      <Button size="sm" variant="outline">Details</Button>
                      <Button size="sm" variant="ghost">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }
        })}
      </div>

      {goals.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Savings Goals Yet</h3>
            <p className="text-gray-600 mb-4">Start building your financial future by setting your first savings goal.</p>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

SavingsGoalsTab.displayName = 'SavingsGoalsTab';