import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * GET /api/editors-pick
 * Get editor's pick confessions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'today'; // today, week, all
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 20);

    let dateFilter = '';
    if (type === 'today') {
      dateFilter = "AND editors_pick_date = CURRENT_DATE";
    } else if (type === 'week') {
      dateFilter = "AND editors_pick_date >= CURRENT_DATE - INTERVAL '7 days'";
    }

    const result = await pool.query(
      `SELECT id, content, category, me_too_count, COALESCE(hug_count, 0) as hug_count,
              created_at, editors_note, editors_pick_date
       FROM truths
       WHERE is_editors_pick = true AND is_visible = true
       ${dateFilter}
       ORDER BY editors_pick_date DESC, created_at DESC
       LIMIT $1`,
      [limit]
    );

    return NextResponse.json({ picks: result.rows });
  } catch (error) {
    console.error('Get editors pick error:', error);
    return NextResponse.json({ error: 'Failed to get picks' }, { status: 500 });
  }
}

/**
 * POST /api/editors-pick
 * Set a confession as editor's pick (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { truthId, note, adminCode } = body;

    // Simple admin check
    if (adminCode !== process.env.ADMIN_CODE) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
    }

    if (!truthId) {
      return NextResponse.json({ error: 'Truth ID gerekli' }, { status: 400 });
    }

    await pool.query(
      `UPDATE truths
       SET is_editors_pick = true, editors_pick_date = CURRENT_DATE, editors_note = $1
       WHERE id = $2`,
      [note || null, truthId]
    );

    return NextResponse.json({ success: true, message: 'Editor secimi yapildi' });
  } catch (error) {
    console.error('Set editors pick error:', error);
    return NextResponse.json({ error: 'Failed to set pick' }, { status: 500 });
  }
}
