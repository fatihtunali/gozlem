import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    if (!query || query.length < 2) {
      return NextResponse.json({ truths: [], total: 0 });
    }

    // Search with trigram similarity or simple ILIKE
    const result = await pool.query(
      `SELECT id, content, category, me_too_count, hug_count, created_at, is_featured
       FROM truths
       WHERE is_visible = true
         AND content ILIKE $1
       ORDER BY me_too_count DESC, created_at DESC
       LIMIT $2`,
      [`%${query}%`, limit]
    );

    return NextResponse.json({
      truths: result.rows,
      total: result.rows.length,
      query
    });
  } catch (error) {
    console.error('Failed to search truths:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
