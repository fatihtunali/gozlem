import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import pool from '@/lib/db';

// Valid categories
const CATEGORIES = ['itiraf', 'ask', 'korku', 'pismanlik', 'umut', 'sir'] as const;
type Category = typeof CATEGORIES[number];

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 1000;
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
  return createHash('sha256').update(ip + (process.env.IP_SALT || 'default-salt')).digest('hex').slice(0, 16);
}

function isContentValid(content: string): { valid: boolean; reason?: string } {
  if (content.length < 10) return { valid: false, reason: 'Çok kısa' };
  if (content.length > 500) return { valid: false, reason: 'Çok uzun' };
  if (/https?:\/\/|www\./i.test(content)) return { valid: false, reason: 'Link paylaşılamaz' };
  if (/(\+90|0)?\s*[0-9]{3}\s*[0-9]{3}\s*[0-9]{2}\s*[0-9]{2}/.test(content)) {
    return { valid: false, reason: 'Telefon numarası paylaşılamaz' };
  }
  return { valid: true };
}

// Generate a random 8-character alphanumeric code
function generateSecretCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars: I, O, 0, 1
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET - List truths
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'new';
    const featured = searchParams.get('featured') === 'true';
    const random = searchParams.get('random') === 'true';

    // Boosted confessions come first, then sort by the selected order
    let orderBy = '(is_boosted = true AND boost_ends_at > NOW()) DESC, created_at DESC';
    if (sort === 'top') orderBy = '(is_boosted = true AND boost_ends_at > NOW()) DESC, me_too_count DESC, created_at DESC';
    if (random) orderBy = 'RANDOM()';

    let whereClause = 'is_visible = true';
    const params: (string | number | boolean)[] = [];
    let paramIndex = 1;

    if (category && CATEGORIES.includes(category as Category)) {
      whereClause += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (featured) {
      whereClause += ` AND is_featured = true`;
    }

    params.push(limit, offset);

    const [truthsResult, countResult, statsResult] = await Promise.all([
      pool.query(
        `SELECT id, content, category, me_too_count, COALESCE(hug_count, 0) as hug_count, created_at, is_featured,
                COALESCE(is_boosted, false) as is_boosted, boost_ends_at,
                (is_boosted = true AND boost_ends_at > NOW()) as is_currently_boosted
         FROM truths
         WHERE ${whereClause}
         ORDER BY ${orderBy}
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        params
      ),
      pool.query(`SELECT COUNT(*) as total FROM truths WHERE ${whereClause}`, params.slice(0, -2)),
      pool.query(`
        SELECT
          COUNT(*) as total_truths,
          COALESCE(SUM(me_too_count), 0) as total_me_too,
          COUNT(DISTINCT ip_hash) as unique_users
        FROM truths WHERE is_visible = true
      `)
    ]);

    return NextResponse.json({
      truths: truthsResult.rows,
      total: parseInt(countResult.rows[0].total),
      stats: {
        totalTruths: parseInt(statsResult.rows[0].total_truths),
        totalMeToo: parseInt(statsResult.rows[0].total_me_too),
        uniqueUsers: parseInt(statsResult.rows[0].unique_users),
      },
      limit,
      offset,
    });
  } catch (error) {
    console.error('Failed to fetch truths:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

// POST - Create new truth
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') || 'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Çok fazla istek. Biraz bekle.' }, { status: 429 });
    }

    const body = await request.json();
    const content = body.content?.trim();
    const category = CATEGORIES.includes(body.category) ? body.category : 'itiraf';
    const email = body.email?.trim() || null;

    const validation = isContentValid(content);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }

    // Validate email if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Gecersiz e-posta adresi' }, { status: 400 });
    }

    const ipHash = hashIP(ip);
    const secretCode = generateSecretCode();

    const result = await pool.query(
      `INSERT INTO truths (content, category, ip_hash, secret_code, owner_email, notify_comments)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, content, category, me_too_count, created_at, secret_code`,
      [content, category, ipHash, secretCode, email, email ? true : false]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create truth:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
