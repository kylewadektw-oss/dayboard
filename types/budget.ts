// Budget and Financial Management Types

export interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  budgetAmount: number;
  spentAmount: number;
  isCustom: boolean;
  parentCategoryId?: string;
  subcategories?: BudgetCategory[];
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  type: 'income' | 'expense';
  date: string;
  paymentMethod: 'cash' | 'credit' | 'debit' | 'check' | 'transfer';
  isRecurring: boolean;
  householdMemberId?: string;
  receiptUrl?: string;
  tags: string[];
  notes?: string;
}

export interface BudgetPeriod {
  id: string;
  year: number;
  month: number;
  totalIncome: number;
  totalExpenses: number;
  totalBudget: number;
  categories: BudgetCategory[];
  transactions: Transaction[];
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'vacation' | 'emergency' | 'purchase' | 'education' | 'retirement' | 'other' | 'home' | 'car' | 'entertainment' | 'family' | 'gift';
  icon?: string;
  color?: string;
  monthlyContribution: number;
  isActive?: boolean;
  isShared?: boolean;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  createdDate?: string;
  completedDate?: string;
  lastContribution?: string;
  householdMemberId?: string;
}

export interface AllowanceAccount {
  id: string;
  householdMemberId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  chorePoints: number;
  allowanceRate: number; // dollars per point
  transactions: AllowanceTransaction[];
}

export interface AllowanceTransaction {
  id: string;
  allowanceAccountId: string;
  amount: number;
  type: 'earned' | 'spent' | 'bonus' | 'penalty';
  description: string;
  date: string;
  choreId?: string;
  parentApproved: boolean;
}

export interface BudgetInsight {
  id: string;
  type: 'overspend' | 'savings_opportunity' | 'trend' | 'goal_progress' | 'bill_reminder';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  date: string;
  categoryId?: string;
  savingsGoalId?: string;
}

export interface RecurringTransaction {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  type: 'income' | 'expense';
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  nextDueDate: string;
  isActive: boolean;
  autoProcess: boolean;
}

export interface BudgetSettings {
  currency: string;
  startOfWeek: 'sunday' | 'monday';
  budgetPeriod: 'weekly' | 'monthly' | 'yearly';
  emergencyFundTarget: number;
  allowanceEnabled: boolean;
  parentalControlsEnabled: boolean;
  expenseApprovalLimit: number;
}