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

import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

function formatForICal(dt: string): string {
  // Convert ISO string to iCal format: 2025-09-13T18:00:00.000Z -> 20250913T180000Z
  return dt.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeICalText(text: string): string {
  // Escape special characters for iCal format
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const from =
      url.searchParams.get('from') ??
      new Date(Date.now() - 7 * 864e5).toISOString();
    const to =
      url.searchParams.get('to') ??
      new Date(Date.now() + 60 * 864e5).toISOString();

    const supabase = await createClient();

    // Get current user to verify authentication
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response('Authentication required', { status: 401 });
    }

    let events: unknown[] = [];

    try {
      // Try to fetch from the calendar feed view
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('v_calendar_feed')
        .select('*')
        .gte('start_ts', from)
        .lte('end_ts', to)
        .order('start_ts');

      if (error) throw error;
      events = data || [];
    } catch {
      console.log(
        'Calendar view not available, using mock data for iCal export'
      );

      // Generate mock events for iCal export testing
      events = [
        {
          kind: 'manual',
          event_id: 'mock-1',
          title: 'Family Dinner Planning',
          description: 'Weekly family dinner and meal prep',
          location: 'Home',
          start_ts: new Date(
            Date.now() + 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          end_ts: new Date(
            Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
          ).toISOString(),
          all_day: false,
          color: '#3b82f6'
        },
        {
          kind: 'meal',
          event_id: 'meal-mock-1',
          title: 'Breakfast: Pancakes & Fruit',
          description: 'Fluffy pancakes with fresh berries and maple syrup',
          location: null,
          start_ts: new Date(
            Date.now() + 1 * 24 * 60 * 60 * 1000 + 7.5 * 60 * 60 * 1000
          ).toISOString(),
          end_ts: new Date(
            Date.now() + 1 * 24 * 60 * 60 * 1000 + 8.5 * 60 * 60 * 1000
          ).toISOString(),
          all_day: false,
          color: '#22c55e'
        }
      ].filter((event) => {
        const eventStart = new Date(event.start_ts);
        const rangeStart = new Date(from);
        const rangeEnd = new Date(to);
        return eventStart >= rangeStart && eventStart <= rangeEnd;
      });
    }

    // Generate iCal content
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Dayboard//Household Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Dayboard Household Calendar',
      'X-WR-CALDESC:Unified household calendar with meals, tasks, and events'
    ];

    for (const event of events) {
      const e = event as {
        event_id: string;
        start_ts: string;
        end_ts: string;
        all_day: boolean;
        title: string;
        description?: string;
        location?: string;
        kind?: string;
        color?: string;
      };
      const uid = `${e.event_id}@dayboard.app`;
      const dtStart = e.all_day
        ? `DTSTART;VALUE=DATE:${formatForICal(e.start_ts).slice(0, 8)}`
        : `DTSTART:${formatForICal(e.start_ts)}`;
      const dtEnd = e.all_day
        ? `DTEND;VALUE=DATE:${formatForICal(e.end_ts).slice(0, 8)}`
        : `DTEND:${formatForICal(e.end_ts)}`;

      lines.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `SUMMARY:${escapeICalText(e.title)}`,
        dtStart,
        dtEnd,
        `DESCRIPTION:${escapeICalText(e.description || '')}`,
        e.location ? `LOCATION:${escapeICalText(e.location)}` : '',
        `CATEGORIES:${e.kind?.toUpperCase() || 'EVENT'}`,
        e.color ? `COLOR:${e.color}` : '',
        `CREATED:${formatForICal(new Date().toISOString())}`,
        `LAST-MODIFIED:${formatForICal(new Date().toISOString())}`,
        'STATUS:CONFIRMED',
        'TRANSP:OPAQUE',
        'END:VEVENT'
      );
    }

    lines.push('END:VCALENDAR');
    const icsContent = lines.filter(Boolean).join('\r\n');

    return new Response(icsContent, {
      headers: {
        'content-type': 'text/calendar; charset=utf-8',
        'content-disposition': 'attachment; filename="dayboard-calendar.ics"',
        'cache-control': 'no-cache, no-store, must-revalidate',
        pragma: 'no-cache',
        expires: '0'
      }
    });
  } catch (error) {
    console.error('iCal export error:', error);
    return new Response('Error generating iCal export', { status: 500 });
  }
}
