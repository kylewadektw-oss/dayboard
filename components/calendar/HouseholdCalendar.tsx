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

import { useEffect, useMemo, useState, useCallback, memo } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import type { EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

interface FeedEvent {
  event_id: string;
  household_id: string;
  kind: 'manual' | 'meal' | 'list_item' | 'project_task';
  title: string;
  description?: string;
  location?: string;
  start_ts: string;
  end_ts: string;
  all_day: boolean;
  color?: string;
  link_href?: string;
  meta?: unknown;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  extendedProps: FeedEvent;
}

interface HouseholdCalendarProps {
  initialView?: string;
  height?: string | number;
  onEventClick?: (event: FeedEvent) => void;
  showQuickAdd?: boolean;
}

function HouseholdCalendar({
  initialView = 'dayGridMonth',
  height = 'auto',
  onEventClick
}: HouseholdCalendarProps) {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🚀 PERFORMANCE: Memoize initial range calculation
  const [range, setRange] = useState<{ from: string; to: string }>(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    return {
      from: start.toISOString(),
      to: end.toISOString()
    };
  });

  // Simple debounce function
  const debounce = useCallback(
    <T extends (...args: never[]) => void>(func: T, delay: number) => {
      let timeoutId: NodeJS.Timeout;
      return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      };
    },
    []
  );

  // Debounced fetch function
  const debouncedFetchEvents = useMemo(
    () =>
      debounce(async (fromDate: string, toDate: string) => {
        setLoading(true);
        setError(null);

        try {
          const url = `/api/calendar?from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(toDate)}`;
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`Failed to fetch events: ${response.status}`);
          }

          const data = await response.json();
          setEvents(data.events || []);

          // Log for debugging
          console.log(
            `📅 Loaded ${data.events?.length || 0} calendar events`,
            data.meta
          );
        } catch (err) {
          console.error('Calendar fetch error:', err);
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load calendar events'
          );
          setEvents([]); // Clear events on error
        } finally {
          setLoading(false);
        }
      }, 300),
    [debounce]
  );

  const fetchEvents = useCallback(
    async (fromDate: string, toDate: string) => {
      debouncedFetchEvents(fromDate, toDate);
    },
    [debouncedFetchEvents]
  );

  useEffect(() => {
    fetchEvents(range.from, range.to);
  }, [range, fetchEvents]);

  // Transform feed events to FullCalendar format
  const fcEvents = useMemo((): CalendarEvent[] => {
    return (events || []).map((event) => ({
      id: event.event_id,
      title: event.title,
      start: event.start_ts,
      end: event.end_ts,
      allDay: event.all_day,
      backgroundColor: event.color || getDefaultColor(event.kind),
      borderColor: event.color || getDefaultColor(event.kind),
      extendedProps: event
    }));
  }, [events]);

  // Update date range when calendar view changes
  const handleDatesSet = useCallback(
    (dateInfo: { start: Date; end: Date }) => {
      const newRange = {
        from: dateInfo.start.toISOString(),
        to: dateInfo.end.toISOString()
      };

      if (newRange.from !== range.from || newRange.to !== range.to) {
        setRange(newRange);
      }
    },
    [range]
  );

  // Handle event click
  const handleEventClick = useCallback(
    (clickInfo: EventClickArg) => {
      const event = clickInfo.event.extendedProps as FeedEvent;
      if (onEventClick) {
        onEventClick(event);
      }
    },
    [onEventClick]
  );

  // Initial load
  useEffect(() => {
    fetchEvents(range.from, range.to);
  }, [fetchEvents, range]);

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Calendar Error
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchEvents(range.from, range.to)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading calendar...
          </div>
        </div>
      )}

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={initialView}
        height={height}
        events={fcEvents}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        dayMaxEvents={3}
        moreLinkClick="popover"
        eventDisplay="block"
        displayEventTime={true}
        allDaySlot={true}
        nowIndicator={true}
        weekends={true}
        businessHours={{
          startTime: '06:00',
          endTime: '22:00'
        }}
        slotMinTime="06:00:00"
        slotMaxTime="24:00:00"
        expandRows={true}
        stickyHeaderDates={true}
        eventMouseEnter={(info) => {
          info.el.style.cursor = 'pointer';
        }}
        eventDidMount={(info) => {
          // Add tooltip
          info.el.title =
            info.event.extendedProps.description || info.event.title;
        }}
      />
    </div>
  );
}

// Helper function to get default colors for event types
function getDefaultColor(kind: string): string {
  switch (kind) {
    case 'manual':
      return '#3b82f6'; // blue
    case 'meal':
      return '#22c55e'; // green
    case 'list_item':
      return '#60a5fa'; // light blue
    case 'project_task':
      return '#a855f7'; // purple
    default:
      return '#6b7280'; // gray
  }
}

// 🚀 PERFORMANCE: Memoized export for better component reuse
const MemoizedHouseholdCalendar = memo(HouseholdCalendar);
export default MemoizedHouseholdCalendar;
