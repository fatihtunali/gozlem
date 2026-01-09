import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { create3DSecureForm, isHalkbankConfigured } from '@/lib/halkbank';

// Boost prices in TRY
const BOOST_PRICES: Record<string, number> = {
  '1_hour': 9.99,
  '3_hours': 19.99,
  '24_hours': 49.99,
};

function getClientIP(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return headers.get('x-real-ip') || '0.0.0.0';
}

/**
 * POST /api/payments/halkbank/initiate
 * Initialize 3D Secure payment for confession boost
 */
export async function POST(request: NextRequest) {
  try {
    if (!isHalkbankConfigured()) {
      return NextResponse.json(
        { error: 'Odeme sistemi yapilandirilamadi' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      truthId,
      boostDuration,
      cardNumber,
      cardExpMonth,
      cardExpYear,
      cardCvv,
      cardHolderName,
      email,
    } = body;

    // Validate required fields
    if (!truthId || !boostDuration || !cardNumber || !cardExpMonth || !cardExpYear || !cardCvv || !cardHolderName) {
      return NextResponse.json(
        { error: 'Eksik bilgi' },
        { status: 400 }
      );
    }

    // Validate boost duration
    const price = BOOST_PRICES[boostDuration];
    if (!price) {
      return NextResponse.json(
        { error: 'Gecersiz boost suresi' },
        { status: 400 }
      );
    }

    // Basic card validation
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cleanCardNumber)) {
      return NextResponse.json({ error: 'Gecersiz kart numarasi' }, { status: 400 });
    }

    if (!/^\d{2}$/.test(cardExpMonth) || parseInt(cardExpMonth) < 1 || parseInt(cardExpMonth) > 12) {
      return NextResponse.json({ error: 'Gecersiz son kullanma ayi' }, { status: 400 });
    }

    if (!/^\d{2,4}$/.test(cardExpYear)) {
      return NextResponse.json({ error: 'Gecersiz son kullanma yili' }, { status: 400 });
    }

    if (!/^\d{3,4}$/.test(cardCvv)) {
      return NextResponse.json({ error: 'Gecersiz CVV' }, { status: 400 });
    }

    // Check if truth exists
    const truthResult = await pool.query(
      'SELECT id, content FROM truths WHERE id = $1 AND is_visible = true',
      [truthId]
    );

    if (truthResult.rows.length === 0) {
      return NextResponse.json({ error: 'Itiraf bulunamadi' }, { status: 404 });
    }

    // Get client IP
    const clientIp = getClientIP(request.headers);

    // Generate unique order ID
    const orderId = `BOOST-${truthId.slice(0, 8)}-${Date.now()}`;

    // Create 3D Secure form data
    const formData = create3DSecureForm({
      orderId,
      amount: price,
      currency: 'TRY',
      cardNumber: cleanCardNumber,
      cardExpMonth,
      cardExpYear,
      cardCvv,
      cardHolderName,
      customerEmail: email,
      customerIp: clientIp,
    });

    // Log payment attempt
    await pool.query(
      `INSERT INTO payment_logs (order_id, truth_id, status, amount, currency, boost_duration, customer_ip, created_at)
       VALUES ($1, $2, 'INITIATED', $3, 'TRY', $4, $5, NOW())`,
      [orderId, truthId, price, boostDuration, clientIp]
    );

    return NextResponse.json({
      success: true,
      formAction: formData.action,
      formFields: formData.fields,
      orderId,
    });
  } catch (error) {
    console.error('[Halkbank] Payment initiation error:', error);
    return NextResponse.json(
      { error: 'Odeme baslatılamadi' },
      { status: 500 }
    );
  }
}
