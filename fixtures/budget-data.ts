import type { 
  BudgetCategory, 
  Transaction, 
  BudgetPeriod, 
  SavingsGoal, 
  AllowanceAccount, 
  BudgetInsight,
  RecurringTransaction,
  BudgetSettings
} from '@/types/budget';

// Mock Budget Categories
export const mockBudgetCategories: BudgetCategory[] = [
  {
    id: 'housing',
    name: 'Housing',
    icon: '🏠',
    color: 'bg-blue-500',
    budgetAmount: 2500,
    spentAmount: 2450,
    isCustom: false,
    subcategories: [
      { id: 'rent', name: 'Rent/Mortgage', icon: '🏡', color: 'bg-blue-400', budgetAmount: 2000, spentAmount: 2000, isCustom: false },
      { id: 'utilities', name: 'Utilities', icon: '⚡', color: 'bg-blue-300', budgetAmount: 300, spentAmount: 285, isCustom: false },
      { id: 'maintenance', name: 'Maintenance', icon: '🔧', color: 'bg-blue-200', budgetAmount: 200, spentAmount: 165, isCustom: false }
    ]
  },
  {
    id: 'food',
    name: 'Food & Dining',
    icon: '🍽️',
    color: 'bg-green-500',
    budgetAmount: 800,
    spentAmount: 720,
    isCustom: false,
    subcategories: [
      { id: 'groceries', name: 'Groceries', icon: '🛒', color: 'bg-green-400', budgetAmount: 600, spentAmount: 540, isCustom: false },
      { id: 'restaurants', name: 'Restaurants', icon: '🍕', color: 'bg-green-300', budgetAmount: 150, spentAmount: 130, isCustom: false },
      { id: 'takeout', name: 'Takeout/Delivery', icon: '🥡', color: 'bg-green-200', budgetAmount: 50, spentAmount: 50, isCustom: false }
    ]
  },
  {
    id: 'transportation',
    name: 'Transportation',
    icon: '🚗',
    color: 'bg-yellow-500',
    budgetAmount: 600,
    spentAmount: 520,
    isCustom: false,
    subcategories: [
      { id: 'gas', name: 'Gas', icon: '⛽', color: 'bg-yellow-400', budgetAmount: 200, spentAmount: 180, isCustom: false },
      { id: 'insurance', name: 'Car Insurance', icon: '🛡️', color: 'bg-yellow-300', budgetAmount: 150, spentAmount: 150, isCustom: false },
      { id: 'maintenance_car', name: 'Car Maintenance', icon: '🔧', color: 'bg-yellow-200', budgetAmount: 250, spentAmount: 190, isCustom: false }
    ]
  },
  {
    id: 'kids',
    name: 'Kids & Family',
    icon: '👨‍👩‍👧‍👦',
    color: 'bg-purple-500',
    budgetAmount: 500,
    spentAmount: 420,
    isCustom: false,
    subcategories: [
      { id: 'childcare', name: 'Childcare', icon: '🏫', color: 'bg-purple-400', budgetAmount: 200, spentAmount: 200, isCustom: false },
      { id: 'activities', name: 'Activities', icon: '⚽', color: 'bg-purple-300', budgetAmount: 150, spentAmount: 120, isCustom: false },
      { id: 'allowance', name: 'Allowance', icon: '💰', color: 'bg-purple-200', budgetAmount: 150, spentAmount: 100, isCustom: false }
    ]
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: '🎬',
    color: 'bg-pink-500',
    budgetAmount: 300,
    spentAmount: 240,
    isCustom: false
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    icon: '💊',
    color: 'bg-red-500',
    budgetAmount: 400,
    spentAmount: 320,
    isCustom: false
  },
  {
    id: 'savings',
    name: 'Savings & Goals',
    icon: '🏦',
    color: 'bg-indigo-500',
    budgetAmount: 1000,
    spentAmount: 1000,
    isCustom: false
  }
];

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: 'tx1',
    amount: 2000,
    description: 'Mortgage Payment',
    categoryId: 'rent',
    type: 'expense',
    date: '2025-09-01',
    paymentMethod: 'transfer',
    isRecurring: true,
    tags: ['housing', 'monthly'],
    notes: 'Monthly mortgage payment'
  },
  {
    id: 'tx2',
    amount: 5200,
    description: 'Salary Deposit',
    categoryId: 'income',
    type: 'income',
    date: '2025-09-01',
    paymentMethod: 'transfer',
    isRecurring: true,
    tags: ['salary', 'monthly'],
    notes: 'Monthly salary'
  },
  {
    id: 'tx3',
    amount: 145.67,
    description: 'Whole Foods Grocery',
    categoryId: 'groceries',
    type: 'expense',
    date: '2025-09-10',
    paymentMethod: 'credit',
    isRecurring: false,
    householdMemberId: 'parent1',
    tags: ['groceries', 'weekly'],
    notes: 'Weekly grocery shopping'
  },
  {
    id: 'tx4',
    amount: 45.30,
    description: 'Target Household Items',
    categoryId: 'groceries',
    type: 'expense',
    date: '2025-09-08',
    paymentMethod: 'debit',
    isRecurring: false,
    householdMemberId: 'parent2',
    tags: ['household', 'supplies']
  },
  {
    id: 'tx5',
    amount: 65.00,
    description: 'Pizza Family Night',
    categoryId: 'restaurants',
    type: 'expense',
    date: '2025-09-06',
    paymentMethod: 'credit',
    isRecurring: false,
    householdMemberId: 'parent1',
    tags: ['family', 'dining']
  },
  {
    id: 'tx6',
    amount: 42.50,
    description: 'Gas Station Fill-up',
    categoryId: 'gas',
    type: 'expense',
    date: '2025-09-05',
    paymentMethod: 'credit',
    isRecurring: false,
    tags: ['transportation', 'fuel']
  }
];

