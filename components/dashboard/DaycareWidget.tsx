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

import { Baby, Camera, Mail, Eye, Clock, Heart } from 'lucide-react';

interface DaycareUpdate {
  id: string;
  type: 'photo' | 'note' | 'milestone' | 'activity';
  title: string;
  content: string;
  time: string;
  teacher: string;
  isNew?: boolean;
}

// Mock daycare data
const mockDaycareUpdates: DaycareUpdate[] = [
  {
    id: '1',
    type: 'photo',
    title: "Harper's Art Creation!",
    content:
      'Harper made a beautiful finger painting of our family today. She was so proud to show everyone!',
    time: '2:30 PM',
    teacher: 'Ms. Sarah',
    isNew: true
  },
  {
    id: '2',
    type: 'milestone',
    title: 'New Word Alert! 🎉',
    content:
      'Harper said "butterfly" perfectly when we saw one in the garden during outdoor play.',
    time: '11:45 AM',
    teacher: 'Mr. James',
    isNew: true
  },
  {
    id: '3',
    type: 'activity',
    title: 'Story Time Favorite',
    content:
      'Harper loved "The Very Hungry Caterpillar" and asked us to read it three times!',
    time: '10:15 AM',
    teacher: 'Ms. Sarah',
    isNew: false
  }
];

const getUpdateIcon = (type: DaycareUpdate['type']) => {
  switch (type) {
    case 'photo':
      return <Camera className="h-4 w-4 text-pink-600" />;
    case 'milestone':
      return <Heart className="h-4 w-4 text-red-600" />;
    case 'note':
      return <Mail className="h-4 w-4 text-blue-600" />;
    case 'activity':
      return <Baby className="h-4 w-4 text-purple-600" />;
    default:
      return <Baby className="h-4 w-4 text-gray-600" />;
  }
};

const getUpdateColor = (type: DaycareUpdate['type']) => {
  switch (type) {
    case 'photo':
      return 'bg-pink-50 border-pink-200';
    case 'milestone':
      return 'bg-red-50 border-red-200';
    case 'note':
      return 'bg-blue-50 border-blue-200';
    case 'activity':
      return 'bg-purple-50 border-purple-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

export function DaycareWidget() {
  const newUpdatesCount = mockDaycareUpdates.filter(
    (update) => update.isNew
  ).length;
  const latestUpdate = mockDaycareUpdates[0];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <h3 className="text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-rose-600 px-3 py-1 rounded-lg tracking-wide">
            DAYCARE UPDATES
          </h3>
          {newUpdatesCount > 0 && (
            <span className="ml-2 px-2 py-1 bg-pink-100 text-pink-800 text-xs font-medium rounded-full">
              {newUpdatesCount} new
            </span>
          )}
        </div>
        <Baby className="h-4 w-4 text-gray-400" />
      </div>

      {/* Latest Update Featured */}
      {latestUpdate && (
        <div
          className={`border rounded-lg p-3 mb-3 ${getUpdateColor(latestUpdate.type)}`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center">
              {getUpdateIcon(latestUpdate.type)}
              <span className="ml-2 text-sm font-semibold text-gray-900">
                {latestUpdate.title}
              </span>
              {latestUpdate.isNew && (
                <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-2 leading-relaxed">
            {latestUpdate.content}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {latestUpdate.time}
            </div>
            <div>by {latestUpdate.teacher}</div>
          </div>
        </div>
      )}

      {/* Timeline Summary */}
      <div className="space-y-2 mb-4">
        <h4 className="text-xs font-medium text-gray-500">
          Today&apos;s Timeline
        </h4>
        <div className="space-y-1">
          {mockDaycareUpdates.slice(1, 3).map((update) => (
            <div
              key={update.id}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center">
                {getUpdateIcon(update.type)}
                <span className="ml-2 text-gray-700 truncate flex-1">
                  {update.title}
                </span>
                {update.isNew && (
                  <span className="ml-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                )}
              </div>
              <span className="text-gray-500 ml-2">{update.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <button className="w-full py-2 px-3 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center">
          <Camera className="h-3 w-3 mr-1" />
          View All Photos
        </button>

        <button className="w-full py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center">
          <Eye className="h-3 w-3 mr-1" />
          Full Daycare Archive
        </button>
      </div>

      {/* Contact & Pickup Reminder */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>📞 Sunny Days Daycare</span>
          <span className="font-medium text-orange-600">Pickup: 5:30 PM</span>
        </div>
      </div>

      {/* Gmail Integration Status */}
      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Mail className="h-3 w-3 text-blue-600 mr-1" />
            <span className="text-xs text-blue-800">
              Auto-sync with daycare emails
            </span>
          </div>
          <span className="text-xs text-green-600 font-medium">
            ✓ Connected
          </span>
        </div>
      </div>
    </div>
  );
}
