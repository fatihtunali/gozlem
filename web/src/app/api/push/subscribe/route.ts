import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getVapidPublicKey } from '@/lib/push';

/**
 * POST /api/push/subscribe
 * Subscribe a device to push notifications
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription, truthId, userHash } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    if (!p256dh || !auth) {
      return NextResponse.json(
        { error: 'Missing subscription keys' },
        { status: 400 }
      );
    }

    // Check if subscription already exists
    const existing = await pool.query(
      'SELECT id FROM push_subscriptions WHERE endpoint = $1',
      [endpoint]
    );

    let subscriptionId: string;

    if (existing.rows.length > 0) {
      // Update existing subscription
      subscriptionId = existing.rows[0].id;
      await pool.query(
        `UPDATE push_subscriptions
         SET p256dh = $1, auth = $2, truth_id = $3, user_hash = $4, last_used_at = NOW()
         WHERE id = $5`,
        [p256dh, auth, truthId || null, userHash || null, subscriptionId]
      );
    } else {
      // Create new subscription
      const result = await pool.query(
        `INSERT INTO push_subscriptions (endpoint, p256dh, auth, truth_id, user_hash)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [endpoint, p256dh, auth, truthId || null, userHash || null]
      );
      subscriptionId = result.rows[0].id;
    }

    return NextResponse.json({
      success: true,
      subscriptionId,
      message: 'Push subscription saved',
    });
  } catch (error) {
    console.error('Push subscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/push/subscribe
 * Unsubscribe a device from push notifications
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint required' },
        { status: 400 }
      );
    }

    await pool.query(
      'DELETE FROM push_subscriptions WHERE endpoint = $1',
      [endpoint]
    );

    return NextResponse.json({
      success: true,
      message: 'Subscription removed',
    });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/push/subscribe
 * Get VAPID public key for client
 */
export async function GET() {
  const vapidPublicKey = getVapidPublicKey();

  if (!vapidPublicKey) {
    return NextResponse.json(
      { error: 'Push notifications not configured' },
      { status: 503 }
    );
  }

  return NextResponse.json({
    vapidPublicKey,
  });
}
