import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import pool from '@/lib/db';

function hashIP(ip: string): string {
  return createHash('sha256').update(ip + (process.env.IP_SALT || 'default-salt')).digest('hex').slice(0, 16);
}

// GET - Get gifts for a truth
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `SELECT g.id, g.gift_type_id, gt.emoji, gt.name, g.message, g.created_at
       FROM gifts g
       JOIN gift_types gt ON g.gift_type_id = gt.id
       WHERE g.truth_id = $1
       ORDER BY g.created_at DESC
       LIMIT 50`,
      [id]
    );

    // Get summary
    const summaryResult = await pool.query(
      `SELECT gt.emoji, gt.name, COUNT(*) as count
       FROM gifts g
       JOIN gift_types gt ON g.gift_type_id = gt.id
       WHERE g.truth_id = $1
       GROUP BY gt.id, gt.emoji, gt.name
       ORDER BY count DESC`,
      [id]
    );

    return NextResponse.json({
      gifts: result.rows,
      summary: summaryResult.rows
    });
  } catch (error) {
    console.error('Failed to fetch gifts:', error);
    return NextResponse.json({ error: 'Bir hata olustu' }, { status: 500 });
  }
}

// POST - Send a gift (free version - for testing, real version uses payment)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') || 'unknown';
    const ipHash = hashIP(ip);

    const body = await request.json();
    const giftTypeId = body.giftTypeId;
    const message = body.message?.trim()?.slice(0, 100) || null;

    // Validate gift type exists
    const giftTypeResult = await pool.query(
      `SELECT id, price FROM gift_types WHERE id = $1`,
      [giftTypeId]
    );

    if (giftTypeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Gecersiz hediye tipi' }, { status: 400 });
    }

    const giftType = giftTypeResult.rows[0];

    // Check if truth exists
    const truthResult = await pool.query(
      `SELECT id FROM truths WHERE id = $1 AND is_visible = true`,
      [id]
    );

    if (truthResult.rows.length === 0) {
      return NextResponse.json({ error: 'Itiraf bulunamadi' }, { status: 404 });
    }

    // Insert gift
    const result = await pool.query(
      `INSERT INTO gifts (truth_id, gift_type_id, sender_ip_hash, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      [id, giftTypeId, ipHash, message]
    );

    // Update truth gift count and value
    await pool.query(
      `UPDATE truths
       SET gift_count = gift_count + 1, gift_value = gift_value + $1
       WHERE id = $2`,
      [giftType.price, id]
    );

    return NextResponse.json({
      success: true,
      gift: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to send gift:', error);
    return NextResponse.json({ error: 'Bir hata olustu' }, { status: 500 });
  }
}
