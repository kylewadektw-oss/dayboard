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
import { Gamepad2, Sparkles, Music, Film, Calendar } from 'lucide-react';

export const EntertainmentHeader = memo(() => {
  return (
    <div className="mb-8">
      {/* Main Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl text-white">
          <Gamepad2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Entertainment Center
          </h1>
          <p className="text-gray-600 mt-1">Family fun, games, movies, and local events</p>
        </div>
      </div>

      {/* Quick Stats/Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <div>
              <div className="font-semibold text-gray-900">Magic 8-Ball</div>
              <div className="text-sm text-gray-600">Ask away!</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <Film className="w-5 h-5 text-red-500" />
            <div>
              <div className="font-semibold text-gray-900">Movies</div>
              <div className="text-sm text-gray-600">Coming soon</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-green-500" />
            <div>
              <div className="font-semibold text-gray-900">Local Events</div>
              <div className="text-sm text-gray-600">Coming soon</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <Music className="w-5 h-5 text-blue-500" />
            <div>
              <div className="font-semibold text-gray-900">Music</div>
              <div className="text-sm text-gray-600">Coming soon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

EntertainmentHeader.displayName = 'EntertainmentHeader';