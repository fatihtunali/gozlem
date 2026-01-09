import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Get date 7 days ago
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString();

    const [
      truthsCountResult,
      meTooResult,
      hugsResult,
      commentsResult,
      topTruthsResult,
      categoryResult
    ] = await Promise.all([
      // Total new truths this week
      pool.query(
        `SELECT COUNT(*) as count FROM truths WHERE created_at >= $1 AND is_visible = true`,
        [weekAgoStr]
      ),
      // Total me_too votes this week
      pool.query(
        `SELECT COUNT(*) as count FROM me_too_votes WHERE created_at >= $1`,
        [weekAgoStr]
      ),
      // Total hugs this week
      pool.query(
        `SELECT COUNT(*) as count FROM hug_votes WHERE created_at >= $1`,
        [weekAgoStr]
      ),
      // Total comments this week
      pool.query(
        `SELECT COUNT(*) as count FROM comments WHERE created_at >= $1 AND is_visible = true`,
        [weekAgoStr]
      ),
      // Top 5 truths this week by engagement
      pool.query(
        `SELECT id, content, category, me_too_count, COALESCE(hug_count, 0) as hug_count
         FROM truths
         WHERE created_at >= $1 AND is_visible = true
         ORDER BY (me_too_count + COALESCE(hug_count, 0)) DESC
         LIMIT 5`,
        [weekAgoStr]
      ),
      // Category breakdown this week
      pool.query(
        `SELECT category, COUNT(*) as count
         FROM truths
         WHERE created_at >= $1 AND is_visible = true
         GROUP BY category
         ORDER BY count DESC`,
        [weekAgoStr]
      )
    ]);

    return NextResponse.json({
      totalTruths: parseInt(truthsCountResult.rows[0]?.count || '0'),
      totalMeToo: parseInt(meTooResult.rows[0]?.count || '0'),
      totalHugs: parseInt(hugsResult.rows[0]?.count || '0'),
      totalComments: parseInt(commentsResult.rows[0]?.count || '0'),
      topTruths: topTruthsResult.rows,
      categoryStats: categoryResult.rows.map(r => ({
        category: r.category,
        count: parseInt(r.count)
      }))
    });
  } catch (error) {
    console.error('Failed to fetch weekly stats:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
