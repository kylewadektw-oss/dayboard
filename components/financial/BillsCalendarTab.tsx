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
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Plus,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Home,
  Wifi,
  Car,
  Phone,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  type LucideIcon
} from 'lucide-react';

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: 'utilities' | 'housing' | 'transportation' | 'communication' | 'subscription' | 'insurance';
  status: 'upcoming' | 'due' | 'overdue' | 'paid';
  autopay: boolean;
  recurring: 'monthly' | 'quarterly' | 'annually';
}

// Mock bills data
const mockBills: Bill[] = [
  {
    id: '1',
    name: 'Mortgage Payment',
    amount: 2450,
    dueDate: '2025-09-15',
    category: 'housing',
    status: 'upcoming',
    autopay: true,
    recurring: 'monthly'
  },
  {
    id: '2', 
    name: 'Electric Bill',
    amount: 125,
    dueDate: '2025-09-18',
    category: 'utilities',
    status: 'upcoming',
    autopay: false,
    recurring: 'monthly'
  },
  {
    id: '3',
    name: 'Internet Service',
    amount: 89,
    dueDate: '2025-09-20',
    category: 'communication',
    status: 'upcoming',
    autopay: true,
    recurring: 'monthly'
  },
  {
    id: '4',
    name: 'Car Payment',
    amount: 385,
    dueDate: '2025-09-12',
    category: 'transportation',
    status: 'due',
    autopay: false,
    recurring: 'monthly'
  },
  {
    id: '5',
    name: 'Phone Bill',
    amount: 145,
    dueDate: '2025-09-10',
    category: 'communication',
    status: 'overdue',
    autopay: false,
    recurring: 'monthly'
  },
  {
    id: '6',
    name: 'Netflix',
    amount: 17,
    dueDate: '2025-09-08',
    category: 'subscription',
    status: 'paid',
    autopay: true,
    recurring: 'monthly'
  }
];

export const BillsCalendarTab = memo(() => {
  const bills = mockBills;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, LucideIcon> = {
      'utilities': Zap,
      'housing': Home,
      'transportation': Car,
      'communication': Phone,
      'subscription': Wifi,
      'insurance': CreditCard,
      'default': DollarSign
    };
    return iconMap[category] || iconMap.default;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'due': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return CheckCircle;
      case 'upcoming': return Clock;
      case 'due': return AlertTriangle;
      case 'overdue': return AlertTriangle;
      default: return Clock;
    }
  };

  // Calculate calendar days
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const calendarDays = [];
  // Add empty cells for days before the month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const getBillsForDay = (day: number) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return bills.filter(bill => bill.dueDate === dateStr);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Summary stats
  const totalMonthlyBills = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const overdueBills = bills.filter(bill => bill.status === 'overdue');
  const dueTodayBills = bills.filter(bill => {
    const today = new Date().toISOString().split('T')[0];
    return bill.dueDate === today && bill.status !== 'paid';
  });
  const autopayBills = bills.filter(bill => bill.autopay);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bills & Payments</h2>
          <p className="text-gray-600">Track due dates and manage recurring payments</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 text-sm ${viewMode === 'calendar' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
            >
              Calendar
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
            Add Bill
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Total</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(totalMonthlyBills)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-lg font-bold text-red-600">{overdueBills.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Due Today</p>
                <p className="text-lg font-bold text-yellow-600">{dueTodayBills.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Autopay</p>
                <p className="text-lg font-bold text-green-600">{autopayBills.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {viewMode === 'calendar' ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {monthNames[month]} {year}
              </CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={previousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={index} className="p-2 h-20"></div>;
                }
                
                const dayBills = getBillsForDay(day);
                const today = new Date();
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                
                return (
                  <div key={day} className={`p-2 h-20 border rounded-lg ${isToday ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}`}>
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayBills.slice(0, 2).map(bill => {
                        const Icon = getCategoryIcon(bill.category);
                        return (
                          <div key={bill.id} className={`text-xs p-1 rounded flex items-center gap-1 ${getStatusColor(bill.status)}`}>
                            <Icon className="w-3 h-3" />
                            <span className="truncate">{bill.name}</span>
                          </div>
                        );
                      })}
                      {dayBills.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayBills.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* List View */
        <div className="space-y-4">
          {bills.map(bill => {
            const Icon = getCategoryIcon(bill.category);
            const StatusIcon = getStatusIcon(bill.status);
            const isOverdue = bill.status === 'overdue';
            const isDueToday = bill.dueDate === new Date().toISOString().split('T')[0] && bill.status !== 'paid';
            
            return (
              <Card key={bill.id} className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-red-200' : isDueToday ? 'border-yellow-200' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-medium text-lg">{bill.name}</h3>
                          <Badge className={getStatusColor(bill.status)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {bill.status}
                          </Badge>
                          {bill.autopay && (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              AutoPay
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Due: {new Date(bill.dueDate).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="capitalize">{bill.category}</span>
                          <span>•</span>
                          <span className="capitalize">{bill.recurring}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(bill.amount)}</p>
                      </div>
                      <div className="flex gap-2">
                        {bill.status !== 'paid' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Mark Paid
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="p-4 h-auto flex-col gap-2">
              <Calendar className="w-6 h-6" />
              <span>Set Reminders</span>
            </Button>
            <Button variant="outline" className="p-4 h-auto flex-col gap-2">
              <CreditCard className="w-6 h-6" />
              <span>Setup AutoPay</span>
            </Button>
            <Button variant="outline" className="p-4 h-auto flex-col gap-2">
              <DollarSign className="w-6 h-6" />
              <span>Payment History</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

BillsCalendarTab.displayName = 'BillsCalendarTab';