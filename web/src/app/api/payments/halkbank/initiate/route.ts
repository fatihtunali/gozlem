import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { create3DSecureForm, isHalkbankConfigured } from '@/lib/halkbank';

// Boost prices in TRY
const BOOST_PRICES: Record<string, number> = {
  '1_hour': 9.99,
  '3_hours': 19.99,
  '24_hours': 49.99,
};

// Payment types
type PaymentType = 'boost' | 'gift';

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
      paymentType = 'boost' as PaymentType,
      boostDuration,
      giftTypeId,
      giftMessage,
      cardNumber,
      cardExpMonth,
      cardExpYear,
      cardCvv,
      cardHolderName,
      email,
    } = body;

    // Validate required fields
    if (!truthId || !cardNumber || !cardExpMonth || !cardExpYear || !cardCvv || !cardHolderName || !email) {
      return NextResponse.json(
        { error: 'Eksik bilgi' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Gecersiz e-posta adresi' },
        { status: 400 }
      );
    }

    let price: number;
    let orderId: string;
    let orderDescription: string;

    if (paymentType === 'gift') {
      // Get gift price from database
      if (!giftTypeId) {
        return NextResponse.json({ error: 'Hediye tipi secilmedi' }, { status: 400 });
      }

      const giftResult = await pool.query(
        'SELECT id, name, price FROM gift_types WHERE id = $1',
        [giftTypeId]
      );

      if (giftResult.rows.length === 0) {
        return NextResponse.json({ error: 'Gecersiz hediye tipi' }, { status: 400 });
      }

      price = parseFloat(giftResult.rows[0].price);
      orderId = `GIFT-${truthId.slice(0, 8)}-${Date.now()}`;
      orderDescription = `Hediye: ${giftResult.rows[0].name}`;
    } else {
      // Boost payment
      if (!boostDuration) {
        return NextResponse.json({ error: 'Boost suresi secilmedi' }, { status: 400 });
      }

      price = BOOST_PRICES[boostDuration];
      if (!price) {
        return NextResponse.json({ error: 'Gecersiz boost suresi' }, { status: 400 });
      }

      orderId = `BOOST-${truthId.slice(0, 8)}-${Date.now()}`;
      orderDescription = `Boost: ${boostDuration}`;
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

    // Log payment attempt with metadata
    const metadata = paymentType === 'gift'
      ? { paymentType: 'gift', giftTypeId, giftMessage }
      : { paymentType: 'boost', boostDuration };

    await pool.query(
      `INSERT INTO payment_logs (order_id, truth_id, status, amount, currency, boost_duration, customer_ip, customer_email, raw_response, created_at)
       VALUES ($1, $2, 'INITIATED', $3, 'TRY', $4, $5, $6, $7, NOW())`,
      [orderId, truthId, price, paymentType === 'boost' ? boostDuration : null, clientIp, email, JSON.stringify(metadata)]
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
