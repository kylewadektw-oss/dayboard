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

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    let action = searchParams.get('action');
    const householdId = searchParams.get('household_id');
    
    // Handle legacy parameter format - if stats=true is passed, treat it as action=stats
    if (!action && searchParams.get('stats') === 'true') {
      action = 'stats';
    }
    
    // Handle limit parameter for history (default behavior)
    if (!action && searchParams.get('limit')) {
      action = 'history';
    }
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!householdId) {
      return NextResponse.json({ error: 'household_id required' }, { status: 400 });
    }

    switch (action) {
      case 'history':
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const safeLimit = Math.min(Math.max(limit, 1), 100); // Clamp between 1 and 100
        
        const { data: questions, error: historyError } = await supabase
          .from('magic8_questions')
          .select('*')
          .eq('household_id', householdId)
          .order('created_at', { ascending: false })
          .limit(safeLimit);

        if (historyError) {
          console.error('Failed to fetch Magic 8-Ball history:', historyError.message);
          return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
        }

        return NextResponse.json({ questions });

      case 'stats':
        // Get total questions count
        const { count: totalQuestions, error: totalError } = await supabase
          .from('magic8_questions')
          .select('*', { count: 'exact', head: true })
          .eq('household_id', householdId);

        if (totalError) {
          console.error('Failed to get total questions count:', totalError.message);
          return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
        }

        // Get today's questions
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: todaysQuestions, error: todayError } = await supabase
          .from('magic8_questions')
          .select('*', { count: 'exact', head: true })
          .eq('household_id', householdId)
          .gte('created_at', today.toISOString());

        if (todayError) {
          console.error('Failed to get today\'s questions count:', todayError.message);
          return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
        }

        // Get this week's questions
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const { count: weeklyQuestions, error: weekError } = await supabase
          .from('magic8_questions')
          .select('*', { count: 'exact', head: true })
          .eq('household_id', householdId)
          .gte('created_at', weekAgo.toISOString());

        if (weekError) {
          console.error('Failed to get weekly questions count:', weekError.message);
          return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
        }

        // Get most active user
        const { data: userStats, error: userStatsError } = await supabase
          .from('magic8_questions')
          .select('asked_by')
          .eq('household_id', householdId);

        if (userStatsError) {
          console.error('Failed to get user stats:', userStatsError.message);
          return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
        }

        // Count questions by user
        const userCounts = userStats?.reduce((acc: Record<string, { name: string; count: number }>, q: unknown) => {
          const question = q as Record<string, unknown>;
          const userId = question.asked_by as string;
          
          if (!acc[userId]) {
            acc[userId] = { name: 'User', count: 0 };
          }
          acc[userId].count++;
          return acc;
        }, {});

        // Find most active user
        const mostActiveUser = userCounts ? Object.values(userCounts).reduce((max: { name: string; count: number }, current: { name: string; count: number }) => 
          current.count > max.count ? current : max, { name: 'No one yet', count: 0 }
        ) : { name: 'No one yet', count: 0 };

        // Get theme popularity
        const { data: themeStats, error: themeError } = await supabase
          .from('magic8_questions')
          .select('theme')
          .eq('household_id', householdId);

        if (themeError) {
          console.error('Failed to get theme stats:', themeError.message);
          return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
        }

        const themeCounts = themeStats?.reduce((acc: Record<string, number>, q: { theme: string }) => {
          acc[q.theme] = (acc[q.theme] || 0) + 1;
          return acc;
        }, {});

        const mostPopularTheme = themeCounts ? Object.entries(themeCounts).reduce((max, current) => 
          (current[1] as number) > (max[1] as number) ? current : max, ['classic', 0]
        )[0] : 'classic';

        return NextResponse.json({
          totalQuestions: totalQuestions || 0,
          todaysQuestions: todaysQuestions || 0,
          weeklyQuestions: weeklyQuestions || 0,
          mostActiveUser: mostActiveUser.name,
          mostPopularTheme,
          userCounts: userCounts || {}
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Magic 8-Ball API error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { question, answer, theme, household_id } = body;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate required fields
    if (!question || !answer || !household_id) {
      return NextResponse.json({ 
        error: 'Missing required fields: question, answer, household_id' 
      }, { status: 400 });
    }

    // Validate theme
    const validThemes = ['classic', 'holiday', 'school', 'pet', 'party', 'kids'];
    if (theme && !validThemes.includes(theme)) {
      return NextResponse.json({ error: 'Invalid theme' }, { status: 400 });
    }

    // Insert the question
    const { data, error } = await supabase
      .from('magic8_questions')
      .insert({
        question: question.trim(),
        answer: answer.trim(),
        theme: theme || 'classic',
        household_id,
        asked_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to save Magic 8-Ball question:', error.message);
      return NextResponse.json({ error: 'Failed to save question' }, { status: 500 });
    }

    console.log('Magic 8-Ball question saved successfully:', data.id);
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Magic 8-Ball API error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('id');

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID required' }, { status: 400 });
    }

    // Delete the question (RLS will ensure user can only delete their own)
    const { error } = await supabase
      .from('magic8_questions')
      .delete()
      .eq('id', questionId)
      .eq('asked_by', user.id); // Double-check ownership

    if (error) {
      console.error('Failed to delete Magic 8-Ball question:', error.message);
      return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
    }

    console.log('Magic 8-Ball question deleted successfully:', questionId);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Magic 8-Ball API error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}