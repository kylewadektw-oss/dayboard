/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 *
 * Feedback API - Handle CRUD operations for user feedback
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { CreateFeedbackData, FeedbackStatus } from '@/types/feedback';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile for household_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('household_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const feedbackData: CreateFeedbackData = body;

    // Validate required fields
    if (
      !feedbackData.title ||
      !feedbackData.description ||
      !feedbackData.feedback_type
    ) {
      return NextResponse.json(
        { error: 'Title, description, and feedback type are required' },
        { status: 400 }
      );
    }

    // Serialize browser_info to ensure compatibility with Supabase Json type
    const serializedBrowserInfo = feedbackData.browser_info
      ? {
          userAgent: feedbackData.browser_info.userAgent,
          viewport: {
            width: feedbackData.browser_info.viewport.width,
            height: feedbackData.browser_info.viewport.height
          },
          screen: {
            width: feedbackData.browser_info.screen.width,
            height: feedbackData.browser_info.screen.height
          },
          browser: feedbackData.browser_info.browser,
          os: feedbackData.browser_info.os,
          device: feedbackData.browser_info.device,
          timestamp: feedbackData.browser_info.timestamp
        }
      : null;

    // Store feedback in customer_reviews table
    const { data, error } = await supabase
      .from('customer_reviews')
      .insert({
        user_id: user.id,
        review_type: feedbackData.feedback_type,
        review_text: `${feedbackData.title}\n\n${feedbackData.description}`,
        feedback_category: feedbackData.feedback_type,
        status: 'pending',
        device_info: {
          feedback_type: feedbackData.feedback_type,
          priority: feedbackData.priority || 'medium',
          title: feedbackData.title,
          description: feedbackData.description,
          steps_to_reproduce: feedbackData.steps_to_reproduce || null,
          expected_behavior: feedbackData.expected_behavior || null,
          actual_behavior: feedbackData.actual_behavior || null,
          browser_info: serializedBrowserInfo,
          screen_resolution: feedbackData.screen_resolution || null,
          user_agent: feedbackData.user_agent || null,
          page_url: feedbackData.page_url || null,
          page_title: feedbackData.page_title || null,
          household_id: profile.household_id,
          status: 'submitted'
        },
        user_agent: feedbackData.user_agent || null,
        url: feedbackData.page_url || null,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating feedback:', error);
      return NextResponse.json(
        { error: 'Failed to create feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as FeedbackStatus | null;
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('customer_reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (type) {
      query = query.eq('feedback_type', type);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching feedback:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const feedbackId = searchParams.get('id');

    if (!feedbackId) {
      return NextResponse.json(
        { error: 'Feedback ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, admin_response } = body;

    // Update feedback status in customer_reviews
    const { data: existingReview, error: fetchError } = await supabase
      .from('customer_reviews')
      .select('*')
      .eq('id', feedbackId)
      .single();

    if (fetchError || !existingReview) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    // Update feedback
    const { data, error } = await supabase
      .from('customer_reviews')
      .update({
        status: status,
        response_from_team: admin_response || null,
        response_at: status === 'responded' ? new Date().toISOString() : null
      })
      .eq('id', feedbackId)
      .select()
      .single();

    if (error) {
      console.error('Error updating feedback:', error);
      return NextResponse.json(
        { error: 'Failed to update feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
