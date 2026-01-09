import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'gozlem2024admin';

function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.slice(7);
  return token === ADMIN_PASSWORD;
}

/**
 * GET /api/admin - Get dashboard stats and data
 */
export async function GET(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Yetkisiz erisim' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'dashboard';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const offset = (page - 1) * limit;

    if (type === 'dashboard') {
      const [stats, recentTruths, recentPayments] = await Promise.all([
        pool.query(`
          SELECT
            (SELECT COUNT(*) FROM truths) as total_truths,
            (SELECT COUNT(*) FROM truths WHERE is_visible = true) as visible_truths,
            (SELECT COUNT(*) FROM truths WHERE created_at > NOW() - INTERVAL '24 hours') as truths_today,
            (SELECT COUNT(*) FROM comments) as total_comments,
            (SELECT COUNT(*) FROM comments WHERE created_at > NOW() - INTERVAL '24 hours') as comments_today,
            (SELECT COALESCE(SUM(me_too_count), 0) FROM truths) as total_metoo,
            (SELECT COALESCE(SUM(hug_count), 0) FROM truths) as total_hugs,
            (SELECT COUNT(*) FROM payment_logs WHERE status = 'SUCCESS') as successful_payments,
            (SELECT COALESCE(SUM(amount), 0) FROM payment_logs WHERE status = 'SUCCESS') as total_revenue,
            (SELECT COUNT(*) FROM boosts WHERE ends_at > NOW()) as active_boosts
        `),
        pool.query(`
          SELECT id, content, category, me_too_count, hug_count, is_visible, created_at
          FROM truths ORDER BY created_at DESC LIMIT 5
        `),
        pool.query(`
          SELECT order_id, amount, status, customer_email, created_at
          FROM payment_logs ORDER BY created_at DESC LIMIT 5
        `),
      ]);

      return NextResponse.json({
        stats: stats.rows[0],
        recentTruths: recentTruths.rows,
        recentPayments: recentPayments.rows,
      });
    }

    if (type === 'truths') {
      const [truths, count] = await Promise.all([
        pool.query(`
          SELECT t.id, t.content, t.category, t.me_too_count, t.hug_count, t.is_visible,
                 t.is_boosted, t.boost_ends_at, t.created_at, t.secret_code, t.owner_email,
                 (SELECT COUNT(*) FROM comments WHERE truth_id = t.id) as comment_count
          FROM truths t
          ORDER BY t.created_at DESC
          LIMIT $1 OFFSET $2
        `, [limit, offset]),
        pool.query('SELECT COUNT(*) as total FROM truths'),
      ]);

      return NextResponse.json({
        truths: truths.rows,
        total: parseInt(count.rows[0].total),
        page,
        totalPages: Math.ceil(parseInt(count.rows[0].total) / limit),
      });
    }

    if (type === 'comments') {
      const [comments, count] = await Promise.all([
        pool.query(`
          SELECT c.id, c.content, c.is_visible, c.created_at, c.truth_id,
                 t.content as truth_content
          FROM comments c
          LEFT JOIN truths t ON t.id = c.truth_id
          ORDER BY c.created_at DESC
          LIMIT $1 OFFSET $2
        `, [limit, offset]),
        pool.query('SELECT COUNT(*) as total FROM comments'),
      ]);

      return NextResponse.json({
        comments: comments.rows,
        total: parseInt(count.rows[0].total),
        page,
        totalPages: Math.ceil(parseInt(count.rows[0].total) / limit),
      });
    }

    if (type === 'payments') {
      const [payments, count] = await Promise.all([
        pool.query(`
          SELECT p.*, t.content as truth_content
          FROM payment_logs p
          LEFT JOIN truths t ON t.id = p.truth_id
          ORDER BY p.created_at DESC
          LIMIT $1 OFFSET $2
        `, [limit, offset]),
        pool.query('SELECT COUNT(*) as total FROM payment_logs'),
      ]);

      return NextResponse.json({
        payments: payments.rows,
        total: parseInt(count.rows[0].total),
        page,
        totalPages: Math.ceil(parseInt(count.rows[0].total) / limit),
      });
    }

    if (type === 'boosts') {
      const boosts = await pool.query(`
        SELECT b.*, t.content as truth_content, p.customer_email
        FROM boosts b
        LEFT JOIN truths t ON t.id = b.truth_id
        LEFT JOIN payment_logs p ON p.order_id = b.order_id
        ORDER BY b.ends_at DESC
      `);

      return NextResponse.json({ boosts: boosts.rows });
    }

    if (type === 'moderation') {
      // Get pending moderation items (hidden truths that need review)
      const [pendingTruths, pendingComments] = await Promise.all([
        pool.query(`
          SELECT id, content, category, created_at
          FROM truths
          WHERE is_visible = false
          ORDER BY created_at DESC
          LIMIT 50
        `),
        pool.query(`
          SELECT c.id, c.content, c.created_at, t.content as truth_content
          FROM comments c
          LEFT JOIN truths t ON t.id = c.truth_id
          WHERE c.is_visible = false
          ORDER BY c.created_at DESC
          LIMIT 50
        `),
      ]);

      return NextResponse.json({
        pendingTruths: pendingTruths.rows,
        pendingComments: pendingComments.rows,
      });
    }

    return NextResponse.json({ error: 'Gecersiz istek tipi' }, { status: 400 });
  } catch (error) {
    console.error('[Admin] Error:', error);
    return NextResponse.json({ error: 'Bir hata olustu' }, { status: 500 });
  }
}

/**
 * POST /api/admin - Admin actions
 */
export async function POST(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Yetkisiz erisim' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, id } = body;

    if (action === 'hide_truth') {
      await pool.query('UPDATE truths SET is_visible = false WHERE id = $1', [id]);
      return NextResponse.json({ success: true });
    }

    if (action === 'show_truth') {
      await pool.query('UPDATE truths SET is_visible = true WHERE id = $1', [id]);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_truth') {
      await pool.query('DELETE FROM truths WHERE id = $1', [id]);
      return NextResponse.json({ success: true });
    }

    if (action === 'hide_comment') {
      await pool.query('UPDATE comments SET is_visible = false WHERE id = $1', [id]);
      return NextResponse.json({ success: true });
    }

    if (action === 'show_comment') {
      await pool.query('UPDATE comments SET is_visible = true WHERE id = $1', [id]);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_comment') {
      await pool.query('DELETE FROM comments WHERE id = $1', [id]);
      return NextResponse.json({ success: true });
    }

    if (action === 'cancel_boost') {
      await pool.query('UPDATE truths SET is_boosted = false, boost_ends_at = NULL WHERE id = $1', [id]);
      await pool.query('DELETE FROM boosts WHERE truth_id = $1', [id]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Gecersiz aksiyon' }, { status: 400 });
  } catch (error) {
    console.error('[Admin] Action error:', error);
    return NextResponse.json({ error: 'Bir hata olustu' }, { status: 500 });
  }
}
