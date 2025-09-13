import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Filter,
  Download,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Receipt
} from 'lucide-react';
import { mockTransactions, mockBudgetCategories } from '@/fixtures/budget-data';
import type { Transaction, BudgetCategory } from '@/types/budget';

const TransactionManagement = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get flat list of all categories and subcategories
  const getAllCategories = (): BudgetCategory[] => {
    const allCategories: BudgetCategory[] = [];
    mockBudgetCategories.forEach(category => {
      allCategories.push(category);
      if (category.subcategories) {
        allCategories.push(...category.subcategories);
      }
    });
    return allCategories;
  };

  const getCategoryById = (id: string): BudgetCategory | undefined => {
    return getAllCategories().find(cat => cat.id === id);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit': return '💳';
      case 'debit': return '🏧';
      case 'cash': return '💵';
      case 'check': return '🏦';
      case 'transfer': return '🔄';
      default: return '💳';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesCategory = filterCategory === 'all' || transaction.categoryId === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const handleCreateTransaction = (formData: FormData) => {
    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      amount: parseFloat(formData.get('amount') as string) || 0,
      description: formData.get('description') as string,
      categoryId: formData.get('categoryId') as string,
      type: formData.get('type') as 'income' | 'expense',
      date: formData.get('date') as string,
      paymentMethod: formData.get('paymentMethod') as any,
      isRecurring: formData.get('isRecurring') === 'on',
      tags: (formData.get('tags') as string || '').split(',').map(tag => tag.trim()).filter(Boolean),
      notes: formData.get('notes') as string || undefined,
    };
    
    setTransactions([newTransaction, ...transactions]);
    setIsCreateDialogOpen(false);
  };

  const handleEditTransaction = (formData: FormData) => {
    if (!editingTransaction) return;
    
    const updatedTransaction: Transaction = {
      ...editingTransaction,
      amount: parseFloat(formData.get('amount') as string) || 0,
      description: formData.get('description') as string,
      categoryId: formData.get('categoryId') as string,
      type: formData.get('type') as 'income' | 'expense',
      date: formData.get('date') as string,
      paymentMethod: formData.get('paymentMethod') as any,
      isRecurring: formData.get('isRecurring') === 'on',
      tags: (formData.get('tags') as string || '').split(',').map(tag => tag.trim()).filter(Boolean),
      notes: formData.get('notes') as string || undefined,
    };
    
    setTransactions(transactions.map(t => 
      t.id === editingTransaction.id ? updatedTransaction : t
    ));
    setEditingTransaction(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    setTransactions(transactions.filter(t => t.id !== transactionId));
  };

  const TransactionForm = ({ transaction, onSubmit }: { transaction?: Transaction, onSubmit: (formData: FormData) => void }) => {
    return (
      <form action={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Transaction Type</Label>
            <Select name="type" defaultValue={transaction?.type || 'expense'}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">💰 Income</SelectItem>
                <SelectItem value="expense">💸 Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="0.00"
                className="pl-10"
                defaultValue={transaction?.amount || ''}
                step="0.01"
                min="0"
                required
                onChange={() => {}}
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
                    <Input
            id="description"
            name="description"
            placeholder="Transaction description"
            defaultValue={transaction?.description || ''}
            required
            onChange={() => {}}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="categoryId">Category</Label>
            <Select name="categoryId" defaultValue={transaction?.categoryId || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {getAllCategories().map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select name="paymentMethod" defaultValue={transaction?.paymentMethod || 'credit'}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">💳 Credit Card</SelectItem>
                <SelectItem value="debit">🏧 Debit Card</SelectItem>
                <SelectItem value="cash">💵 Cash</SelectItem>
                <SelectItem value="check">🏦 Check</SelectItem>
                <SelectItem value="transfer">🔄 Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={transaction?.date || new Date().toISOString().split('T')[0]}
            required
            onChange={() => {}}
          />
        </div>

        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            name="tags"
            placeholder="groceries, weekly, family"
            defaultValue={transaction?.tags.join(', ') || ''}
            onChange={() => {}}
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Additional notes about this transaction"
            defaultValue={transaction?.notes || ''}
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isRecurring"
            name="isRecurring"
            defaultChecked={transaction?.isRecurring || false}
            className="rounded border-gray-300"
          />
          <Label htmlFor="isRecurring">This is a recurring transaction</Label>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="slim" onClick={() => {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setEditingTransaction(null);
          }}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {transaction ? 'Update Transaction' : 'Add Transaction'}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">Track and manage all your income and expenses</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="slim">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
              </DialogHeader>
              <TransactionForm onSubmit={handleCreateTransaction} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Amount</p>
                <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totalIncome - totalExpenses)}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Search transactions..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(value) => setSearchTerm(value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="filterType">Type</Label>
              <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expenses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="filterCategory">Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {getAllCategories().map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button variant="slim">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => {
                const category = getCategoryById(transaction.categoryId);
                return (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {formatDate(transaction.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {transaction.type === 'income' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span>{transaction.description}</span>
                        {transaction.isRecurring && (
                          <Badge variant="slim" className="text-xs">Recurring</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {category && (
                        <div className="flex items-center space-x-1">
                          <span>{category.icon}</span>
                          <span className="text-sm">{category.name}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <span>{getPaymentMethodIcon(transaction.paymentMethod)}</span>
                        <span className="text-sm capitalize">{transaction.paymentMethod}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {transaction.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingTransaction(transaction);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transactions found matching your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <TransactionForm transaction={editingTransaction} onSubmit={handleEditTransaction} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionManagement;