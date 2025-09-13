import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp } from 'lucide-react';

const BudgetTest = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Budget System Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Monthly Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$4,500.00</div>
            <p className="text-sm text-gray-600">+5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">$2,847.00</div>
            <p className="text-sm text-gray-600">-2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">On Track</Badge>
            <p className="text-sm text-gray-600 mt-2">$1,653 remaining this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex space-x-4">
        <Button variant="primary">Add Transaction</Button>
        <Button variant="outline">View Reports</Button>
        <Button variant="ghost">Settings</Button>
      </div>
    </div>
  );
};

export default BudgetTest;