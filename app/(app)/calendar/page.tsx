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

"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, Download, Settings, List, Clock } from "lucide-react";
import { HouseholdCalendar, QuickAddEvent, EventModal } from "@/components/calendar";
import { PageErrorBoundary, ComponentErrorBoundary } from "@/components/ErrorBoundary";

// Calendar Event Interface
interface CalendarEvent {
  id: string;
  event_id?: string;
  title: string;
  start_ts: string;
  end_ts?: string;
  all_day?: boolean;
  description?: string;
  location?: string;
  source?: string;
  kind?: string;
  color?: string;
  link_href?: string;
}

// Tab configuration
const CALENDAR_TABS = [
  { id: 'calendar', label: 'Calendar View', icon: CalendarIcon },
  { id: 'events', label: 'All Events', icon: List },
  { id: 'upcoming', label: 'Upcoming', icon: Clock },
  { id: 'settings', label: 'Settings', icon: Settings }
] as const;

type CalendarTab = typeof CALENDAR_TABS[number]['id'];

// Event List View Component
function EventListView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch events for the next 6 months
  const fetchEvents = useCallback(async () => {
    const controller = new AbortController();
    
    try {
      setLoading(true);
      const now = new Date();
      const sixMonthsLater = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
      
      const response = await fetch(
        `/api/calendar?from=${now.toISOString()}&to=${sixMonthsLater.toISOString()}`,
        { signal: controller.signal }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Only update state if component is still mounted
      if (!controller.signal.aborted) {
        setEvents(data.events || []);
      }
    } catch (error: unknown) {
      // Ignore abort errors (component unmounted)
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to fetch events:', error);
        if (!controller.signal.aborted) {
          setEvents([]);
        }
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
    
    return () => controller.abort();
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    const initFetch = async () => {
      cleanup = await fetchEvents();
    };
    
    initFetch();
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [fetchEvents]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesFilter = filter === 'all' || event.kind === filter;
      const matchesSearch = searchTerm === '' || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [events, filter, searchTerm]);

  const eventTypes = useMemo(() => [
    { value: 'all', label: 'All Events' },
    { value: 'manual', label: 'Manual Events' },
    { value: 'meal', label: 'Meals' },
    { value: 'list_item', label: 'Tasks' },
    { value: 'project_task', label: 'Projects' }
  ], []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Events
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Type
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {eventTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            All Events ({filteredEvents.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No events found matching your criteria.
            </div>
          ) : (
            filteredEvents.map((event, index) => (
              <div key={event.event_id || index} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                    style={{ backgroundColor: event.color }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {event.title}
                    </h4>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {event.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>
                        {new Date(event.start_ts).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span>
                        {new Date(event.start_ts).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="capitalize">{event.kind}</span>
                      {event.location && (
                        <span>📍 {event.location}</span>
                      )}
                    </div>
                  </div>
                  {event.link_href && (
                    <a
                      href={event.link_href}
                      className="text-indigo-600 hover:text-indigo-800 text-sm flex-shrink-0"
                    >
                      View Details →
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Upcoming Events View Component
function UpcomingEventsView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUpcomingEvents = useCallback(async () => {
    const controller = new AbortController();
    
    try {
      setLoading(true);
      const now = new Date();
      const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const response = await fetch(
        `/api/calendar?from=${now.toISOString()}&to=${thirtyDaysLater.toISOString()}`,
        { signal: controller.signal }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Only update state if component is still mounted
      if (!controller.signal.aborted) {
        setEvents(data.events || []);
      }
    } catch (error: unknown) {
      // Ignore abort errors (component unmounted)
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to fetch upcoming events:', error);
        if (!controller.signal.aborted) {
          setEvents([]);
        }
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
    
    return () => controller.abort();
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    const initFetch = async () => {
      cleanup = await fetchUpcomingEvents();
    };
    
    initFetch();
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [fetchUpcomingEvents]);

  const groupedEvents = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const thisWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const groups = {
      today: [] as CalendarEvent[],
      tomorrow: [] as CalendarEvent[],
      thisWeek: [] as CalendarEvent[],
      later: [] as CalendarEvent[]
    };

    events.forEach(event => {
      const eventDate = new Date(event.start_ts);
      const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

      if (eventDay.getTime() === today.getTime()) {
        groups.today.push(event);
      } else if (eventDay.getTime() === tomorrow.getTime()) {
        groups.tomorrow.push(event);
      } else if (eventDate <= thisWeek) {
        groups.thisWeek.push(event);
      } else {
        groups.later.push(event);
      }
    });

    return groups;
  }, [events]);

  const renderEventGroup = (title: string, events: CalendarEvent[], emptyMessage: string) => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {title} ({events.length})
        </h3>
      </div>
      <div className="divide-y divide-gray-200">
        {events.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {emptyMessage}
          </div>
        ) : (
          events.map((event, index) => (
            <div key={event.event_id || index} className="p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: event.color }}
                ></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {event.title}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {new Date(event.start_ts).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {event.location && (
                    <p className="text-xs text-gray-600 mt-1">
                      📍 {event.location}
                    </p>
                  )}
                </div>
                {event.link_href && (
                  <a
                    href={event.link_href}
                    className="text-indigo-600 hover:text-indigo-800 text-xs flex-shrink-0"
                  >
                    View →
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderEventGroup("Today", groupedEvents.today, "No events scheduled for today")}
      {renderEventGroup("Tomorrow", groupedEvents.tomorrow, "No events scheduled for tomorrow")}
      {renderEventGroup("This Week", groupedEvents.thisWeek, "No events scheduled for this week")}
      {renderEventGroup("Later This Month", groupedEvents.later, "No events scheduled later this month")}
    </div>
  );
}

// Calendar Settings View Component
function CalendarSettingsView() {
  const [settings, setSettings] = useState({
    defaultView: 'month',
    showWeekends: true,
    startWeek: 'sunday',
    timeFormat: '12hour',
    notifications: true,
    emailReminders: false,
    autoSync: true
  });

  const handleSettingChange = (key: string, value: string | boolean | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Display Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Calendar View
            </label>
            <select
              value={settings.defaultView}
              onChange={(e) => handleSettingChange('defaultView', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="month">Month View</option>
              <option value="week">Week View</option>
              <option value="day">Day View</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Week Starts On
            </label>
            <select
              value={settings.startWeek}
              onChange={(e) => handleSettingChange('startWeek', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="sunday">Sunday</option>
              <option value="monday">Monday</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Format
            </label>
            <select
              value={settings.timeFormat}
              onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="12hour">12-hour (1:00 PM)</option>
              <option value="24hour">24-hour (13:00)</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              id="showWeekends"
              type="checkbox"
              checked={settings.showWeekends}
              onChange={(e) => handleSettingChange('showWeekends', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="showWeekends" className="ml-2 block text-sm text-gray-900">
              Show weekends
            </label>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="notifications"
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => handleSettingChange('notifications', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="notifications" className="ml-2 block text-sm text-gray-900">
              Enable browser notifications
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="emailReminders"
              type="checkbox"
              checked={settings.emailReminders}
              onChange={(e) => handleSettingChange('emailReminders', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="emailReminders" className="ml-2 block text-sm text-gray-900">
              Send email reminders
            </label>
          </div>
        </div>
      </div>

      {/* Sync Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendar Sync</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="autoSync"
              type="checkbox"
              checked={settings.autoSync}
              onChange={(e) => handleSettingChange('autoSync', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="autoSync" className="ml-2 block text-sm text-gray-900">
              Auto-sync with external calendars
            </label>
          </div>

          <div className="pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Export Options</h4>
            <div className="space-y-2">
              <a
                href="/api/calendar/ics"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100"
              >
                <Download className="h-4 w-4" />
                Download ICS File
              </a>
              <p className="text-xs text-gray-500">
                Import this file into your device&apos;s calendar app to sync events
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={() => {
            // TODO: Save settings to backend
            alert('Settings saved! (This would save to your profile in the real app)');
          }}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [activeTab, setActiveTab] = useState<CalendarTab>('calendar');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarKey, setCalendarKey] = useState(0); // For forcing calendar refresh
  
  // Event Modal State
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  const handleEventCreated = useCallback(() => {
    // Refresh the calendar by changing its key
    setCalendarKey(prev => prev + 1);
    
    // Close quick add if it was a popup
    setShowQuickAdd(false);
    setSelectedDate(null);
  }, []);

  const handleCalendarEventClick = useCallback((event: unknown) => {
    // Handle event clicks from the calendar - open modal
    console.log('📅 Calendar event clicked:', event);
    setSelectedEvent(event as CalendarEvent);
    setShowEventModal(true);
  }, []);

  // Event CRUD Operations
  const handleEventSave = useCallback(async (updatedEvent: Partial<CalendarEvent>) => {
    try {
      // Call API to update event
      const response = await fetch(`/api/calendar/events/${updatedEvent.event_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEvent),
      });

      if (!response.ok) {
        throw new Error(`Failed to update event: ${response.statusText}`);
      }

      // Refresh calendar
      setCalendarKey(prev => prev + 1);
      
      // Update the selected event for the modal
      setSelectedEvent(updatedEvent as CalendarEvent);
      
      console.log('✅ Event updated successfully');
    } catch (error) {
      console.error('❌ Failed to update event:', error);
      throw error; // Re-throw so modal can handle error display
    }
  }, []);

  const handleEventDelete = useCallback(async (eventId: string) => {
    try {
      const response = await fetch(`/api/calendar/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete event: ${response.statusText}`);
      }

      // Refresh calendar
      setCalendarKey(prev => prev + 1);
      
      console.log('✅ Event deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete event:', error);
      throw error;
    }
  }, []);

  const handleEventDuplicate = useCallback(async (duplicatedEvent: Partial<CalendarEvent>) => {
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicatedEvent),
      });

      if (!response.ok) {
        throw new Error(`Failed to create duplicate event: ${response.statusText}`);
      }

      // Refresh calendar
      setCalendarKey(prev => prev + 1);
      
      console.log('✅ Event duplicated successfully');
    } catch (error) {
      console.error('❌ Failed to duplicate event:', error);
      throw error;
    }
  }, []);

  const closeEventModal = useCallback(() => {
    setShowEventModal(false);
    setSelectedEvent(null);
  }, []);

  // 🚀 PERFORMANCE: Memoize calendar types data
  const calendarTypes = useMemo(() => [
    { color: 'bg-blue-500', label: 'Manual Events' },
    { color: 'bg-green-500', label: 'Meal Plans' },
    { color: 'bg-blue-400', label: 'Tasks & Lists' },
    { color: 'bg-purple-500', label: 'Project Tasks' },
  ], []);

  // 🚀 PERFORMANCE: Memoize calendar instructions
  const calendarInstructions = useMemo(() => [
    '• Click events to view details',
    '• Export to sync with your device',
    '• View by month, week, or day',
    '• All household members can see events',
  ], []);

  // 🚀 PERFORMANCE: Render tab content based on active tab
  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'calendar':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Calendar Area */}
            <div className="lg:col-span-3">
              <ComponentErrorBoundary>
                <HouseholdCalendar
                  key={calendarKey}
                  initialView="dayGridMonth"
                  height="700px"
                  onEventClick={handleCalendarEventClick}
                />
              </ComponentErrorBoundary>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Add Panel */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-indigo-600" />
                  Quick Add
                </h3>
                <ComponentErrorBoundary>
                  <QuickAddEvent
                    selectedDate={selectedDate}
                    onEventCreated={handleEventCreated}
                    inline={true}
                  />
                </ComponentErrorBoundary>
              </div>

              {/* Calendar Info */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendar Types</h3>
                <div className="space-y-3">
                  {calendarTypes.map((type, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${type.color}`}></div>
                      <span className="text-sm text-gray-700">{type.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendar Instructions */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Using Your Calendar</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  {calendarInstructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      case 'events':
        return <EventListView />;

      case 'upcoming':
        return <UpcomingEventsView />;

      case 'settings':
        return <CalendarSettingsView />;

      default:
        return null;
    }
  }, [activeTab, calendarKey, selectedDate, handleCalendarEventClick, handleEventCreated, calendarTypes, calendarInstructions]);

  return (
    <PageErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-8 w-8 text-indigo-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
                  <p className="text-sm text-gray-600">
                    Your household schedule and events
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Quick Add Button */}
                <button
                  onClick={() => setShowQuickAdd(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Event
                </button>

                {/* iCal Export */}
                <a
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  href="/api/calendar/ics"
                  title="Export calendar to your device"
                >
                  <Download className="h-4 w-4" />
                  Export
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {CALENDAR_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderTabContent()}
        </div>

        {/* Quick Add Modal */}
        {showQuickAdd && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="max-w-md w-full">
              <ComponentErrorBoundary>
                <QuickAddEvent
                  selectedDate={selectedDate}
                  onEventCreated={handleEventCreated}
                  onCancel={() => {
                    setShowQuickAdd(false);
                    setSelectedDate(null);
                  }}
                  inline={false}
                />
              </ComponentErrorBoundary>
            </div>
          </div>
        )}

        {/* Event Modal */}
        <ComponentErrorBoundary>
          <EventModal
            event={selectedEvent as { event_id: string; household_id: string; kind: 'manual' | 'meal' | 'list_item' | 'project_task'; title: string; description?: string; location?: string; start_ts: string; end_ts: string; all_day: boolean; color?: string; link_href?: string; meta?: unknown } | null}
            isOpen={showEventModal}
            onClose={closeEventModal}
            onSave={handleEventSave}
            onDelete={handleEventDelete}
            onDuplicate={handleEventDuplicate}
          />
        </ComponentErrorBoundary>
      </div>
    </PageErrorBoundary>
  );
}