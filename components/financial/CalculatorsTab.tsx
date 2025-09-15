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
  Calculator, 
  Home, 
  Car, 
  PiggyBank, 
  TrendingUp,
  DollarSign,
  Percent,
  Calendar
} from 'lucide-react';

export const CalculatorsTab = memo(() => {
  const [activeCalculator, setActiveCalculator] = useState<string | null>(null);

  const calculators = [
    {
      id: 'mortgage',
      title: 'Mortgage Calculator',
      description: 'Calculate monthly payments and total interest',
      icon: Home,
      color: 'blue'
    },
    {
      id: 'loan',
      title: 'Loan Calculator',
      description: 'Personal loans, auto loans, and more',
      icon: Car,
      color: 'green'
    },
    {
      id: 'savings',
      title: 'Savings Calculator',
      description: 'Compound interest and savings goals',
      icon: PiggyBank,
      color: 'purple'
    },
    {
      id: 'investment',
      title: 'Investment Calculator',
      description: 'Portfolio growth and returns',
      icon: TrendingUp,
      color: 'orange'
    },
    {
      id: 'retirement',
      title: 'Retirement Calculator',
      description: 'Plan for your retirement needs',
      icon: Calendar,
      color: 'red'
    },
    {
      id: 'tax',
      title: 'Tax Calculator',
      description: 'Estimate taxes and deductions',
      icon: Percent,
      color: 'gray'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600',
      gray: 'bg-gray-100 text-gray-600'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Financial Calculators</h2>
        <p className="text-gray-600 mt-1">Tools to help you make informed financial decisions</p>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {calculators.map((calc) => {
          const Icon = calc.icon;
          const isActive = activeCalculator === calc.id;
          
          return (
            <div
              key={calc.id}
              className={`cursor-pointer transition-all hover:shadow-md rounded-lg ${
                isActive ? 'ring-2 ring-blue-300' : ''
              }`}
              onClick={() => setActiveCalculator(isActive ? null : calc.id)}
            >
              <Card className={isActive ? 'bg-blue-50' : ''}>
                <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${getColorClasses(calc.color)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{calc.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{calc.description}</p>
                  </div>
                </div>
              </CardHeader>
              
              {isActive && (
                <CardContent>
                  <div className="space-y-4">
                    {calc.id === 'mortgage' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Home Price
                          </label>
                          <input 
                            type="number" 
                            placeholder="$400,000"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Down Payment
                          </label>
                          <input 
                            type="number" 
                            placeholder="$80,000"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Interest Rate (%)
                          </label>
                          <input 
                            type="number" 
                            placeholder="6.5"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loan Term (years)
                          </label>
                          <input 
                            type="number" 
                            placeholder="30"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <Button className="w-full">
                          Calculate Payment
                        </Button>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-700">Monthly Payment: <span className="font-semibold">$2,108</span></p>
                        </div>
                      </div>
                    )}
                    
                    {calc.id === 'savings' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Initial Amount
                          </label>
                          <input 
                            type="number" 
                            placeholder="$1,000"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Monthly Contribution
                          </label>
                          <input 
                            type="number" 
                            placeholder="$500"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Interest Rate (%)
                          </label>
                          <input 
                            type="number" 
                            placeholder="4.5"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Time Period (years)
                          </label>
                          <input 
                            type="number" 
                            placeholder="10"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <Button className="w-full">
                          Calculate Growth
                        </Button>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700">Future Value: <span className="font-semibold">$75,420</span></p>
                        </div>
                      </div>
                    )}
                    
                    {(calc.id !== 'mortgage' && calc.id !== 'savings') && (
                      <div className="text-center py-8">
                        <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">Calculator coming soon</p>
                        <p className="text-sm text-gray-400">Advanced {calc.title.toLowerCase()} features</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                )}
              </Card>
            </div>
          );
        })}
      </div>      {/* Quick Calculations */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Calculations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-4 bg-blue-50 rounded-lg mb-3">
                <DollarSign className="w-8 h-8 text-blue-600 mx-auto" />
              </div>
              <h3 className="font-medium mb-2">Debt-to-Income Ratio</h3>
              <p className="text-2xl font-bold text-blue-600">28%</p>
              <p className="text-sm text-gray-600">Good financial health</p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-green-50 rounded-lg mb-3">
                <PiggyBank className="w-8 h-8 text-green-600 mx-auto" />
              </div>
              <h3 className="font-medium mb-2">Emergency Fund</h3>
              <p className="text-2xl font-bold text-green-600">4.2</p>
              <p className="text-sm text-gray-600">Months of expenses</p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-purple-50 rounded-lg mb-3">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto" />
              </div>
              <h3 className="font-medium mb-2">Savings Rate</h3>
              <p className="text-2xl font-bold text-purple-600">15%</p>
              <p className="text-sm text-gray-600">Of gross income</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips & Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">💡 Mortgage Tip</h4>
              <p className="text-sm text-blue-700">Consider a 15-year mortgage if you can afford higher payments - you&apos;ll save significantly on interest.</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">💰 Savings Tip</h4>
              <p className="text-sm text-green-700">Start with the emergency fund before investing. Aim for 3-6 months of expenses.</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">📈 Investment Tip</h4>
              <p className="text-sm text-purple-700">Dollar-cost averaging helps reduce the impact of market volatility on your investments.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

CalculatorsTab.displayName = 'CalculatorsTab';