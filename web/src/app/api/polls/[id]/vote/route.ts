import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import pool from '@/lib/db';

function hashIP(ip: string): string {
  return createHash('sha256').update(ip + (process.env.IP_SALT || 'default-salt')).digest('hex').slice(0, 16);
}

/**
 * POST /api/polls/[id]/vote
 * Vote on a poll
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') || 'unknown';
    const ipHash = hashIP(ip);

    const body = await request.json();
    const { optionId } = body;

    if (!optionId) {
      return NextResponse.json({ error: 'Secenek secilmedi' }, { status: 400 });
    }

    // Check if poll exists and is active
    const pollCheck = await pool.query(
      'SELECT id FROM polls WHERE id = $1 AND is_active = true',
      [pollId]
    );

    if (pollCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Anket bulunamadi veya sona ermis' }, { status: 404 });
    }

    // Check if already voted
    const voteCheck = await pool.query(
      'SELECT id FROM poll_votes WHERE poll_id = $1 AND ip_hash = $2',
      [pollId, ipHash]
    );

    if (voteCheck.rows.length > 0) {
      return NextResponse.json({ error: 'Zaten oy kullandiniz' }, { status: 400 });
    }

    // Record vote
    await pool.query(
      'INSERT INTO poll_votes (poll_id, option_id, ip_hash) VALUES ($1, $2, $3)',
      [pollId, optionId, ipHash]
    );

    // Update vote count
    await pool.query(
      'UPDATE poll_options SET vote_count = vote_count + 1 WHERE id = $1',
      [optionId]
    );

    // Get updated poll results
    const result = await pool.query(
      `SELECT po.id, po.option_text as text, po.vote_count as votes
       FROM poll_options po
       WHERE po.poll_id = $1
       ORDER BY po.display_order`,
      [pollId]
    );

    return NextResponse.json({
      success: true,
      options: result.rows,
      userVote: optionId,
    });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }
}
