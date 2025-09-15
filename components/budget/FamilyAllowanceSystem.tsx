import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  Coins,
  Star,
  Gift,
  TrendingUp,
  DollarSign,
  Award,
  CheckCircle,
  Clock,
  Sparkles,
  Target,
  BookOpen
} from 'lucide-react';
import { mockAllowanceAccounts } from '@/fixtures/budget-data';
import type { AllowanceAccount, AllowanceTransaction } from '@/types/budget';

// Mock household members data
const mockHouseholdMembers = [
  { id: 'child1', name: 'Emma', age: 8, avatar: '👧', color: 'bg-pink-500' },
  { id: 'child2', name: 'Jacob', age: 10, avatar: '👦', color: 'bg-blue-500' },
];

// Mock chores data
const mockChores = [
  { id: 'chore1', name: 'Clean Kitchen', points: 10, difficulty: 'Medium' },
  { id: 'chore2', name: 'Take Out Trash', points: 5, difficulty: 'Easy' },
  { id: 'chore3', name: 'Organize Bedroom', points: 7, difficulty: 'Easy' },
  { id: 'chore4', name: 'Vacuum Living Room', points: 8, difficulty: 'Medium' },
  { id: 'chore5', name: 'Load Dishwasher', points: 6, difficulty: 'Easy' },
];

// Mock rewards data
const mockRewards = [
  { id: 'reward1', name: 'Extra Screen Time (30 min)', cost: 10, category: 'privileges', icon: '📱' },
  { id: 'reward2', name: 'Special Dessert', cost: 15, category: 'treats', icon: '🍦' },
  { id: 'reward3', name: 'Movie Night Choice', cost: 20, category: 'privileges', icon: '🎬' },
  { id: 'reward4', name: 'New Book', cost: 25, category: 'educational', icon: '📚' },
  { id: 'reward5', name: 'Toy Store Visit ($20)', cost: 40, category: 'monetary', icon: '🧸' },
];

