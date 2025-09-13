import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  Target,
  Plus,
  TrendingUp,
  Calendar,
  DollarSign,
  Gift,
  Home,
  Car,
  Gamepad2,
  Plane,
  GraduationCap,
  Heart,
  Star,
  CheckCircle,
  Trophy,
  Coins,
  Clock,
  Users,
  AlertCircle,
  Zap
} from 'lucide-react';
import { mockSavingsGoals } from '@/fixtures/budget-data';
import type { SavingsGoal } from '@/types/budget';

// Goal category icons mapping
const goalCategoryIcons = {
  vacation: Plane,
  education: GraduationCap,
  entertainment: Gamepad2,
  home: Home,
  emergency: AlertCircle,
  family: Heart,
  car: Car,
  gift: Gift,
  purchase: Gift,
  retirement: TrendingUp,
  other: Target
};

// Goal category colors
const goalCategoryColors = {
  vacation: 'bg-blue-500',
  education: 'bg-purple-500',
  entertainment: 'bg-green-500',
  home: 'bg-orange-500',
  emergency: 'bg-red-500',
  family: 'bg-pink-500',
  car: 'bg-gray-500',
  gift: 'bg-yellow-500',
  purchase: 'bg-yellow-500',
  retirement: 'bg-indigo-500',
  other: 'bg-indigo-500'
};

// Mock household members
const mockHouseholdMembers = [
  { id: 'parent1', name: 'Mom', avatar: '👩', role: 'parent' },
  { id: 'parent2', name: 'Dad', avatar: '👨', role: 'parent' },
  { id: 'child1', name: 'Emma', avatar: '👧', role: 'child' },
  { id: 'child2', name: 'Jacob', avatar: '👦', role: 'child' },
];

