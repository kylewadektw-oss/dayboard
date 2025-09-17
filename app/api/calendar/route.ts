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

import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface CalendarResponseMeta {
  from: string;
  to: string;
  eventsCount: number;
  cached: boolean;
}

interface CalendarResponse {
  success?: boolean;
  events: unknown[]; // Using unknown[] for flexible database responses
  meta?: CalendarResponseMeta;
}

interface CacheEntry {
  data: CalendarResponse;
  timestamp: number;
  ttl: number;
}

// 🚀 PERFORMANCE: Simple in-memory cache
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 300000; // 5 minutes

function getCacheKey(from: string, to: string, userId: string): string {
  return `calendar_${userId}_${from}_${to}`;
}

function getFromCache(key: string): CalendarResponse | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < entry.ttl) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(
  key: string,
  data: CalendarResponse,
  ttl: number = CACHE_TTL
) {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!from || !to) {
      return NextResponse.json(
        { error: 'from & to are required (ISO dates)' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user to verify authentication
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 🚀 PERFORMANCE: Check cache first
    const cacheKey = getCacheKey(from, to, user.id);
    const cachedData = getFromCache(cacheKey);

    if (cachedData) {
      return NextResponse.json(
        {
          ...cachedData,
          meta: {
            ...cachedData.meta,
            cached: true
          }
        },
        {
          headers: {
            'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
            'CDN-Cache-Control': 'public, max-age=300',
            'Vercel-CDN-Cache-Control': 'public, max-age=300'
          }
        }
      );
    }

    // Filter the unified view by time window & the user's household via RLS
    try {
      // Use raw query for view that might not be in generated types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('v_calendar_feed')
        .select('*')
        .gte('start_ts', from)
        .lte('end_ts', to)
        .order('start_ts');

      if (error) throw error;

      const responseData = {
        events: data || [],
        meta: {
          from,
          to,
          eventsCount: data?.length || 0,
          cached: false
        }
      };

      // 🚀 PERFORMANCE: Cache the response
      setCache(cacheKey, responseData);

      return NextResponse.json(responseData, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
          'CDN-Cache-Control': 'public, max-age=300',
          'Vercel-CDN-Cache-Control': 'public, max-age=300'
        }
      });
    } catch (dbError) {
      console.error('Calendar API error:', dbError);
      const errorMessage =
        dbError instanceof Error ? dbError.message : 'Unknown error';

      // If the view doesn't exist yet, return mock data
      if (
        errorMessage.includes('v_calendar_feed') ||
        errorMessage.includes('does not exist')
      ) {
        console.log('Calendar view not deployed yet, returning mock data');

        // Generate some mock calendar events for testing
        const mockEvents = [
          {
            kind: 'manual',
            event_id: 'mock-1',
            household_id: 'mock-household',
            title: 'Family Dinner',
            description: 'Weekly family dinner planning',
            location: 'Home',
            start_ts: new Date(
              Date.now() + 2 * 24 * 60 * 60 * 1000
            ).toISOString(), // 2 days from now
            end_ts: new Date(
              Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
            ).toISOString(), // +2 hours
            all_day: false,
            color: '#3b82f6',
            link_href: null,
            meta: { source: 'manual' }
          },
          {
            kind: 'meal',
            event_id: 'meal-mock-1',
            household_id: 'mock-household',
            title: 'Breakfast: Pancakes',
            description: 'Fluffy pancakes with syrup',
            location: null,
            start_ts: new Date(
              Date.now() + 1 * 24 * 60 * 60 * 1000 + 7.5 * 60 * 60 * 1000
            ).toISOString(), // tomorrow at 7:30am
            end_ts: new Date(
              Date.now() + 1 * 24 * 60 * 60 * 1000 + 8.5 * 60 * 60 * 1000
            ).toISOString(), // +1 hour
            all_day: false,
            color: '#22c55e',
            link_href: '/meals/recipes/mock-1',
            meta: { recipe_id: 'mock-1', meal_type: 'breakfast', servings: 4 }
          },
          {
            kind: 'list_item',
            event_id: 'list-mock-1',
            household_id: 'mock-household',
            title: 'Grocery Shopping',
            description: 'Weekly grocery run',
            location: null,
            start_ts: new Date(
              Date.now() + 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000
            ).toISOString(), // 3 days from now at 10am
            end_ts: new Date(
              Date.now() + 3 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000
            ).toISOString(), // +1 hour
            all_day: false,
            color: '#3b82f6',
            link_href: '/lists/mock-1',
            meta: { list_id: 'mock-1', priority: 'high', completed: false }
          },
          {
            kind: 'project_task',
            event_id: 'task-mock-1',
            household_id: 'mock-household',
            title: 'Home Renovation: Install Kitchen Backsplash',
            description: 'Install subway tile backsplash in kitchen',
            location: null,
            start_ts: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000
            ).toISOString(), // 1 week from now at 2pm
            end_ts: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000
            ).toISOString(), // +3 hours
            all_day: false,
            color: '#a855f7',
            link_href: '/projects/mock-1',
            meta: {
              project_id: 'mock-1',
              status: 'pending',
              priority: 'medium'
            }
          }
        ];

        // Filter mock events by date range
        const filteredMockEvents = mockEvents.filter((event) => {
          const eventStart = new Date(event.start_ts);
          const rangeStart = new Date(from);
          const rangeEnd = new Date(to);
          return eventStart >= rangeStart && eventStart <= rangeEnd;
        });

        return NextResponse.json({
          events: filteredMockEvents,
          meta: {
            note: 'Using mock data - deploy calendar migrations to use real data',
            from,
            to,
            mockEventsCount: filteredMockEvents.length
          }
        });
      }

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  } catch (error) {
    console.error('Calendar API unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
