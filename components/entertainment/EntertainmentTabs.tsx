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

import { useState, memo } from 'react';
import { Sparkles, Film, Calendar, Music, Gamepad2 } from 'lucide-react';
import { Magic8BallTab } from './Magic8BallTab';
import { MoviesTab } from './MoviesTab';
import { LocalEventsTab } from './LocalEventsTab';
import { MusicTab } from './MusicTab';
import { GamesTab } from './GamesTab';

type TabType = 'magic8ball' | 'movies' | 'events' | 'music' | 'games';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
  available: boolean;
}

const tabs: Tab[] = [
  {
    id: 'magic8ball',
    label: 'Magic 8-Ball',
    icon: Sparkles,
    component: Magic8BallTab,
    available: true
  },
  {
    id: 'movies',
    label: 'Movies',
    icon: Film,
    component: MoviesTab,
    available: true
  },
  {
    id: 'events',
    label: 'Local Events',
    icon: Calendar,
    component: LocalEventsTab,
    available: true
  },
  {
    id: 'music',
    label: 'Music',
    icon: Music,
    component: MusicTab,
    available: true
  },
  {
    id: 'games',
    label: 'Games',
    icon: Gamepad2,
    component: GamesTab,
    available: true
  }
];

export const EntertainmentTabs = memo(() => {
  const [activeTab, setActiveTab] = useState<TabType>('magic8ball');

  const ActiveComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || Magic8BallTab;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isAvailable = tab.available;

            return (
              <button
                key={tab.id}
                onClick={() => isAvailable && setActiveTab(tab.id)}
                disabled={!isAvailable}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all
                  ${
                    isActive && isAvailable
                      ? 'border-purple-500 text-purple-600 bg-purple-50'
                      : isAvailable
                        ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        : 'border-transparent text-gray-300 cursor-not-allowed opacity-50'
                  }
                `}
                title={!isAvailable ? 'Coming soon!' : ''}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {!isAvailable && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full ml-2">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <ActiveComponent />
      </div>
    </div>
  );
});

EntertainmentTabs.displayName = 'EntertainmentTabs';
