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

import React, { memo } from 'react';
import Link from 'next/link';
import { 
  Film, 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowRight,
  Star,
  Sparkles
} from 'lucide-react';

// Mock data for entertainment dashboard widget
const entertainmentData = {
  featuredEvent: {
    title: "Spring Festival in the Park",
    date: "April 15",
    time: "10:00 AM",
    location: "Central Park",
    distance: "2.3 miles",
    emoji: "🌸",
    type: "Festival"
  },
  nowPlaying: {
    title: "Guardians of the Galaxy Vol. 3",
    theater: "AMC Valley View",
    nextShowtime: "5:45 PM",
    rating: 8.5,
    emoji: "🦝"
  },
  familyActivity: {
    title: "Kids Art Workshop", 
    date: "April 8",
    time: "1:00 PM",
    location: "Community Center",
    emoji: "🎨",
    spotsLeft: 8
  },
  weekendSuggestion: {
    title: "Local Farmers Market",
    frequency: "Every Saturday",
    time: "8:00 AM - 2:00 PM",
    highlight: "Fresh produce & crafts",
    emoji: "🥕"
  }
};

const EntertainmentWidget: React.FC = memo(() => {
  const { featuredEvent, nowPlaying, familyActivity, weekendSuggestion } = entertainmentData;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-blue-600 px-3 py-1 rounded-lg tracking-wide">ENTERTAINMENT</h3>
        <Link 
          href="/entertainment"
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="View all entertainment"
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        {/* Featured Event */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{featuredEvent.emoji}</span>
              <h3 className="font-semibold text-gray-900 text-sm">Featured Event</h3>
            </div>
            <Star className="h-4 w-4 text-yellow-500" />
          </div>
          <h4 className="font-medium text-gray-900 mb-1">{featuredEvent.title}</h4>
          <div className="flex items-center space-x-3 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{featuredEvent.date}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{featuredEvent.time}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span>{featuredEvent.distance}</span>
            </div>
          </div>
        </div>

        {/* Now Playing Movies */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Film className="h-4 w-4 text-blue-600" />
            <h3 className="font-semibold text-gray-900 text-sm">Now Playing</h3>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{nowPlaying.emoji}</span>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">{nowPlaying.title}</h4>
                <p className="text-xs text-gray-600">{nowPlaying.theater}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-blue-600">{nowPlaying.nextShowtime}</div>
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-500" />
                <span className="text-xs text-gray-600">{nowPlaying.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Family Activity */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="h-4 w-4 text-green-600" />
            <h3 className="font-semibold text-gray-900 text-sm">Family Activity</h3>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{familyActivity.emoji}</span>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">{familyActivity.title}</h4>
                <p className="text-xs text-gray-600">{familyActivity.date} at {familyActivity.time}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-green-600">{familyActivity.spotsLeft} spots left</div>
              <p className="text-xs text-gray-500">{familyActivity.location}</p>
            </div>
          </div>
        </div>

        {/* Weekend Suggestion */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            <h3 className="font-semibold text-gray-900 text-sm">This Weekend</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{weekendSuggestion.emoji}</span>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm">{weekendSuggestion.title}</h4>
              <p className="text-xs text-gray-600">{weekendSuggestion.frequency}</p>
              <p className="text-xs text-purple-600 mt-1">{weekendSuggestion.highlight}</p>
            </div>
          </div>
        </div>

        {/* Quick Action Button */}
        <Link
          href="/entertainment"
          className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-3 rounded-lg font-medium text-sm hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Explore All Entertainment
        </Link>
      </div>
    </div>
  );
});

EntertainmentWidget.displayName = 'EntertainmentWidget';

export default EntertainmentWidget;