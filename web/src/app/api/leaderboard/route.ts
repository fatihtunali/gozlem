import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/gamification';
import pool from '@/lib/db';

/**
 * GET /api/leaderboard
 * Get top users by points
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const type = searchParams.get('type') || 'points';

    if (type === 'points') {
      const leaderboard = await getLeaderboard(limit);
      return NextResponse.json({ leaderboard });
    }

    if (type === 'streak') {
      const result = await pool.query(
        `SELECT current_streak as streak, longest_streak,
                ROW_NUMBER() OVER (ORDER BY current_streak DESC) as rank
         FROM user_streaks
         WHERE current_streak > 0
         ORDER BY current_streak DESC
         LIMIT $1`,
        [limit]
      );

      return NextResponse.json({
        leaderboard: result.rows.map(row => ({
          rank: parseInt(row.rank),
          streak: row.streak,
          longestStreak: row.longest_streak,
        })),
      });
    }

    if (type === 'weekly') {
      // Top confessions this week
      const result = await pool.query(
        `SELECT t.id, t.content, t.category,
                (t.me_too_count + COALESCE(t.hug_count, 0) * 2) as score,
                ROW_NUMBER() OVER (ORDER BY (t.me_too_count + COALESCE(t.hug_count, 0) * 2) DESC) as rank
         FROM truths t
         WHERE t.created_at > NOW() - INTERVAL '7 days'
           AND t.is_visible = true
         ORDER BY score DESC
         LIMIT $1`,
        [limit]
      );

      return NextResponse.json({
        leaderboard: result.rows.map(row => ({
          rank: parseInt(row.rank),
          truthId: row.id,
          content: row.content.slice(0, 50) + (row.content.length > 50 ? '...' : ''),
          category: row.category,
          score: row.score,
        })),
      });
    }

    return NextResponse.json({ leaderboard: [] });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json({ error: 'Failed to get leaderboard' }, { status: 500 });
  }
}
