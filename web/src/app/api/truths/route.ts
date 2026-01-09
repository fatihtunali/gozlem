import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import pool from '@/lib/db';

// Simple in-memory rate limiting (for production, use Redis)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimitMap.get(ip) || 0;

  if (now - lastRequest < RATE_LIMIT_WINDOW / MAX_REQUESTS) {
    return true;
  }

  rateLimitMap.set(ip, now);
  return false;
}

function hashIP(ip: string): string {
  return createHash('sha256').update(ip + process.env.IP_SALT || 'default-salt').digest('hex').slice(0, 16);
}

// Simple content filter
function isContentValid(content: string): { valid: boolean; reason?: string } {
  if (content.length < 10) {
    return { valid: false, reason: 'Çok kısa' };
  }
  if (content.length > 500) {
    return { valid: false, reason: 'Çok uzun' };
  }

  // Block URLs
  if (/https?:\/\/|www\./i.test(content)) {
    return { valid: false, reason: 'Link paylaşılamaz' };
  }

  // Block phone numbers
  if (/(\+90|0)?\s*[0-9]{3}\s*[0-9]{3}\s*[0-9]{2}\s*[0-9]{2}/.test(content)) {
    return { valid: false, reason: 'Telefon numarası paylaşılamaz' };
  }

  return { valid: true };
}

// GET - List truths
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') === 'top' ? 'me_too_count DESC' : 'created_at DESC';

    const [truthsResult, countResult] = await Promise.all([
      pool.query(
        `SELECT id, content, me_too_count, created_at
         FROM truths
         WHERE is_visible = true
         ORDER BY ${sort}
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      pool.query('SELECT COUNT(*) as total FROM truths WHERE is_visible = true')
    ]);

    return NextResponse.json({
      truths: truthsResult.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset,
    });
  } catch (error) {
    console.error('Failed to fetch truths:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Create new truth
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Rate limiting
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Çok fazla istek. Biraz bekle.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const content = body.content?.trim();

    // Validate content
    const validation = isContentValid(content);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.reason },
        { status: 400 }
      );
    }

    const ipHash = hashIP(ip);

    // Insert into database
    const result = await pool.query(
      `INSERT INTO truths (content, ip_hash)
       VALUES ($1, $2)
       RETURNING id, content, me_too_count, created_at`,
      [content, ipHash]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create truth:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
