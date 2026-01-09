import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// POST - Handle payment callback (activate premium)
export async function POST(request: Request) {
  try {
    const { orderId, status, transactionId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    if (status !== 'success') {
      // Mark as failed
      await pool.query(
        `UPDATE premium_memberships SET status = 'failed' WHERE payment_reference = $1`,
        [orderId]
      );
      return NextResponse.json({ success: false, message: 'Payment failed' });
    }

    // Activate the membership
    const result = await pool.query(
      `UPDATE premium_memberships
       SET status = 'active',
           started_at = NOW(),
           updated_at = NOW()
       WHERE payment_reference = $1 AND status = 'pending'
       RETURNING *`,
      [orderId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Membership not found or already processed' }, { status: 404 });
    }

    const membership = result.rows[0];

    return NextResponse.json({
      success: true,
      membership: {
        id: membership.id,
        planType: membership.plan_type,
        expiresAt: membership.expires_at,
        userIdentifier: membership.user_identifier
      }
    });
  } catch (error) {
    console.error('Failed to process premium callback:', error);
    return NextResponse.json({ error: 'Failed to process callback' }, { status: 500 });
  }
}
