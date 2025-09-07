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


import { Calendar, Clock, MapPin } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: 'work' | 'family' | 'household' | 'personal';
  location?: string;
}

// Mock calendar data
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Ashley - Hospital Shift',
    time: '7:00 AM',
    type: 'work',
    location: 'Presbyterian Hospital'
  },
  {
    id: '2', 
    title: 'Harper Soccer Practice',
    time: '4:30 PM',
    type: 'family',
    location: 'City Park Fields'
  },
  {
    id: '3',
    title: 'Grocery Shopping',
    time: '6:00 PM',
    type: 'household'
  }
];

const nextDaysEvents = [
  { day: 'Tomorrow', count: 4 },
  { day: 'Friday', count: 2 },
  { day: 'Weekend', count: 6 }
];

const getEventColor = (type: CalendarEvent['type']) => {
  switch (type) {
    case 'work':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'family':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    case 'household':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'personal':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function CalendarWidget() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 h-fit">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600">Today's Schedule</h3>
        <Calendar className="h-4 w-4 text-gray-400" />
      </div>

      {/* Today's Events */}
      <div className="space-y-2 mb-4">
        {mockEvents.map((event) => (
          <div key={event.id} className={`p-2 rounded-lg border ${getEventColor(event.type)}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{event.title}</div>
                {event.location && (
                  <div className="flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1 opacity-60" />
                    <span className="text-xs opacity-75 truncate">{event.location}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center ml-2 text-xs opacity-75">
                <Clock className="h-3 w-3 mr-1" />
                {event.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Days Preview */}
      <div className="pt-3 border-t border-gray-100">
        <h4 className="text-xs font-medium text-gray-500 mb-2">Coming Up</h4>
        <div className="space-y-1">
          {nextDaysEvents.map((day, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className="text-gray-600">{day.day}</span>
              <span className="text-gray-800 font-medium">{day.count} events</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action */}
      <button className="w-full mt-3 py-2 text-xs font-medium text-pink-600 hover:text-pink-700 hover:bg-pink-50 rounded-lg transition-colors">
        + Add Event
      </button>
    </div>
  );
}
