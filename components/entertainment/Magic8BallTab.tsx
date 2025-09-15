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
import { useAuth } from '@/contexts/AuthContext';
import Magic8BallWidget from '@/components/entertainment/Magic8BallWidget';

export const Magic8BallTab = memo(() => {
  const { user, profile } = useAuth();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🎱 Magic 8-Ball</h2>
        <p className="text-gray-600">
          Ask the mystical Magic 8-Ball any question and get an answer from the beyond!
        </p>
      </div>

      {/* Magic 8-Ball Widget - Full featured version */}
      <Magic8BallWidget 
        householdId={profile?.household_id || undefined}
        userId={user?.id}
        className="bg-transparent shadow-none border-0"
      />

      {/* Instructions */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">How to Use</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <span className="font-medium text-purple-600">1.</span>
            <span>Think of a yes/no question or use &quot;Surprise Me!&quot; for random questions</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-purple-600">2.</span>
            <span>Click &quot;Shake the Ball!&quot; or physically shake your mobile device</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-purple-600">3.</span>
            <span>Watch the magic happen and receive your mystical answer!</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-purple-600">4.</span>
            <span>View your question history and family statistics</span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Try different themes for different experiences! 
            Each theme has unique answers and visual styles.
          </div>
        </div>
      </div>
    </div>
  );
});

Magic8BallTab.displayName = 'Magic8BallTab';