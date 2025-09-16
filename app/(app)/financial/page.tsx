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

import { FinancialTabs } from '@/components/financial/FinancialTabs';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Financial Dashboard - Dayboard',
  description: 'Comprehensive financial management for your household'
};

export default function FinancialPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Financial Dashboard
          </h1>
          <p className="text-gray-600">
            Comprehensive financial management for your household - budgets,
            savings, bills, and more
          </p>
        </div>

        <FinancialTabs />
      </div>
    </div>
  );
}
