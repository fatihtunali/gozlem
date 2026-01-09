import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import pool from '@/lib/db';

function hashIP(ip: string): string {
  return createHash('sha256').update(ip + process.env.IP_SALT || 'default-salt').digest('hex').slice(0, 16);
}

// POST - Vote "me too" on a truth
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: truthId } = await params;

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';

    const voterHash = hashIP(ip);

    // Check if truth exists
    const truthCheck = await pool.query(
      'SELECT id FROM truths WHERE id = $1 AND is_visible = true',
      [truthId]
    );

    if (truthCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'İtiraf bulunamadı' },
        { status: 404 }
      );
    }

    // Check if already voted
    const voteCheck = await pool.query(
      'SELECT id FROM me_too_votes WHERE truth_id = $1 AND voter_hash = $2',
      [truthId, voterHash]
    );

    if (voteCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Zaten oy verdin' },
        { status: 409 }
      );
    }

    // Insert vote and update count in transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        'INSERT INTO me_too_votes (truth_id, voter_hash) VALUES ($1, $2)',
        [truthId, voterHash]
      );

      const result = await client.query(
        `UPDATE truths SET me_too_count = me_too_count + 1
         WHERE id = $1
         RETURNING me_too_count`,
        [truthId]
      );

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        me_too_count: result.rows[0].me_too_count,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Failed to vote:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
