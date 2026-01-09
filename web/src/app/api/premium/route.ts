import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Premium plans configuration
const PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Aylik Premium',
    price: 4999, // 49.99 TL in kurus
    duration_days: 30,
    features: [
      'Reklamlari kaldır',
      'Itiraflarini one cikar (2x/ay)',
      'Uzun itiraf yazabilme (1000 karakter)',
      'Premium rozeti',
      'Detayli istatistikler',
    ]
  },
  yearly: {
    id: 'yearly',
    name: 'Yillik Premium',
    price: 39999, // 399.99 TL in kurus
    duration_days: 365,
    features: [
      'Tum aylik ozellikler',
      'Itiraflarini one cikar (5x/ay)',
      '2 ay bedava (10 ay fiyatina)',
      'Ozel premium renkleri',
      'Oncelikli destek',
    ]
  }
};

// GET - Check premium status
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userIdentifier = searchParams.get('user');

  // If no user, return plans info
  if (!userIdentifier) {
    return NextResponse.json({ plans: PLANS });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM premium_memberships
       WHERE user_identifier = $1
       AND status = 'active'
       AND expires_at > NOW()
       ORDER BY expires_at DESC
       LIMIT 1`,
      [userIdentifier]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        isPremium: false,
        plans: PLANS
      });
    }

    const membership = result.rows[0];
    return NextResponse.json({
      isPremium: true,
      membership: {
        id: membership.id,
        planType: membership.plan_type,
        expiresAt: membership.expires_at,
        startedAt: membership.started_at,
      },
      benefits: PLANS[membership.plan_type as keyof typeof PLANS]?.features || []
    });
  } catch (error) {
    console.error('Failed to check premium status:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// POST - Subscribe to premium (initiate payment)
export async function POST(request: Request) {
  try {
    const { userIdentifier, planId, email } = await request.json();

    if (!userIdentifier || !planId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Create a pending membership and redirect to Halkbank payment
    const orderId = `PRE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store pending subscription info
    const result = await pool.query(
      `INSERT INTO premium_memberships (
        user_identifier, plan_type, status, amount_paid, payment_reference,
        expires_at
      ) VALUES ($1, $2, 'pending', $3, $4, NOW() + INTERVAL '${plan.duration_days} days')
      RETURNING id`,
      [userIdentifier, planId, plan.price, orderId]
    );

    const membershipId = result.rows[0].id;

    // Return payment initiation URL (uses existing Halkbank integration)
    return NextResponse.json({
      success: true,
      membershipId,
      orderId,
      redirectUrl: `/premium/odeme?plan=${planId}&order=${orderId}&email=${encodeURIComponent(email || '')}`,
      plan: {
        name: plan.name,
        price: plan.price,
        duration: plan.duration_days
      }
    });
  } catch (error) {
    console.error('Failed to initiate premium subscription:', error);
    return NextResponse.json({ error: 'Failed to initiate subscription' }, { status: 500 });
  }
}
