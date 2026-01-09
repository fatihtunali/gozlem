import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Get gift types catalog
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, name, emoji, price, description FROM gift_types ORDER BY price ASC`
    );

    return NextResponse.json({ gifts: result.rows });
  } catch (error) {
    console.error('Failed to fetch gift types:', error);
    return NextResponse.json({ error: 'Bir hata olustu' }, { status: 500 });
  }
}