const FamilyAllowanceSystem = () => {
  const [allowanceAccounts, setAllowanceAccounts] = useState<AllowanceAccount[]>(mockAllowanceAccounts);
  const [selectedChild, setSelectedChild] = useState<string>('child1');
  const [showEarnForm, setShowEarnForm] = useState(false);
  const [showSpendForm, setShowSpendForm] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getChildData = (childId: string) => {
    return mockHouseholdMembers.find(child => child.id === childId);
  };

  const getChildAccount = (childId: string) => {
    return allowanceAccounts.find(account => account.householdMemberId === childId);
  };

  const handleEarnPoints = (choreId: string, points: number) => {
    const chore = mockChores.find(c => c.id === choreId);
    
    const newTransaction: AllowanceTransaction = {
      id: `allow_tx_${Date.now()}`,
      allowanceAccountId: `allow${selectedChild === 'child1' ? '1' : '2'}`,
      amount: points * 0.50, // 50 cents per point
      type: 'earned',
      description: chore?.name || 'Completed chore',
      date: new Date().toISOString().split('T')[0],
      choreId,
      parentApproved: true
    };

    setAllowanceAccounts(accounts => accounts.map(account => {
      if (account.householdMemberId === selectedChild) {
        return {
          ...account,
          balance: account.balance + newTransaction.amount,
          totalEarned: account.totalEarned + newTransaction.amount,
          chorePoints: account.chorePoints + points,
          transactions: [newTransaction, ...account.transactions]
        };
      }
      return account;
    }));

    setShowEarnForm(false);
  };

  const handleSpendReward = (rewardId: string, amount: number) => {
    const reward = mockRewards.find(r => r.id === rewardId);
    
    const newTransaction: AllowanceTransaction = {
      id: `allow_tx_${Date.now()}`,
      allowanceAccountId: `allow${selectedChild === 'child1' ? '1' : '2'}`,
      amount: amount,
      type: 'spent',
      description: reward?.name || 'Reward purchase',
      date: new Date().toISOString().split('T')[0],
      parentApproved: true
    };

    setAllowanceAccounts(accounts => accounts.map(account => {
      if (account.householdMemberId === selectedChild && account.balance >= amount) {
        return {
          ...account,
          balance: account.balance - amount,
          totalSpent: account.totalSpent + amount,
          transactions: [newTransaction, ...account.transactions]
        };
      }
      return account;
    }));

    setShowSpendForm(false);
  };

  const selectedChildData = getChildData(selectedChild);
  const selectedChildAccount = getChildAccount(selectedChild);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Family Allowance System</h1>
          <p className="text-gray-600">Track chores, earnings, and teach financial responsibility</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setShowEarnForm(!showEarnForm)}
            className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
          >
            <Star className="h-4 w-4" />
            <span>Award Points</span>
          </Button>
          <Button 
            onClick={() => setShowSpendForm(!showSpendForm)}
            className="bg-purple-600 hover:bg-purple-700 flex items-center space-x-2"
          >
            <Gift className="h-4 w-4" />
            <span>Redeem Reward</span>
          </Button>
        </div>
      </div>

      {/* Child Selection Tabs */}
      <div className="flex space-x-2">
        {mockHouseholdMembers.map(child => {
          const account = getChildAccount(child.id);
          return (
            <Button
              key={child.id}
              onClick={() => setSelectedChild(child.id)}
              className={`flex items-center space-x-2 ${
                selectedChild === child.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{child.avatar}</span>
              <div className="text-left">
                <div className="font-medium">{child.name}</div>
                <div className="text-xs opacity-75">
                  {account ? formatCurrency(account.balance) : '$0.00'}
                </div>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Selected Child Overview */}
      {selectedChildData && selectedChildAccount && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Balance</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedChildAccount.balance)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chore Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chore Points</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedChildAccount.chorePoints}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earned</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(selectedChildAccount.totalEarned)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(selectedChildAccount.totalSpent)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Gift className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Earn Points Form */}
      {showEarnForm && (
        <Card>
            <CardHeader>
              <CardTitle>Award Chore Points</CardTitle>
            </CardHeader>
            <CardContent>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2 text-green-600" />
              Award Chore Points to {selectedChildData?.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockChores.map(chore => (
                <div key={chore.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{chore.name}</h4>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                      {chore.points} pts
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Difficulty: {chore.difficulty}</p>
                  <p className="text-sm text-green-600 mb-3">
                    Earns: {formatCurrency(chore.points * 0.5)}
                  </p>
                  <Button 
                    onClick={() => handleEarnPoints(chore.id, chore.points)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Award Points
                  </Button>
                </div>
              ))}
            </div>
            </CardContent>
          </Card>
      )}

      {/* Spend Points Form */}
      {showSpendForm && selectedChildAccount && (
        <Card>
            <CardHeader>
              <CardTitle>Reward Store</CardTitle>
            </CardHeader>
            <CardContent>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Gift className="h-5 w-5 mr-2 text-purple-600" />
              Reward Store for {selectedChildData?.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockRewards.map(reward => {
                const canAfford = selectedChildAccount.balance >= reward.cost;
                return (
                  <div key={reward.id} className={`border rounded-lg p-4 ${canAfford ? 'hover:bg-green-50' : 'opacity-60'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{reward.icon}</span>
                        <h4 className="font-medium">{reward.name}</h4>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 capitalize">{reward.category}</p>
                    <p className="text-sm font-semibold mb-3">
                      Cost: <span className="text-purple-600">${reward.cost}</span>
                    </p>
                    <Button 
                      onClick={() => handleSpendReward(reward.id, reward.cost)}
                      disabled={!canAfford}
                      className={`w-full ${canAfford ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'}`}
                    >
                      {canAfford ? 'Redeem' : 'Need More Money'}
                    </Button>
                  </div>
                );
              })}
            </div>
            </CardContent>
          </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Chores */}
        <Card>
            <CardHeader>
              <CardTitle>Available Chores</CardTitle>
            </CardHeader>
            <CardContent>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Available Chores
            </h3>
            <div className="space-y-3">
              {mockChores.map(chore => (
                <div key={chore.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{chore.name}</h4>
                      <p className="text-sm text-gray-600">Difficulty: {chore.difficulty}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm flex items-center">
                      <Coins className="h-3 w-3 mr-1" />
                      {chore.points} pts
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      = {formatCurrency(chore.points * 0.5)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            </CardContent>
          </Card>

        {/* Recent Transactions */}
        <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-600" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {allowanceAccounts.flatMap(account => 
                account.transactions.map(transaction => {
                  const child = getChildData(account.householdMemberId);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{child?.avatar}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                          <p className="text-sm text-gray-600">
                            {child?.name} • {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-semibold ${
                          transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'earned' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                        <div className="flex items-center mt-1">
                          {transaction.parentApproved ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ).slice(0, 8)}
            </div>
            </CardContent>
          </Card>
      </div>

      {/* Financial Education Tips */}
      <Card>
            <CardHeader>
              <CardTitle>Financial Education Corner</CardTitle>
            </CardHeader>
            <CardContent>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
            Financial Education Corner
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Saving</h4>
              </div>
              <p className="text-sm text-blue-700">
                &quot;Save some money from every allowance to reach your bigger goals faster!&quot;
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-900">Earning</h4>
              </div>
              <p className="text-sm text-green-700">
                &quot;Complete chores consistently to build good habits and earn more!&quot;
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-purple-900">Spending</h4>
              </div>
              <p className="text-sm text-purple-700">
                &quot;Think before you spend - is this something you really want or need?&quot;
              </p>
            </div>
          </div>
            </CardContent>
          </Card>
    </div>
  );
};

export default FamilyAllowanceSystem;