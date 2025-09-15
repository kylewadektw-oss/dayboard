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
import Button from '@/components/ui/Button';
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  PiggyBank, 
  Calculator,
  Calendar,
  Plus
} from 'lucide-react';

export const FinancialPlanningTab = memo(() => {
  const [activeGoal, setActiveGoal] = useState<string | null>(null);

  const financialGoals = [
    {
      id: '1',
      title: 'Emergency Fund',
      target: 15000,
      current: 8500,
      deadline: '2025-12-31',
      priority: 'high' as const,
      category: 'safety'
    },
    {
      id: '2',
      title: 'Vacation Fund',
      target: 5000,
      current: 2100,
      deadline: '2025-07-01',
      priority: 'medium' as const,
      category: 'lifestyle'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Financial Planning</h2>
        <p className="text-gray-600 mt-1">Plan for your financial future and long-term goals</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Goals</p>
                <p className="text-lg font-semibold">{financialGoals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Goal Value</p>
                <p className="text-lg font-semibold">$20,000</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-lg font-semibold">53%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <PiggyBank className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Savings</p>
                <p className="text-lg font-semibold">$800</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Goals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Financial Goals</CardTitle>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {financialGoals.map((goal) => {
              const progress = (goal.current / goal.target) * 100;
              const isActive = activeGoal === goal.id;
              
              return (
                <div 
                  key={goal.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    isActive ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveGoal(isActive ? null : goal.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        goal.priority === 'high' ? 'bg-red-100' :
                        goal.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                      }`}>
                        <Target className={`w-4 h-4 ${
                          goal.priority === 'high' ? 'text-red-600' :
                          goal.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-medium">{goal.title}</h3>
                        <p className="text-sm text-gray-600">
                          ${goal.current.toLocaleString()} of ${goal.target.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{progress.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">{goal.deadline}</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  
                  {isActive && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Remaining</p>
                          <p className="font-medium">${(goal.target - goal.current).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Monthly Need</p>
                          <p className="font-medium">$350</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Months Left</p>
                          <p className="font-medium">18</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Planning Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Planning Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="justify-start">
              <Calculator className="w-4 h-4 mr-2" />
              Retirement Calculator
            </Button>
            
            <Button variant="outline" className="justify-start">
              <Target className="w-4 h-4 mr-2" />
              Goal Progress Tracker
            </Button>
            
            <Button variant="outline" className="justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Financial Milestones
            </Button>
            
            <Button variant="outline" className="justify-start">
              <TrendingUp className="w-4 h-4 mr-2" />
              Investment Projections
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

FinancialPlanningTab.displayName = 'FinancialPlanningTab';