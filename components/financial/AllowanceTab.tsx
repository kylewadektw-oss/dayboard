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

import { memo } from 'react';
import FamilyAllowanceSystem from '../budget/FamilyAllowanceSystem';

export const AllowanceTab = memo(() => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Kids & Allowance System
        </h2>
        <p className="text-gray-600">
          Track allowances, chores, and rewards for family members
        </p>
      </div>

      {/* Integrate existing Family Allowance System */}
      <FamilyAllowanceSystem />
    </div>
  );
});

AllowanceTab.displayName = 'AllowanceTab';