const FinancialGoalsTracker = () => {
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(mockSavingsGoals);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'personal' | 'family'>('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProgress = (goal: SavingsGoal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const calculateTimeToGoal = (goal: SavingsGoal) => {
    if (goal.monthlyContribution <= 0) return 'N/A';
    const remaining = goal.targetAmount - goal.currentAmount;
    const monthsRemaining = Math.ceil(remaining / goal.monthlyContribution);
    
    if (monthsRemaining <= 0) return 'Goal Reached!';
    if (monthsRemaining === 1) return '1 month';
    if (monthsRemaining < 12) return `${monthsRemaining} months`;
    
    const years = Math.floor(monthsRemaining / 12);
    const months = monthsRemaining % 12;
    return months > 0 ? `${years}y ${months}m` : `${years} year${years > 1 ? 's' : ''}`;
  };

  const getGoalsByView = () => {
    switch (viewMode) {
      case 'personal':
        return savingsGoals.filter(goal => !goal.isShared);
      case 'family':
        return savingsGoals.filter(goal => goal.isShared);
      default:
        return savingsGoals;
    }
  };

  const handleAddContribution = (goalId: string, amount: number) => {
    setSavingsGoals(goals => goals.map(goal => {
      if (goal.id === goalId) {
        const newAmount = goal.currentAmount + amount;
        const wasCompleted = goal.currentAmount >= goal.targetAmount;
        const isNowCompleted = newAmount >= goal.targetAmount;
        
        return {
          ...goal,
          currentAmount: newAmount,
          lastContribution: new Date().toISOString().split('T')[0],
          // Add achievement if goal just completed
          ...(isNowCompleted && !wasCompleted && {
            completedDate: new Date().toISOString().split('T')[0]
          })
        };
      }
      return goal;
    }));
  };

  const createNewGoal = (goalData: Partial<SavingsGoal>) => {
    const newGoal: SavingsGoal = {
      id: `goal_${Date.now()}`,
      name: goalData.name || '',
      targetAmount: goalData.targetAmount || 0,
      currentAmount: goalData.currentAmount || 0,
      targetDate: goalData.targetDate || '',
      category: goalData.category || 'other',
      isShared: goalData.isShared || false,
      monthlyContribution: goalData.monthlyContribution || 0,
      description: goalData.description || '',
      priority: goalData.priority || 'medium',
      createdDate: new Date().toISOString().split('T')[0],
      householdMemberId: goalData.householdMemberId || 'parent1'
    };

    setSavingsGoals(goals => [newGoal, ...goals]);
    setShowCreateForm(false);
  };

  const filteredGoals = getGoalsByView();
  const completedGoals = filteredGoals.filter(goal => goal.currentAmount >= goal.targetAmount);
  const activeGoals = filteredGoals.filter(goal => goal.currentAmount < goal.targetAmount);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Goals Tracker</h1>
          <p className="text-gray-600">Set, track, and achieve your family's financial dreams</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Goal</span>
          </Button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex space-x-2">
        {(['all', 'personal', 'family'] as const).map(mode => (
          <Button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`capitalize ${
              viewMode === mode 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {mode === 'all' ? 'All Goals' : `${mode} Goals`}
          </Button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
            <CardHeader>
              <CardTitle>Active Goals</CardTitle>
            </CardHeader>
            <CardContent>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Goals</p>
                <p className="text-2xl font-bold text-blue-600">{activeGoals.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </CardContent></Card>

        <Card>
            <CardHeader>
              <CardTitle>Completed Goals</CardTitle>
            </CardHeader>
            <CardContent>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedGoals.length}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </CardContent></Card>

        <Card>
            <CardHeader>
              <CardTitle>Total Saved</CardTitle>
            </CardHeader>
            <CardContent>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Saved</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(filteredGoals.reduce((sum, goal) => sum + goal.currentAmount, 0))}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </CardContent></Card>

        <Card>
            <CardHeader>
              <CardTitle>Target Amount</CardTitle>
            </CardHeader>
            <CardContent>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Target</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(filteredGoals.reduce((sum, goal) => sum + goal.targetAmount, 0))}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </CardContent></Card>
      </div>

      {/* Create Goal Form */}
      {showCreateForm && (
        <Card>
            <CardHeader>
              <CardTitle>Create New Financial Goal</CardTitle>
            </CardHeader>
            <CardContent>
          <div className="p-6">
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createNewGoal({
                name: formData.get('name') as string,
                targetAmount: parseFloat(formData.get('targetAmount') as string),
                targetDate: formData.get('targetDate') as string,
                category: formData.get('category') as SavingsGoal['category'],
                isShared: formData.get('isShared') === 'on',
                monthlyContribution: parseFloat(formData.get('monthlyContribution') as string),
                description: formData.get('description') as string,
                priority: formData.get('priority') as SavingsGoal['priority']
              });
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                  <Input name="name" required placeholder="e.g., Family Vacation" onChange={() => {}} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
                  <Input name="targetAmount" type="number" required placeholder="5000" onChange={() => {}} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                  <Input name="targetDate" type="date" required onChange={() => {}} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Contribution</label>
                  <Input name="monthlyContribution" type="number" placeholder="250" onChange={() => {}} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select name="category" className="w-full p-2 border border-gray-300 rounded-md">
                    <option value="vacation">Vacation</option>
                    <option value="education">Education</option>
                    <option value="emergency">Emergency Fund</option>
                    <option value="home">Home Improvement</option>
                    <option value="car">Vehicle</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="family">Family</option>
                    <option value="gift">Gift</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select name="priority" className="w-full p-2 border border-gray-300 rounded-md">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  name="description" 
                  rows={3} 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Describe your goal..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" name="isShared" id="isShared" className="rounded" />
                <label htmlFor="isShared" className="text-sm text-gray-700">
                  Make this a family goal (visible to all family members)
                </label>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Create Goal
                </Button>
              </div>
            </form>
          </div>
        </CardContent></Card>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGoals.map(goal => {
          const progress = calculateProgress(goal);
          const isCompleted = progress >= 100;
          const timeToGoal = calculateTimeToGoal(goal);
          const CategoryIcon = goalCategoryIcons[goal.category] || Target;
          const categoryColor = goalCategoryColors[goal.category] || 'bg-gray-500';
          const member = mockHouseholdMembers.find(m => m.id === goal.householdMemberId);

          return (
            <Card key={goal.id}>
              <CardHeader>
                <CardTitle>{goal.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Goal Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${categoryColor} rounded-lg flex items-center justify-center`}>
                      <CategoryIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{goal.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        {member && <span>{member.avatar} {member.name}</span>}
                        {goal.isShared && <Users className="h-3 w-3" />}
                      </div>
                    </div>
                  </div>
                  {isCompleted && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <Trophy className="h-4 w-4" />
                      <span className="text-xs font-medium">Completed!</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Amount Info */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Saved</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(goal.currentAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Target</span>
                    <span className="font-semibold">
                      {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Remaining</span>
                    <span className="font-medium text-orange-600">
                      {formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount))}
                    </span>
                  </div>
                </div>

                {/* Goal Details */}
                <div className="space-y-2 mb-4">
                  {goal.targetDate && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-3 w-3" />
                      <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {goal.monthlyContribution > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Coins className="h-3 w-3" />
                      <span>Monthly: {formatCurrency(goal.monthlyContribution)}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>Time to goal: {timeToGoal}</span>
                  </div>
                </div>

                {/* Priority Badge */}
                <div className="mb-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                    goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {goal.priority === 'high' && <Zap className="h-3 w-3 mr-1" />}
                    {(goal.priority || 'medium').charAt(0).toUpperCase() + (goal.priority || 'medium').slice(1)} Priority
                  </span>
                </div>

                {/* Action Buttons */}
                {!isCompleted && (
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input 
                        type="number" 
                        placeholder="Amount" 
                        className="flex-1"
                        id={`contribution-${goal.id}`}
                        onChange={() => {}}
                      />
                      <Button 
                        onClick={() => {
                          const input = document.getElementById(`contribution-${goal.id}`) as HTMLInputElement;
                          const amount = parseFloat(input.value);
                          if (amount > 0) {
                            handleAddContribution(goal.id, amount);
                            input.value = '';
                          }
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Add
                      </Button>
                    </div>
                    {goal.monthlyContribution > 0 && (
                      <Button 
                        onClick={() => handleAddContribution(goal.id, goal.monthlyContribution)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-sm"
                      >
                        Add Monthly ({formatCurrency(goal.monthlyContribution)})
                      </Button>
                    )}
                  </div>
                )}

                {isCompleted && goal.completedDate && (
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-green-800 font-medium">
                      Goal completed on {new Date(goal.completedDate).toLocaleDateString()}!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredGoals.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No financial goals yet</h3>
          <p className="text-gray-600 mb-4">
            Start building your financial future by setting your first goal.
          </p>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Goal
          </Button>
        </div>
      )}

      {/* Achievement Celebrations */}
      {completedGoals.length > 0 && (
        <Card>
            <CardHeader>
              <CardTitle>🎉 Achievements Unlocked</CardTitle>
            </CardHeader>
            <CardContent>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedGoals.map(goal => (
                <div key={goal.id} className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{goal.name}</h4>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(goal.targetAmount)} achieved!
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent></Card>
      )}
    </div>
  );
};

export default FinancialGoalsTracker;