// Mock Savings Goals
export const mockSavingsGoals: SavingsGoal[] = [
  {
    id: 'goal1',
    name: 'Hawaii Family Vacation',
    targetAmount: 8000,
    currentAmount: 3200,
    targetDate: '2026-06-01',
    category: 'vacation',
    icon: '🏝️',
    color: 'bg-blue-500',
    monthlyContribution: 400,
    isActive: true
  },
  {
    id: 'goal2',
    name: 'Emergency Fund',
    targetAmount: 15000,
    currentAmount: 12500,
    targetDate: '2025-12-31',
    category: 'emergency',
    icon: '🚨',
    color: 'bg-red-500',
    monthlyContribution: 500,
    isActive: true
  },
  {
    id: 'goal3',
    name: 'Kids College Fund',
    targetAmount: 50000,
    currentAmount: 18500,
    targetDate: '2035-08-01',
    category: 'education',
    icon: '🎓',
    color: 'bg-purple-500',
    monthlyContribution: 300,
    isActive: true
  },
  {
    id: 'goal4',
    name: 'New Car Down Payment',
    targetAmount: 5000,
    currentAmount: 2100,
    targetDate: '2026-03-01',
    category: 'purchase',
    icon: '🚗',
    color: 'bg-green-500',
    monthlyContribution: 250,
    isActive: true
  }
];

// Mock Allowance Accounts
export const mockAllowanceAccounts: AllowanceAccount[] = [
  {
    id: 'allow1',
    householdMemberId: 'child1',
    balance: 45.50,
    totalEarned: 180.00,
    totalSpent: 134.50,
    chorePoints: 23,
    allowanceRate: 0.50, // 50 cents per point
    transactions: [
      {
        id: 'allow_tx1',
        allowanceAccountId: 'allow1',
        amount: 5.00,
        type: 'earned',
        description: 'Completed kitchen cleanup',
        date: '2025-09-10',
        choreId: 'chore1',
        parentApproved: true
      },
      {
        id: 'allow_tx2',
        allowanceAccountId: 'allow1',
        amount: 2.50,
        type: 'earned',
        description: 'Took out trash',
        date: '2025-09-09',
        choreId: 'chore2',
        parentApproved: true
      },
      {
        id: 'allow_tx3',
        allowanceAccountId: 'allow1',
        amount: 15.00,
        type: 'spent',
        description: 'Toy purchase at Target',
        date: '2025-09-08',
        parentApproved: true
      }
    ]
  },
  {
    id: 'allow2',
    householdMemberId: 'child2',
    balance: 28.00,
    totalEarned: 95.00,
    totalSpent: 67.00,
    chorePoints: 19,
    allowanceRate: 0.50,
    transactions: [
      {
        id: 'allow_tx4',
        allowanceAccountId: 'allow2',
        amount: 3.50,
        type: 'earned',
        description: 'Organized bedroom',
        date: '2025-09-11',
        choreId: 'chore3',
        parentApproved: true
      },
      {
        id: 'allow_tx5',
        allowanceAccountId: 'allow2',
        amount: 12.00,
        type: 'spent',
        description: 'Books at bookstore',
        date: '2025-09-07',
        parentApproved: true
      }
    ]
  }
];

