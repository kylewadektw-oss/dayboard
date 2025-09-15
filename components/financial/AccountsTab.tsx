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
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Plus,
  Building,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Percent,
  PiggyBank,
  Wallet,
  type LucideIcon
} from 'lucide-react';

interface FinancialAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'loan';
  institution: string;
  balance: number;
  availableCredit?: number;
  creditLimit?: number;
  interestRate?: number;
  lastUpdated: string;
  status: 'active' | 'inactive' | 'warning';
  accountNumber: string;
}

// Mock accounts data
const mockAccounts: FinancialAccount[] = [
  {
    id: '1',
    name: 'Primary Checking',
    type: 'checking',
    institution: 'First National Bank',
    balance: 3247.82,
    lastUpdated: '2025-09-13',
    status: 'active',
    accountNumber: '****1234'
  },
  {
    id: '2',
    name: 'High-Yield Savings',
    type: 'savings',
    institution: 'Online Savings Bank',
    balance: 15420.50,
    interestRate: 4.5,
    lastUpdated: '2025-09-13',
    status: 'active',
    accountNumber: '****5678'
  },
  {
    id: '3',
    name: 'Emergency Fund',
    type: 'savings',
    institution: 'First National Bank',
    balance: 8750.00,
    interestRate: 2.1,
    lastUpdated: '2025-09-12',
    status: 'active',
    accountNumber: '****9012'
  },
  {
    id: '4',
    name: 'Rewards Credit Card',
    type: 'credit',
    institution: 'Credit Union',
    balance: -1240.55,
    availableCredit: 8759.45,
    creditLimit: 10000,
    interestRate: 18.9,
    lastUpdated: '2025-09-13',
    status: 'active',
    accountNumber: '****3456'
  },
  {
    id: '5',
    name: 'Investment Portfolio',
    type: 'investment',
    institution: 'Investment Firm',
    balance: 42350.75,
    lastUpdated: '2025-09-12',
    status: 'active',
    accountNumber: '****7890'
  },
  {
    id: '6',
    name: 'Car Loan',
    type: 'loan',
    institution: 'Auto Finance Corp',
    balance: -14250.00,
    interestRate: 5.2,
    lastUpdated: '2025-09-10',
    status: 'active',
    accountNumber: '****2468'
  }
];

export const AccountsTab = memo(() => {
  const accounts = mockAccounts;
  const [hideBalances, setHideBalances] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');

  const formatCurrency = (amount: number) => {
    if (hideBalances) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const getAccountIcon = (type: string) => {
    const iconMap: Record<string, LucideIcon> = {
      'checking': Wallet,
      'savings': PiggyBank,
      'credit': CreditCard,
      'investment': TrendingUp,
      'loan': Building,
      'default': DollarSign
    };
    return iconMap[type] || iconMap.default;
  };

  const getAccountColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'checking': 'bg-blue-100 text-blue-800',
      'savings': 'bg-green-100 text-green-800',
      'credit': 'bg-purple-100 text-purple-800',
      'investment': 'bg-yellow-100 text-yellow-800',
      'loan': 'bg-red-100 text-red-800'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'inactive': return AlertTriangle;
      default: return CheckCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'inactive': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredAccounts = selectedType === 'all' 
    ? accounts 
    : accounts.filter(account => account.type === selectedType);

  // Calculate summary stats
  const totalAssets = accounts
    .filter(acc => ['checking', 'savings', 'investment'].includes(acc.type))
    .reduce((sum, acc) => sum + acc.balance, 0);

  const totalDebt = accounts
    .filter(acc => ['credit', 'loan'].includes(acc.type))
    .reduce((sum, acc) => sum + Math.abs(acc.balance), 0);

  const netWorth = totalAssets - totalDebt;

  const accountTypes = [
    { value: 'all', label: 'All Accounts' },
    { value: 'checking', label: 'Checking' },
    { value: 'savings', label: 'Savings' },
    { value: 'credit', label: 'Credit Cards' },
    { value: 'investment', label: 'Investments' },
    { value: 'loan', label: 'Loans' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Accounts</h2>
          <p className="text-gray-600">Monitor all your bank accounts, credit cards, and investments</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setHideBalances(!hideBalances)}
            className="flex items-center gap-2"
          >
            {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {hideBalances ? 'Show' : 'Hide'} Balances
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Assets</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(totalAssets)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Debt</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(totalDebt)}</p>
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
                <p className="text-sm text-gray-600">Net Worth</p>
                <p className={`text-lg font-bold ${netWorth >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(netWorth)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Type Filter */}
      <div className="flex gap-2 overflow-x-auto">
        {accountTypes.map(type => (
          <Button
            key={type.value}
            variant={selectedType === type.value ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedType(type.value)}
            className="whitespace-nowrap"
          >
            {type.label}
          </Button>
        ))}
      </div>

      {/* Accounts List */}
      <div className="space-y-4">
        {filteredAccounts.map(account => {
          const Icon = getAccountIcon(account.type);
          const StatusIcon = getStatusIcon(account.status);
          const isDebt = account.balance < 0;
          const creditUsage = account.type === 'credit' && account.creditLimit 
            ? ((Math.abs(account.balance) / account.creditLimit) * 100) 
            : 0;

          return (
            <Card key={account.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <Icon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-lg">{account.name}</h3>
                        <Badge className={getAccountColor(account.type)}>
                          {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                        </Badge>
                        <StatusIcon className={`w-4 h-4 ${getStatusColor(account.status)}`} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{account.institution}</span>
                        <span>•</span>
                        <span>{account.accountNumber}</span>
                        <span>•</span>
                        <span>Updated {new Date(account.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="mb-2">
                      <p className={`text-xl font-bold ${isDebt ? 'text-red-600' : 'text-green-600'}`}>
                        {isDebt ? '-' : ''}{formatCurrency(account.balance)}
                      </p>
                      {account.type === 'credit' && account.creditLimit && (
                        <p className="text-sm text-gray-600">
                          Available: {formatCurrency(account.availableCredit || 0)}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        Transactions
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {account.interestRate && (
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Interest:</span>
                        <span className="font-medium">{account.interestRate}%</span>
                      </div>
                    )}
                    
                    {account.type === 'credit' && account.creditLimit && (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Utilization:</span>
                        <span className={`font-medium ${creditUsage > 70 ? 'text-red-600' : creditUsage > 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {creditUsage.toFixed(1)}%
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Last Update:</span>
                      <span className="font-medium">{new Date(account.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAccounts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Accounts Found</h3>
            <p className="text-gray-600 mb-4">
              {selectedType === 'all' 
                ? 'Start by adding your bank accounts, credit cards, and investments.'
                : `No ${selectedType} accounts found. Try a different filter or add a new account.`
              }
            </p>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Account
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

AccountsTab.displayName = 'AccountsTab';