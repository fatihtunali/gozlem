import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Get trending hashtags
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    const result = await pool.query(
      `SELECT tag, usage_count
       FROM hashtags
       ORDER BY usage_count DESC
       LIMIT $1`,
      [limit]
    );

    return NextResponse.json({
      hashtags: result.rows
    });
  } catch (error) {
    console.error('Failed to fetch hashtags:', error);
    return NextResponse.json({ error: 'Bir hata olustu' }, { status: 500 });
  }
}
