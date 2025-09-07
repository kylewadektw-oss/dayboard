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

/*
 * 📋 WORK MANAGER TYPES - Type Definitions
 * 
 * PURPOSE: TypeScript type definitions for work manager data structures
 * 
 * TYPES:
 * - [List main type definitions]
 * - [Interface declarations]
 * - [Enum definitions]
 * - [Utility types and generics]
 * 
 * USAGE:
 * ```typescript
 * import type { TypeName } from '@/types/WorkManager';
 * 
 * const example: TypeName = {
 *   // properties
 * };
 * ```
 * 
 * FEATURES:
 * - [Type safety guarantees]
 * - [Validation patterns]
 * - [Extensibility and composition]
 * - [Integration with other types]
 * 
 * TECHNICAL:
 * - [Type system design]
 * - [Runtime validation]
 * - [Performance implications]
 * - [Compatibility considerations]
 */


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

/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kylewadektw-oss)
 * 
 * This file is part of Dayboard, a proprietary family command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: [your-email@domain.com]
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Play, Pause, Square, Coffee, 
         Monitor, Users, MapPin, Video, Phone, CheckCircle, 
         Timer, BarChart3, TrendingUp, Target, User, Plus,
         ChevronLeft, ChevronRight, Bell } from 'lucide-react';

