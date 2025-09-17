/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 *
 * Copyright (c) 2025 BentLo Labs LLC (developer@bentlolabs.com)
 *
 * This file is part of Dayboard, a proprietary household command center application.
 *
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 *
 * For licensing inquiries: developer@bentlolabs.com
 *
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

'use client';

import { memo } from 'react';
import BudgetDashboard from '../budget/BudgetDashboard';

export const BudgetOverviewTab = memo(() => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Family Budget Overview
        </h2>
        <p className="text-gray-600">
          Track your household expenses, savings goals, and financial health
        </p>
      </div>

      {/* Integrate existing Budget Dashboard */}
      <BudgetDashboard />
    </div>
  );
});

BudgetOverviewTab.displayName = 'BudgetOverviewTab';
