import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import pool from '@/lib/db';

function hashIP(ip: string): string {
  return createHash('sha256').update(ip + (process.env.IP_SALT || 'default-salt')).digest('hex').slice(0, 16);
}

// Rate limiting
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimitMap.get(ip) || 0;
  if (now - lastRequest < RATE_LIMIT_WINDOW / MAX_REQUESTS) {
    return true;
  }
  rateLimitMap.set(ip, now);
  return false;
}

// GET - List comments for a truth
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `SELECT id, content, created_at
       FROM comments
       WHERE truth_id = $1 AND is_visible = true
       ORDER BY created_at ASC
       LIMIT 50`,
      [id]
    );

    return NextResponse.json({ comments: result.rows });
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

// POST - Add a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') || 'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Çok fazla yorum. Biraz bekle.' }, { status: 429 });
    }

    const body = await request.json();
    const content = body.content?.trim();

    if (!content || content.length < 2) {
      return NextResponse.json({ error: 'Çok kısa' }, { status: 400 });
    }
    if (content.length > 150) {
      return NextResponse.json({ error: 'Çok uzun (max 150)' }, { status: 400 });
    }

    const ipHash = hashIP(ip);

    const result = await pool.query(
      `INSERT INTO comments (truth_id, content, ip_hash)
       VALUES ($1, $2, $3)
       RETURNING id, content, created_at`,
      [id, content, ipHash]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create comment:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