interface WorkEvent {
  id: string;
  title: string;
  type: 'meeting' | 'focus' | 'break' | 'call' | 'review';
  startTime: string;
  endTime: string;
  date: string;
  location?: string;
  participants?: string[];
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

interface TimeEntry {
  id: string;
  task: string;
  project: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  type: 'work' | 'meeting' | 'break' | 'admin';
  date: string;
}

const mockEvents: WorkEvent[] = [
  {
    id: 'e1',
    title: 'Team Standup',
    type: 'meeting',
    startTime: '09:00',
    endTime: '09:30',
    date: '2024-12-09',
    location: 'Video Call',
    participants: ['Sarah', 'Mike', 'Lisa'],
    status: 'upcoming',
    priority: 'medium',
    description: 'Daily team sync and progress updates'
  },
  {
    id: 'e2',
    title: 'Deep Work: Project Review',
    type: 'focus',
    startTime: '10:00',
    endTime: '12:00',
    date: '2024-12-09',
    status: 'upcoming',
    priority: 'high',
    description: 'Quarterly project analysis and recommendations'
  },
  {
    id: 'e3',
    title: 'Client Call - Strategy Session',
    type: 'call',
    startTime: '14:00',
    endTime: '15:00',
    date: '2024-12-09',
    location: 'Conference Room A',
    participants: ['Client Team', 'Account Manager'],
    status: 'upcoming',
    priority: 'high',
    description: 'Q1 strategy planning with key client'
  },
  {
    id: 'e4',
    title: 'Coffee Break',
    type: 'break',
    startTime: '15:30',
    endTime: '15:45',
    date: '2024-12-09',
    status: 'upcoming',
    priority: 'low'
  },
  {
    id: 'e5',
    title: 'Code Review Session',
    type: 'review',
    startTime: '16:00',
    endTime: '17:00',
    date: '2024-12-09',
    participants: ['Dev Team'],
    status: 'upcoming',
    priority: 'medium',
    description: 'Weekly code review and best practices discussion'
  }
];

const mockTimeEntries: TimeEntry[] = [
  {
    id: 't1',
    task: 'Email Management',
    project: 'Admin',
    startTime: new Date('2024-12-09T08:00:00'),
    endTime: new Date('2024-12-09T08:30:00'),
    duration: 30,
    type: 'admin',
    date: '2024-12-09'
  },
  {
    id: 't2',
    task: 'Project Planning',
    project: 'Website Redesign',
    startTime: new Date('2024-12-09T09:30:00'),
    endTime: new Date('2024-12-09T11:30:00'),
    duration: 120,
    type: 'work',
    date: '2024-12-09'
  },
  {
    id: 't3',
    task: 'Client Meeting',
    project: 'Branding Campaign',
    startTime: new Date('2024-12-09T13:00:00'),
    endTime: new Date('2024-12-09T14:00:00'),
    duration: 60,
    type: 'meeting',
    date: '2024-12-09'
  }
];

export function WorkManager() {
  const [events, setEvents] = useState<WorkEvent[]>(mockEvents);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(mockTimeEntries);
  const [currentTimer, setCurrentTimer] = useState<{
    isRunning: boolean;
    task: string;
    project: string;
    type: string;
    startTime: Date | null;
    elapsedTime: number;
  }>({
    isRunning: false,
    task: '',
    project: '',
    type: 'work',
    startTime: null,
    elapsedTime: 0
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'schedule' | 'timer' | 'analytics'>('schedule');

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentTimer.isRunning && currentTimer.startTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - currentTimer.startTime!.getTime()) / 1000);
        setCurrentTimer(prev => ({ ...prev, elapsedTime: elapsed }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentTimer.isRunning, currentTimer.startTime]);

  const startTimer = (task: string, project: string, type: string) => {
    setCurrentTimer({
      isRunning: true,
      task,
      project,
      type: type as 'work' | 'meeting' | 'break' | 'admin',
      startTime: new Date(),
      elapsedTime: 0
    });
  };

  const pauseTimer = () => {
    setCurrentTimer(prev => ({ ...prev, isRunning: false }));
  };

  const stopTimer = () => {
    if (currentTimer.startTime && currentTimer.elapsedTime > 0) {
      const newEntry: TimeEntry = {
        id: `t${Date.now()}`,
        task: currentTimer.task,
        project: currentTimer.project,
        startTime: currentTimer.startTime,
        endTime: new Date(),
        duration: Math.floor(currentTimer.elapsedTime / 60),
        type: currentTimer.type as 'work' | 'meeting' | 'break' | 'admin',
        date: selectedDate
      };
      setTimeEntries(prev => [...prev, newEntry]);
    }
    setCurrentTimer({
      isRunning: false,
      task: '',
      project: '',
      type: 'work',
      startTime: null,
      elapsedTime: 0
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getEventIcon = (type: WorkEvent['type']) => {
    switch (type) {
      case 'meeting': return <Users className="h-4 w-4" />;
      case 'focus': return <Monitor className="h-4 w-4" />;
      case 'break': return <Coffee className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      case 'review': return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: WorkEvent['type']) => {
    switch (type) {
      case 'meeting': return 'from-blue-400 to-blue-500';
      case 'focus': return 'from-purple-400 to-purple-500';
      case 'break': return 'from-green-400 to-green-500';
      case 'call': return 'from-orange-400 to-orange-500';
      case 'review': return 'from-red-400 to-red-500';
    }
  };

  const getPriorityColor = (priority: WorkEvent['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
    }
  };

  const todayEvents = events.filter(e => e.date === selectedDate);
  const todayTimeEntries = timeEntries.filter(e => e.date === selectedDate);
  const totalTimeToday = todayTimeEntries.reduce((sum, entry) => sum + entry.duration, 0) + 
                        (currentTimer.isRunning ? Math.floor(currentTimer.elapsedTime / 60) : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Work Management</h1>
          <p className="text-gray-600">Track time, manage schedule, and optimize productivity</p>
        </div>

        {/* Current Timer Display */}
        {currentTimer.isRunning && (
          <div className="flex items-center gap-4 bg-white rounded-xl px-6 py-3 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-gray-900">{currentTimer.task}</span>
            </div>
            <div className="text-2xl font-mono text-blue-600">
              {formatTime(currentTimer.elapsedTime)}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={pauseTimer}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Pause className="h-4 w-4" />
              </button>
              <button
                onClick={stopTimer}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Square className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
        {[
          { key: 'schedule', label: 'Schedule', icon: Calendar },
          { key: 'timer', label: 'Time Tracker', icon: Timer },
          { key: 'analytics', label: 'Analytics', icon: BarChart3 }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setViewMode(key as typeof viewMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
              viewMode === key
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Date Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Total: {formatDuration(totalTimeToday)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>Goal: 8h</span>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Today's Schedule</h2>
            
            {todayEvents.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events scheduled</h3>
                <p className="text-gray-600 mb-4">Your schedule is clear for today</p>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4" />
                  Add Event
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${getPriorityColor(event.priority)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${getEventColor(event.type)} text-white`}>
                            {getEventIcon(event.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{event.title}</h3>
                            <p className="text-sm text-gray-600">
                              {event.startTime} - {event.endTime}
                            </p>
                          </div>
                        </div>
                        
                        {event.description && (
                          <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </div>
                          )}
                          {event.participants && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {event.participants.length} participants
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {event.status === 'upcoming' && (
                          <button
                            onClick={() => startTimer(event.title, 'Event', event.type)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            disabled={currentTimer.isRunning}
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          event.status === 'in-progress' ? 'bg-green-100 text-green-800' :
                          event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Timer Start */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Timer</h3>
              <div className="space-y-3">
                {[
                  { task: 'Deep Work', project: 'Current Project', type: 'work' },
                  { task: 'Email Management', project: 'Admin', type: 'admin' },
                  { task: 'Break', project: 'Personal', type: 'break' },
                  { task: 'Meeting Prep', project: 'Current Project', type: 'work' }
                ].map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => startTimer(preset.task, preset.project, preset.type)}
                    disabled={currentTimer.isRunning}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{preset.task}</p>
                      <p className="text-xs text-gray-500">{preset.project}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Today's Progress */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Progress</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Work Hours</span>
                    <span className="font-medium">{formatDuration(totalTimeToday)} / 8h</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((totalTimeToday / 480) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{todayTimeEntries.length}</p>
                    <p className="text-xs text-gray-600">Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{todayEvents.length}</p>
                    <p className="text-xs text-gray-600">Events</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'timer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timer Interface */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Time Tracker</h2>
            
            {!currentTimer.isRunning ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Task</label>
                  <input
                    type="text"
                    placeholder="What are you working on?"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setCurrentTimer(prev => ({ ...prev, task: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                  <input
                    type="text"
                    placeholder="Project name"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setCurrentTimer(prev => ({ ...prev, project: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setCurrentTimer(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="work">Work</option>
                    <option value="meeting">Meeting</option>
                    <option value="break">Break</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <button
                  onClick={() => startTimer(currentTimer.task || 'Untitled Task', currentTimer.project || 'General', currentTimer.type)}
                  disabled={!currentTimer.task.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="h-5 w-5" />
                  Start Timer
                </button>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{currentTimer.task}</h3>
                  <p className="text-gray-600">{currentTimer.project}</p>
                </div>
                
                <div className="text-6xl font-mono text-blue-600 mb-6">
                  {formatTime(currentTimer.elapsedTime)}
                </div>
                
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={pauseTimer}
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <Pause className="h-5 w-5" />
                    Pause
                  </button>
                  <button
                    onClick={stopTimer}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Square className="h-5 w-5" />
                    Stop
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Recent Time Entries */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Entries</h2>
            
            <div className="space-y-3">
              {todayTimeEntries.slice(-5).reverse().map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{entry.task}</h4>
                    <p className="text-sm text-gray-600">{entry.project}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatDuration(entry.duration)}</p>
                    <p className="text-xs text-gray-500">
                      {entry.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {todayTimeEntries.length === 0 && (
                <div className="text-center py-8">
                  <Timer className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No time entries for today</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Stats Cards */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Today</p>
                  <p className="text-2xl font-bold text-gray-900">{formatDuration(totalTimeToday)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">32h 15m</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Productivity</p>
                  <p className="text-2xl font-bold text-gray-900">87%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{todayTimeEntries.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
            <p className="text-gray-600 mb-6">
              Detailed time tracking analytics, productivity insights, and performance trends will be available in the next update.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
              <Bell className="h-4 w-4" />
              Get notified when available
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
