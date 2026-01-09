import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import pool from '@/lib/db';

function hashIP(ip: string): string {
  return createHash('sha256').update(ip + (process.env.IP_SALT || 'default-salt')).digest('hex').slice(0, 16);
}

/**
 * GET /api/polls
 * Get active polls or poll by truth_id
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const truthId = searchParams.get('truthId');
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') || 'unknown';
    const ipHash = hashIP(ip);

    let query = `
      SELECT p.id, p.truth_id, p.question, p.created_at, p.ends_at,
             json_agg(json_build_object(
               'id', po.id,
               'text', po.option_text,
               'votes', po.vote_count,
               'order', po.display_order
             ) ORDER BY po.display_order) as options,
             (SELECT option_id FROM poll_votes WHERE poll_id = p.id AND ip_hash = $1) as user_vote
      FROM polls p
      LEFT JOIN poll_options po ON po.poll_id = p.id
      WHERE p.is_active = true
    `;
    const params: (string | null)[] = [ipHash];

    if (truthId) {
      query += ` AND p.truth_id = $2`;
      params.push(truthId);
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC`;

    const result = await pool.query(query, params);

    return NextResponse.json({ polls: result.rows });
  } catch (error) {
    console.error('Get polls error:', error);
    return NextResponse.json({ error: 'Failed to get polls' }, { status: 500 });
  }
}

/**
 * POST /api/polls
 * Create a new poll (admin only or with truth)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { truthId, question, options, endsAt } = body;

    if (!question || !options || options.length < 2) {
      return NextResponse.json({ error: 'En az 2 secenek gerekli' }, { status: 400 });
    }

    // Create poll
    const pollResult = await pool.query(
      `INSERT INTO polls (truth_id, question, ends_at)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [truthId || null, question, endsAt || null]
    );

    const pollId = pollResult.rows[0].id;

    // Create options
    for (let i = 0; i < options.length; i++) {
      await pool.query(
        `INSERT INTO poll_options (poll_id, option_text, display_order)
         VALUES ($1, $2, $3)`,
        [pollId, options[i], i]
      );
    }

    return NextResponse.json({ pollId, message: 'Anket olusturuldu' }, { status: 201 });
  } catch (error) {
    console.error('Create poll error:', error);
    return NextResponse.json({ error: 'Failed to create poll' }, { status: 500 });
  }
}
