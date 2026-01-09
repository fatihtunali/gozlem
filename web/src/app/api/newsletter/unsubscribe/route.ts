import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Unsubscribe from newsletter using token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 400 });
    }

    const result = await pool.query(
      `UPDATE newsletter_subscribers
       SET is_active = FALSE, unsubscribed_at = NOW()
       WHERE unsubscribe_token = $1 AND is_active = TRUE
       RETURNING email`,
      [token]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Gecersiz token veya zaten iptal edilmis' }, { status: 404 });
    }

    // Redirect to a nice page or return success
    return NextResponse.redirect(new URL('/abonelik-iptal?success=true', request.url));
  } catch (error) {
    console.error('Newsletter unsubscribe failed:', error);
    return NextResponse.json({ error: 'Bir hata olustu' }, { status: 500 });
  }
}
