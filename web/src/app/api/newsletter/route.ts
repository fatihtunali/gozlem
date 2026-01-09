import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// POST - Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email?.trim()?.toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Gecersiz e-posta adresi' }, { status: 400 });
    }

    // Try to insert, or reactivate if exists
    const result = await pool.query(
      `INSERT INTO newsletter_subscribers (email)
       VALUES ($1)
       ON CONFLICT (email) DO UPDATE SET is_active = TRUE, unsubscribed_at = NULL
       RETURNING id`,
      [email]
    );

    return NextResponse.json({
      success: true,
      message: 'Bulten aboneligin basariyla olusturuldu!'
    }, { status: 201 });
  } catch (error) {
    console.error('Newsletter subscription failed:', error);
    return NextResponse.json({ error: 'Bir hata olustu' }, { status: 500 });
  }
}