// Mock Budget Insights
export const mockBudgetInsights: BudgetInsight[] = [
  {
    id: 'insight1',
    type: 'overspend',
    title: 'Food Budget Alert',
    description: 'You\'ve spent 90% of your food budget with 20 days left in the month.',
    priority: 'medium',
    actionable: true,
    date: '2025-09-12',
    categoryId: 'food'
  },
  {
    id: 'insight2',
    type: 'savings_opportunity',
    title: 'Transportation Savings',
    description: 'You\'re under budget on transportation this month! Consider moving $80 to savings.',
    priority: 'low',
    actionable: true,
    date: '2025-09-12',
    categoryId: 'transportation'
  },
  {
    id: 'insight3',
    type: 'goal_progress',
    title: 'Emergency Fund Progress',
    description: 'Great job! You\'re 83% of the way to your emergency fund goal.',
    priority: 'low',
    actionable: false,
    date: '2025-09-12',
    savingsGoalId: 'goal2'
  },
  {
    id: 'insight4',
    type: 'bill_reminder',
    title: 'Car Insurance Due',
    description: 'Your car insurance payment of $150 is due in 3 days.',
    priority: 'high',
    actionable: true,
    date: '2025-09-12',
    categoryId: 'insurance'
  }
];

// Mock Recurring Transactions
export const mockRecurringTransactions: RecurringTransaction[] = [
  {
    id: 'recurring1',
    amount: 2000,
    description: 'Mortgage Payment',
    categoryId: 'rent',
    type: 'expense',
    frequency: 'monthly',
    nextDueDate: '2025-10-01',
    isActive: true,
    autoProcess: true
  },
  {
    id: 'recurring2',
    amount: 5200,
    description: 'Salary',
    categoryId: 'income',
    type: 'income',
    frequency: 'monthly',
    nextDueDate: '2025-10-01',
    isActive: true,
    autoProcess: true
  },
  {
    id: 'recurring3',
    amount: 150,
    description: 'Car Insurance',
    categoryId: 'insurance',
    type: 'expense',
    frequency: 'monthly',
    nextDueDate: '2025-09-15',
    isActive: true,
    autoProcess: false
  },
  {
    id: 'recurring4',
    amount: 285,
    description: 'Electric Bill',
    categoryId: 'utilities',
    type: 'expense',
    frequency: 'monthly',
    nextDueDate: '2025-09-20',
    isActive: true,
    autoProcess: false
  }
];

// Mock Budget Settings
export const mockBudgetSettings: BudgetSettings = {
  currency: 'USD',
  startOfWeek: 'monday',
  budgetPeriod: 'monthly',
  emergencyFundTarget: 15000,
  allowanceEnabled: true,
  parentalControlsEnabled: true,
  expenseApprovalLimit: 50
};

// Mock Current Budget Period
export const mockCurrentBudgetPeriod: BudgetPeriod = {
  id: 'period_2025_09',
  year: 2025,
  month: 9,
  totalIncome: 5200,
  totalExpenses: 4150,
  totalBudget: 5100,
  categories: mockBudgetCategories,
  transactions: mockTransactions
};

// Utility functions for mock data
export const getBudgetCategoryById = (id: string): BudgetCategory | undefined => {
  for (const category of mockBudgetCategories) {
    if (category.id === id) return category;
    if (category.subcategories) {
      const subcategory = category.subcategories.find(sub => sub.id === id);
      if (subcategory) return subcategory;
    }
  }
  return undefined;
};

export const getTransactionsByCategory = (categoryId: string): Transaction[] => {
  return mockTransactions.filter(transaction => transaction.categoryId === categoryId);
};

export const getMonthlySpendingByCategory = (): { [categoryId: string]: number } => {
  const spending: { [categoryId: string]: number } = {};
  mockTransactions.forEach(transaction => {
    if (transaction.type === 'expense') {
      spending[transaction.categoryId] = (spending[transaction.categoryId] || 0) + transaction.amount;
    }
  });
  return spending;
};

export const getTotalMonthlyIncome = (): number => {
  return mockTransactions
    .filter(transaction => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
};

export const getTotalMonthlyExpenses = (): number => {
  return mockTransactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
};