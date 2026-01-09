import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import pool from '@/lib/db';

function hashIP(ip: string): string {
  return createHash('sha256').update(ip + (process.env.IP_SALT || 'default-salt')).digest('hex').slice(0, 16);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') || 'unknown';
    const voterHash = hashIP(ip);

    // Check if already hugged
    const existing = await pool.query(
      'SELECT id FROM hug_votes WHERE truth_id = $1 AND voter_hash = $2',
      [id, voterHash]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Zaten sarıldın' }, { status: 400 });
    }

    // Add hug vote and increment counter in transaction
    await pool.query('BEGIN');
    await pool.query(
      'INSERT INTO hug_votes (truth_id, voter_hash) VALUES ($1, $2)',
      [id, voterHash]
    );
    await pool.query(
      'UPDATE truths SET hug_count = hug_count + 1 WHERE id = $1',
      [id]
    );
    await pool.query('COMMIT');

    return NextResponse.json({ success: true });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Failed to hug:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
