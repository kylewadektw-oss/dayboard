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

import Button from '@/components/ui/Button';
import { useState } from 'react';

export default function OauthSignIn() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="space-y-3">
      <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-gray-500 mb-2">🔐</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Disabled</h3>
        <p className="text-sm text-gray-600">
          OAuth authentication has been temporarily disabled. 
          You can set up authentication providers later.
        </p>
      </div>
    </div>
  );
}
