import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  AlertCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { mockBudgetCategories, getMonthlySpendingByCategory } from '@/fixtures/budget-data';
import type { BudgetCategory } from '@/types/budget';

const BudgetCategories = () => {
  const [categories, setCategories] = useState<BudgetCategory[]>(mockBudgetCategories);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const monthlySpending = getMonthlySpendingByCategory();

  // Predefined category options
  const categoryIcons = [
    { icon: '🏠', label: 'Housing' },
    { icon: '🍽️', label: 'Food' },
    { icon: '🚗', label: 'Transportation' },
    { icon: '👨‍👩‍👧‍👦', label: 'Family' },
    { icon: '🎬', label: 'Entertainment' },
    { icon: '💊', label: 'Health' },
    { icon: '🏦', label: 'Savings' },
    { icon: '🛒', label: 'Shopping' },
    { icon: '💼', label: 'Work' },
    { icon: '🎓', label: 'Education' },
    { icon: '🏋️', label: 'Fitness' },
    { icon: '✈️', label: 'Travel' }
  ];

  const colorOptions = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
    'bg-pink-500', 'bg-red-500', 'bg-indigo-500', 'bg-orange-500',
    'bg-teal-500', 'bg-gray-500', 'bg-cyan-500', 'bg-emerald-500'
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getSpendingStatus = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 90) return { status: 'danger', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (percentage >= 75) return { status: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { status: 'good', color: 'text-green-600', bgColor: 'bg-green-100' };
  };

  const handleCreateCategory = (formData: FormData) => {
    const newCategory: BudgetCategory = {
      id: `custom_${Date.now()}`,
      name: formData.get('name') as string,
      icon: formData.get('icon') as string,
      color: formData.get('color') as string,
      budgetAmount: parseFloat(formData.get('budgetAmount') as string) || 0,
      spentAmount: 0,
      isCustom: true
    };
    
    setCategories([...categories, newCategory]);
    setIsCreateDialogOpen(false);
  };

  const handleEditCategory = (formData: FormData) => {
    if (!editingCategory) return;
    
    const updatedCategory: BudgetCategory = {
      ...editingCategory,
      name: formData.get('name') as string,
      icon: formData.get('icon') as string,
      color: formData.get('color') as string,
      budgetAmount: parseFloat(formData.get('budgetAmount') as string) || 0,
    };
    
    setCategories(categories.map(cat => 
      cat.id === editingCategory.id ? updatedCategory : cat
    ));
    setEditingCategory(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(categories.filter(cat => cat.id !== categoryId));
  };

  const CategoryForm = ({ category, onSubmit }: { category?: BudgetCategory, onSubmit: (formData: FormData) => void }) => {
    const [selectedIcon, setSelectedIcon] = useState(category?.icon || '🏠');
    const [selectedColor, setSelectedColor] = useState(category?.color || 'bg-blue-500');

    return (
      <form action={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Category Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter category name"
            defaultValue={category?.name || ''}
            onChange={() => {}} 
            required
          />
        </div>

        <div>
          <Label>Category Icon</Label>
          <div className="grid grid-cols-6 gap-2 mt-2">
            {categoryIcons.map((option) => (
              <button
                key={option.icon}
                type="button"
                onClick={() => setSelectedIcon(option.icon)}
                className={`p-2 text-xl border rounded-lg hover:bg-gray-50 ${
                  selectedIcon === option.icon ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
              >
                {option.icon}
              </button>
            ))}
          </div>
          <input type="hidden" name="icon" value={selectedIcon} />
        </div>

        <div>
          <Label>Category Color</Label>
          <div className="grid grid-cols-6 gap-2 mt-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full ${color} ${
                  selectedColor === color ? 'ring-2 ring-gray-400 ring-offset-2' : ''
                }`}
              />
            ))}
          </div>
          <input type="hidden" name="color" value={selectedColor} />
        </div>

        <div>
          <Label htmlFor="budgetAmount">Monthly Budget</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="budgetAmount"
              name="budgetAmount"
              type="number"
              placeholder="0.00"
              className="pl-10"
              defaultValue={category?.budgetAmount || ''}
              step="0.01"
              min="0"
              required
              onChange={() => {}}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="slim" onClick={() => {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setEditingCategory(null);
          }}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {category ? 'Update Category' : 'Create Category'}
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
          <h1 className="text-3xl font-bold text-gray-900">Budget Categories</h1>
          <p className="text-gray-600">Manage your budget categories and allocations</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <CategoryForm onSubmit={handleCreateCategory} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(categories.reduce((sum, cat) => sum + cat.budgetAmount, 0))}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(categories.reduce((sum, cat) => sum + cat.spentAmount, 0))}
                </p>
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
                <p className="text-sm font-medium text-gray-600">Remaining</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    categories.reduce((sum, cat) => sum + cat.budgetAmount, 0) -
                    categories.reduce((sum, cat) => sum + cat.spentAmount, 0)
                  )}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const percentage = category.budgetAmount > 0 ? (category.spentAmount / category.budgetAmount) * 100 : 0;
          const remaining = category.budgetAmount - category.spentAmount;
          const spendingStatus = getSpendingStatus(category.spentAmount, category.budgetAmount);

          return (
            <Card key={category.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      {category.isCustom && (
                        <Badge variant="slim" className="text-xs">Custom</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="slim"
                      onClick={() => {
                        setEditingCategory(category);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {category.isCustom && (
                      <Button
                        variant="slim"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Budget vs Spent */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Budget</span>
                    <span className="font-semibold">{formatCurrency(category.budgetAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Spent</span>
                    <span className="font-semibold">{formatCurrency(category.spentAmount)}</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className="h-2"
                    />
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">{percentage.toFixed(1)}% used</span>
                      <span className={`text-xs font-medium ${spendingStatus.color}`}>
                        {remaining >= 0 ? `${formatCurrency(remaining)} left` : `${formatCurrency(Math.abs(remaining))} over`}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex justify-center">
                    <Badge className={`${spendingStatus.bgColor} ${spendingStatus.color} border-0`}>
                      {spendingStatus.status === 'danger' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {spendingStatus.status === 'danger' ? 'Over Budget' : 
                       spendingStatus.status === 'warning' ? 'Near Limit' : 'On Track'}
                    </Badge>
                  </div>

                  {/* Subcategories */}
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500 mb-2">{category.subcategories.length} subcategories</p>
                      <div className="space-y-1">
                        {category.subcategories.slice(0, 3).map((sub) => (
                          <div key={sub.id} className="flex justify-between text-xs">
                            <span className="text-gray-600">{sub.name}</span>
                            <span>{formatCurrency(sub.spentAmount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <CategoryForm category={editingCategory} onSubmit={handleEditCategory} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BudgetCategories;