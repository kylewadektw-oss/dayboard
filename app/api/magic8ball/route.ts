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
import { enhancedLogger, LogLevel } from '@/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const householdId = searchParams.get('household_id');
    
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
        const { data: questions, error: historyError } = await supabase
          .from('magic8_questions')
          .select(`
            *,
            profiles (
              display_name,
              first_name
            )
          `)
          .eq('household_id', householdId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (historyError) {
          await enhancedLogger.logWithFullContext(LogLevel.ERROR, "Failed to fetch Magic 8-Ball history", "Magic8BallAPI", {
            error: historyError.message,
            householdId,
            userId: user.id
          });
          return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
        }

        return NextResponse.json({ questions });

      case 'stats':
        // Get total questions count
        const { count: totalQuestions, error: totalError } = await supabase
          .from('magic8_questions')
          .select('*', { count: 'exact', head: true })
          .eq('household_id', householdId);

        if (totalError) throw totalError;

        // Get today's questions
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: todaysQuestions, error: todayError } = await supabase
          .from('magic8_questions')
          .select('*', { count: 'exact', head: true })
          .eq('household_id', householdId)
          .gte('created_at', today.toISOString());

        if (todayError) throw todayError;

        // Get this week's questions
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const { count: weeklyQuestions, error: weekError } = await supabase
          .from('magic8_questions')
          .select('*', { count: 'exact', head: true })
          .eq('household_id', householdId)
          .gte('created_at', weekAgo.toISOString());

        if (weekError) throw weekError;

        // Get most active user
        const { data: userStats, error: userStatsError } = await supabase
          .from('magic8_questions')
          .select(`
            asked_by,
            profiles (
              display_name,
              first_name
            )
          `)
          .eq('household_id', householdId);

        if (userStatsError) throw userStatsError;

        // Count questions by user
        const userCounts = userStats?.reduce((acc: Record<string, any>, q: any) => {
          const userId = q.asked_by;
          const name = q.profiles?.display_name || q.profiles?.first_name || 'Unknown';
          
          if (!acc[userId]) {
            acc[userId] = { name, count: 0 };
          }
          acc[userId].count++;
          return acc;
        }, {});

        // Find most active user
        const mostActiveUser = userCounts ? Object.values(userCounts).reduce((max: any, current: any) => 
          current.count > max.count ? current : max, { name: 'No one yet', count: 0 }
        ) : { name: 'No one yet', count: 0 };

        // Get theme popularity
        const { data: themeStats, error: themeError } = await supabase
          .from('magic8_questions')
          .select('theme')
          .eq('household_id', householdId);

        if (themeError) throw themeError;

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
          mostActiveUser: (mostActiveUser as any).name,
          mostPopularTheme,
          userCounts: userCounts || {}
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    await enhancedLogger.logWithFullContext(LogLevel.ERROR, "Magic 8-Ball API error", "Magic8BallAPI", {
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'GET'
    });

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
      await enhancedLogger.logWithFullContext(LogLevel.ERROR, "Failed to save Magic 8-Ball question", "Magic8BallAPI", {
        error: error.message,
        householdId: household_id,
        userId: user.id
      });
      return NextResponse.json({ error: 'Failed to save question' }, { status: 500 });
    }

    await enhancedLogger.logWithFullContext(LogLevel.INFO, "Magic 8-Ball question saved successfully", "Magic8BallAPI", {
      questionId: data.id,
      householdId: household_id,
      userId: user.id,
      theme: theme || 'classic'
    });

    return NextResponse.json({ success: true, data });

  } catch (error) {
    await enhancedLogger.logWithFullContext(LogLevel.ERROR, "Magic 8-Ball API error", "Magic8BallAPI", {
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'POST'
    });

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
      await enhancedLogger.logWithFullContext(LogLevel.ERROR, "Failed to delete Magic 8-Ball question", "Magic8BallAPI", {
        error: error.message,
        questionId,
        userId: user.id
      });
      return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
    }

    await enhancedLogger.logWithFullContext(LogLevel.INFO, "Magic 8-Ball question deleted successfully", "Magic8BallAPI", {
      questionId,
      userId: user.id
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    await enhancedLogger.logWithFullContext(LogLevel.ERROR, "Magic 8-Ball API error", "Magic8BallAPI", {
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'DELETE'
    });

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}