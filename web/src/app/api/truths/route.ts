import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import pool from '@/lib/db';
import { moderateContent, shouldAutoHide, needsManualReview } from '@/lib/moderation';

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

// Extract hashtags from content
function extractHashtags(content: string): string[] {
  const matches = content.match(/#([a-zA-Z0-9çğıöşüÇĞİÖŞÜ_]+)/g);
  if (!matches) return [];
  return [...new Set(matches.map(tag => tag.slice(1).toLowerCase()))];
}

// Process and save hashtags for a truth
async function processHashtags(truthId: string, content: string): Promise<void> {
  const hashtags = extractHashtags(content);
  if (hashtags.length === 0) return;

  for (const tag of hashtags) {
    try {
      // Insert or update hashtag
      const hashtagResult = await pool.query(
        `INSERT INTO hashtags (tag, usage_count)
         VALUES ($1, 1)
         ON CONFLICT (tag) DO UPDATE SET usage_count = hashtags.usage_count + 1
         RETURNING id`,
        [tag]
      );

      // Link truth to hashtag
      await pool.query(
        `INSERT INTO truth_hashtags (truth_id, hashtag_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [truthId, hashtagResult.rows[0].id]
      );
    } catch (err) {
      console.error('Failed to process hashtag:', tag, err);
    }
  }
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
    const hashtag = searchParams.get('hashtag')?.toLowerCase();

    // Boosted confessions come first, then sort by the selected order
    let orderBy = '(t.is_boosted = true AND t.boost_ends_at > NOW()) DESC, t.created_at DESC';
    if (sort === 'top') orderBy = '(t.is_boosted = true AND t.boost_ends_at > NOW()) DESC, t.me_too_count DESC, t.created_at DESC';
    if (random) orderBy = 'RANDOM()';

    let whereClause = 't.is_visible = true';
    const params: (string | number | boolean)[] = [];
    let paramIndex = 1;
    let joinClause = '';

    if (category && CATEGORIES.includes(category as Category)) {
      whereClause += ` AND t.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (featured) {
      whereClause += ` AND t.is_featured = true`;
    }

    // Filter by hashtag
    if (hashtag) {
      joinClause = `
        INNER JOIN truth_hashtags th ON t.id = th.truth_id
        INNER JOIN hashtags h ON th.hashtag_id = h.id AND h.tag = $${paramIndex}
      `;
      params.push(hashtag);
      paramIndex++;
    }

    params.push(limit, offset);

    const [truthsResult, countResult, statsResult] = await Promise.all([
      pool.query(
        `SELECT t.id, t.content, t.category, t.me_too_count, COALESCE(t.hug_count, 0) as hug_count,
                COALESCE(t.gift_count, 0) as gift_count, t.created_at, t.is_featured,
                COALESCE(t.is_boosted, false) as is_boosted, t.boost_ends_at,
                (t.is_boosted = true AND t.boost_ends_at > NOW()) as is_currently_boosted
         FROM truths t
         ${joinClause}
         WHERE ${whereClause}
         ORDER BY ${orderBy}
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        params
      ),
      pool.query(
        `SELECT COUNT(*) as total FROM truths t ${joinClause} WHERE ${whereClause}`,
        params.slice(0, -2)
      ),
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
      hashtag: hashtag || null,
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

    // AI Moderation check
    const moderationResult = await moderateContent(content);

    if (shouldAutoHide(moderationResult)) {
      // Auto-reject content that's clearly inappropriate
      return NextResponse.json({
        error: moderationResult.reason || 'Bu icerik yayin kurallarina uygun degil'
      }, { status: 400 });
    }

    const ipHash = hashIP(ip);
    const secretCode = generateSecretCode();

    // If needs manual review, set is_visible to false
    const isVisible = !needsManualReview(moderationResult);

    const result = await pool.query(
      `INSERT INTO truths (content, category, ip_hash, secret_code, owner_email, notify_comments, is_visible)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, content, category, me_too_count, created_at, secret_code`,
      [content, category, ipHash, secretCode, email, email ? true : false, isVisible]
    );

    // Process hashtags in background
    const truth = result.rows[0];
    processHashtags(truth.id, content).catch(err =>
      console.error('Failed to process hashtags:', err)
    );

    return NextResponse.json(truth, { status: 201 });
  } catch (error) {
    console.error('Failed to create truth:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
