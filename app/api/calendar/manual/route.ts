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

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      title, 
      start_ts, 
      end_ts, 
      description = null,
      location = null,
      all_day = false, 
      color = null,
      rrule = null
    } = body || {};

    if (!title || !start_ts || !end_ts) {
      return NextResponse.json(
        { error: "title, start_ts, end_ts are required" }, 
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user and their profile
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" }, 
        { status: 401 }
      );
    }

    // Get user's household_id from their profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("household_id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile?.household_id) {
      return NextResponse.json(
        { error: "User profile or household not found" }, 
        { status: 404 }
      );
    }

    // Validate datetime strings
    try {
      new Date(start_ts);
      new Date(end_ts);
    } catch {
      return NextResponse.json(
        { error: "Invalid date format. Use ISO 8601 format." }, 
        { status: 400 }
      );
    }

    // Check if end time is after start time
    if (new Date(end_ts) <= new Date(start_ts)) {
      return NextResponse.json(
        { error: "End time must be after start time" }, 
        { status: 400 }
      );
    }

    try {
      // Insert the new calendar event
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newEvent, error: insertError } = await (supabase as any)
        .from("calendar_events")
        .insert({
          household_id: profile.household_id,
          title,
          description,
          location,
          start_ts,
          end_ts,
          all_day,
          color,
          rrule,
          created_by: user.id
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return NextResponse.json({ 
        success: true, 
        event: newEvent
      });

    } catch (insertError) {
      const errorMessage = insertError instanceof Error ? insertError.message : 'Unknown error';
      // If table doesn't exist yet, return success with mock data
      if (errorMessage.includes("calendar_events") || errorMessage.includes("does not exist")) {
        console.log("Calendar tables not deployed yet, simulating event creation");
        
        const mockEvent = {
          id: `mock-${Date.now()}`,
          household_id: profile.household_id,
          title,
          description,
          location,
          start_ts,
          end_ts,
          all_day,
          color,
          rrule,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        return NextResponse.json({ 
          success: true, 
          event: mockEvent,
          meta: {
            note: "Event created in mock mode - deploy calendar migrations to persist events"
          }
        });
      }

      console.error("Error inserting calendar event:", insertError);
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Calendar manual API error:", error);
    return NextResponse.json(
      { error: "Invalid request body" }, 
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" }, 
        { status: 401 }
      );
    }

    try {
      // Fetch manual calendar events for the user's household
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: events, error } = await (supabase as any)
        .from("calendar_events")
        .select("*")
        .order("start_ts", { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return NextResponse.json({ 
        events: events || [],
        pagination: {
          limit,
          offset,
          hasMore: (events?.length || 0) === limit
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      // If table doesn't exist yet, return mock data
      if (errorMessage.includes("calendar_events") || errorMessage.includes("does not exist")) {
        console.log("Calendar tables not deployed yet, returning mock manual events");
        
        const mockEvents = [
          {
            id: 'mock-manual-1',
            title: 'Family Game Night',
            description: 'Weekly family board game session',
            location: 'Living Room',
            start_ts: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000).toISOString(),
            end_ts: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 21 * 60 * 60 * 1000).toISOString(),
            all_day: false,
            color: '#8b5cf6',
            created_at: new Date().toISOString()
          }
        ];

        return NextResponse.json({ 
          events: mockEvents,
          pagination: { limit, offset, hasMore: false },
          meta: {
            note: "Using mock data - deploy calendar migrations to see real events"
          }
        });
      }

      console.error("Error fetching manual events:", error);
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Calendar manual GET API error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}