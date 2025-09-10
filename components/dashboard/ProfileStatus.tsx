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


import { Home, Users, Settings, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface HouseholdStats {
  projectsInProgress: number;
  mealsPlanned: number;
  membersHome: number;
  totalMembers: number;
}

// Mock household data for stats (will be replaced with real data later)
const mockStats = {
  projectsInProgress: 3,
  mealsPlanned: 4,
  membersHome: 2,
  totalMembers: 3
};

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export function ProfileStatus() {
  const { user, profile } = useAuth();
  
  // Use real profile data when available, fallback to mock for household name
  const displayName = profile?.preferred_name || profile?.name || user?.email?.split('@')[0] || 'there';
  const householdName = 'Wade Family'; // TODO: Replace with real household data
  const greeting = `${getTimeBasedGreeting()}, ${displayName} 👋`;
  const stats = mockStats; // TODO: Replace with real household stats

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        {/* Greeting & Household Info */}
        <div className="flex-1">
          <div className="text-lg font-semibold text-gray-900 mb-1">
            {greeting}
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <Home className="h-4 w-4 mr-1" />
            <span>{householdName} • {stats.totalMembers} members</span>
            <span className="ml-3 text-green-600">
              {stats.membersHome}/{stats.totalMembers} home
            </span>
          </div>

          {/* Household Stats */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
              <span className="text-gray-600">
                {stats.projectsInProgress} projects active
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-pink-400 rounded-full mr-2"></div>
              <span className="text-gray-600">
                {stats.mealsPlanned}/7 meals planned
              </span>
            </div>
          </div>
        </div>

        {/* Quick Profile Actions */}
        <div className="flex items-center space-x-2">
          {/* AI Assistant Button (Premium feature) */}
          <button className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 rounded-lg transition-all duration-200 group">
            <Sparkles className="h-4 w-4 text-purple-600 group-hover:text-purple-700" />
          </button>

          {/* Household Members Quick View */}
          <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <Users className="h-4 w-4 text-gray-600" />
          </button>

          {/* Settings */}
          <Link 
            href="/profile"
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Settings className="h-4 w-4 text-gray-600" />
          </Link>
        </div>
      </div>

      {/* Family Status Indicators */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>👨‍💼 Kyle - Home</span>
            <span>👩‍⚕️ Ashley - Hospital (until 7PM)</span>
            <span>👧 Harper - Daycare</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-400">Next pickup: 5:30PM</span>
          </div>
        </div>
      </div>

      {/* Premium Features Teaser */}
      <div className="mt-3 p-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Sparkles className="h-3 w-3 text-purple-600 mr-1" />
            <span className="text-xs text-purple-800 font-medium">
              AI Family Assistant available with Premium
            </span>
          </div>
          <button className="text-xs text-purple-600 hover:text-purple-700 font-medium">
            Upgrade →
          </button>
        </div>
      </div>
    </div>
  );
}
