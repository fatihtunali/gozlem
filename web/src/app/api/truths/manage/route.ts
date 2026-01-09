import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * GET /api/truths/manage?code=XXXXXXXX
 * Get confession details using secret code
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code')?.toUpperCase().trim();

    if (!code || code.length !== 8) {
      return NextResponse.json({ error: 'Gecersiz kod' }, { status: 400 });
    }

    // Get confession with stats
    const result = await pool.query(
      `SELECT
        t.id, t.content, t.category, t.me_too_count,
        COALESCE(t.hug_count, 0) as hug_count,
        t.created_at, t.owner_email, t.notify_comments,
        COALESCE(t.is_boosted, false) as is_boosted,
        t.boost_ends_at,
        (t.is_boosted = true AND t.boost_ends_at > NOW()) as is_currently_boosted,
        (SELECT COUNT(*) FROM comments WHERE truth_id = t.id AND is_visible = true) as comment_count
       FROM truths t
       WHERE t.secret_code = $1 AND t.is_visible = true`,
      [code]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Itiraf bulunamadi' }, { status: 404 });
    }

    const truth = result.rows[0];

    // Get comments
    const commentsResult = await pool.query(
      `SELECT id, content, created_at
       FROM comments
       WHERE truth_id = $1 AND is_visible = true
       ORDER BY created_at DESC`,
      [truth.id]
    );

    return NextResponse.json({
      truth: {
        ...truth,
        comments: commentsResult.rows,
      },
    });
  } catch (error) {
    console.error('Failed to fetch managed truth:', error);
    return NextResponse.json({ error: 'Bir hata olustu' }, { status: 500 });
  }
}

/**
 * PATCH /api/truths/manage
 * Update email notification settings
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const code = body.code?.toUpperCase().trim();
    const email = body.email?.trim() || null;
    const notifyComments = body.notifyComments ?? true;

    if (!code || code.length !== 8) {
      return NextResponse.json({ error: 'Gecersiz kod' }, { status: 400 });
    }

    // Validate email if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Gecersiz e-posta adresi' }, { status: 400 });
    }

    const result = await pool.query(
      `UPDATE truths
       SET owner_email = $1, notify_comments = $2
       WHERE secret_code = $3 AND is_visible = true
       RETURNING id`,
      [email, email ? notifyComments : false, code]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Itiraf bulunamadi' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update truth settings:', error);
    return NextResponse.json({ error: 'Bir hata olustu' }, { status: 500 });
  }
}

/**
 * DELETE /api/truths/manage
 * Delete confession using secret code
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code')?.toUpperCase().trim();

    if (!code || code.length !== 8) {
      return NextResponse.json({ error: 'Gecersiz kod' }, { status: 400 });
    }

    // Soft delete - just mark as invisible
    const result = await pool.query(
      `UPDATE truths
       SET is_visible = false
       WHERE secret_code = $1 AND is_visible = true
       RETURNING id`,
      [code]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Itiraf bulunamadi' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Itiraf silindi' });
  } catch (error) {
    console.error('Failed to delete truth:', error);
    return NextResponse.json({ error: 'Bir hata olustu' }, { status: 500 });
  }
}
