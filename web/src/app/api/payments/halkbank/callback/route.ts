import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import {
  verifyCallbackHash,
  parseCallbackResponse,
  is3DAuthSuccessful,
  complete3DPayment,
  getHalkbankStoreType,
} from '@/lib/halkbank';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://haydihepberaber.com';

// Boost duration to hours mapping
const BOOST_HOURS: Record<string, number> = {
  '1_hour': 1,
  '3_hours': 3,
  '24_hours': 24,
};

/**
 * POST /api/payments/halkbank/callback
 * Handle 3D Secure callback from Halkbank
 */
export async function POST(request: NextRequest) {
  let orderId = '';

  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};

    formData.forEach((value, key) => {
      params[key] = String(value);
    });

    console.log('[Halkbank Callback] Received:', JSON.stringify(params, null, 2));
    const storeType = getHalkbankStoreType();

    orderId = params.oid || '';

    if (!orderId) {
      console.error('[Halkbank Callback] No order ID');
      return NextResponse.redirect(new URL('/?payment=error', APP_URL));
    }

    // Determine payment type from order ID
    const isGiftPayment = orderId.startsWith('GIFT-');

    // Find payment log
    const paymentResult = await pool.query(
      'SELECT id, truth_id, amount, boost_duration, raw_response FROM payment_logs WHERE order_id = $1 AND status = $2',
      [orderId, 'INITIATED']
    );

    if (paymentResult.rows.length === 0) {
      console.error('[Halkbank Callback] Payment log not found:', orderId);
      return NextResponse.redirect(new URL('/?payment=error', APP_URL));
    }

    const paymentLog = paymentResult.rows[0];
    const metadata = typeof paymentLog.raw_response === 'string'
      ? JSON.parse(paymentLog.raw_response)
      : paymentLog.raw_response || {};

    // Verify hash
    const isHashValid = verifyCallbackHash(params);
    if (!isHashValid) {
      console.error('[Halkbank Callback] Hash verification failed');
      await pool.query(
        'UPDATE payment_logs SET status = $1, error_message = $2 WHERE order_id = $3',
        ['FAILED', 'Hash verification failed', orderId]
      );
      return NextResponse.redirect(new URL('/?payment=failed&error=invalid_signature', APP_URL));
    }

    // Verify amount
    const callbackAmount = parseFloat(params.amount || '0');
    const expectedAmount = parseFloat(paymentLog.amount);
    const amountDifference = Math.abs(callbackAmount - expectedAmount);

    if (amountDifference > 0.01) {
      console.error('[Halkbank Callback] Amount mismatch:', { expected: expectedAmount, received: callbackAmount });
      await pool.query(
        'UPDATE payment_logs SET status = $1, error_message = $2 WHERE order_id = $3',
        ['FAILED', 'Amount mismatch', orderId]
      );
      return NextResponse.redirect(new URL('/?payment=failed&error=amount_mismatch', APP_URL));
    }

    // Check 3D authentication
    const is3DSuccess = is3DAuthSuccessful(params);
    console.log('[Halkbank Callback] 3D auth result:', is3DSuccess ? 'SUCCESS' : 'FAILED');

    let result;
    const requiresApiCompletion = storeType === '3d';

    if (is3DSuccess && requiresApiCompletion) {
      result = await complete3DPayment(params);
    } else if (!requiresApiCompletion) {
      result = parseCallbackResponse(params);
    } else {
      result = parseCallbackResponse(params);
    }

    // Update payment log
    await pool.query(
      `UPDATE payment_logs SET
        status = $1,
        transaction_id = $2,
        md_status = $3,
        proc_return_code = $4,
        error_message = $5,
        raw_response = $6
       WHERE order_id = $7`,
      [
        result.success ? 'SUCCESS' : 'FAILED',
        result.transactionId || null,
        params.mdStatus || params.mdstatus || null,
        params.ProcReturnCode || params.procreturncode || null,
        result.errorMessage || null,
        JSON.stringify(params),
        orderId,
      ]
    );

    if (result.success) {
      if (isGiftPayment) {
        // Handle gift payment
        const giftTypeId = metadata.giftTypeId;
        const giftMessage = metadata.giftMessage || null;

        // Get gift price
        const giftResult = await pool.query(
          'SELECT price FROM gift_types WHERE id = $1',
          [giftTypeId]
        );
        const giftPrice = giftResult.rows[0]?.price || 0;

        // Insert gift record
        await pool.query(
          `INSERT INTO gifts (truth_id, gift_type_id, message, payment_id, created_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [paymentLog.truth_id, giftTypeId, giftMessage, paymentLog.id]
        );

        // Update truth gift count and value
        await pool.query(
          `UPDATE truths SET gift_count = gift_count + 1, gift_value = gift_value + $1 WHERE id = $2`,
          [giftPrice, paymentLog.truth_id]
        );

        console.log(`[Halkbank Callback] Gift payment successful for order ${orderId}`);
        return NextResponse.redirect(new URL('/?payment=success&type=gift', APP_URL));
      } else {
        // Handle boost payment
        const boostHours = BOOST_HOURS[paymentLog.boost_duration] || 1;
        const boostEndTime = new Date();
        boostEndTime.setHours(boostEndTime.getHours() + boostHours);

        // Activate boost for the confession
        await pool.query(
          `INSERT INTO boosts (truth_id, order_id, boost_type, ends_at, created_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [paymentLog.truth_id, orderId, paymentLog.boost_duration, boostEndTime]
        );

        // Update truth to mark as boosted
        await pool.query(
          'UPDATE truths SET is_boosted = true, boost_ends_at = $1 WHERE id = $2',
          [boostEndTime, paymentLog.truth_id]
        );

        console.log(`[Halkbank Callback] Boost payment successful for order ${orderId}, boost activated until ${boostEndTime}`);
        return NextResponse.redirect(new URL('/?payment=success', APP_URL));
      }
    } else {
      console.log(`[Halkbank Callback] Payment failed for order ${orderId}: ${result.errorMessage}`);
      const errorMsg = encodeURIComponent(result.errorMessage || 'Odeme basarisiz');
      return NextResponse.redirect(new URL(`/?payment=failed&error=${errorMsg}`, APP_URL));
    }
  } catch (error) {
    console.error('[Halkbank Callback] Error:', error);
    if (orderId) {
      await pool.query(
        'UPDATE payment_logs SET status = $1, error_message = $2 WHERE order_id = $3',
        ['FAILED', 'Processing error', orderId]
      );
    }
    return NextResponse.redirect(new URL('/?payment=error', APP_URL));
  }
}

/**
 * GET /api/payments/halkbank/callback
 * Handle GET redirect (some banks use GET)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  console.log('[Halkbank Callback GET] Received:', JSON.stringify(params, null, 2));

  const orderId = params.oid || '';

  if (!orderId) {
    return NextResponse.redirect(new URL('/?payment=error', APP_URL));
  }

  // Determine payment type from order ID
  const isGiftPayment = orderId.startsWith('GIFT-');

  // Find payment log
  const paymentResult = await pool.query(
    'SELECT id, truth_id, amount, boost_duration, raw_response FROM payment_logs WHERE order_id = $1',
    [orderId]
  );

  if (paymentResult.rows.length === 0) {
    return NextResponse.redirect(new URL('/?payment=error', APP_URL));
  }

  const paymentLog = paymentResult.rows[0];
  const metadata = typeof paymentLog.raw_response === 'string'
    ? JSON.parse(paymentLog.raw_response)
    : paymentLog.raw_response || {};

  // Verify hash
  const isHashValid = verifyCallbackHash(params);
  if (!isHashValid) {
    await pool.query(
      'UPDATE payment_logs SET status = $1, error_message = $2 WHERE order_id = $3',
      ['FAILED', 'Hash verification failed', orderId]
    );
    return NextResponse.redirect(new URL('/?payment=failed&error=invalid_signature', APP_URL));
  }

  // Parse response
  const result = parseCallbackResponse(params);

  // Update payment log
  await pool.query(
    `UPDATE payment_logs SET
      status = $1,
      transaction_id = $2,
      raw_response = $3
     WHERE order_id = $4`,
    [
      result.success ? 'SUCCESS' : 'FAILED',
      result.transactionId || null,
      JSON.stringify(params),
      orderId,
    ]
  );

  if (result.success) {
    if (isGiftPayment) {
      // Handle gift payment
      const giftTypeId = metadata.giftTypeId;
      const giftMessage = metadata.giftMessage || null;

      const giftResult = await pool.query(
        'SELECT price FROM gift_types WHERE id = $1',
        [giftTypeId]
      );
      const giftPrice = giftResult.rows[0]?.price || 0;

      await pool.query(
        `INSERT INTO gifts (truth_id, gift_type_id, message, payment_id, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [paymentLog.truth_id, giftTypeId, giftMessage, paymentLog.id]
      );

      await pool.query(
        `UPDATE truths SET gift_count = gift_count + 1, gift_value = gift_value + $1 WHERE id = $2`,
        [giftPrice, paymentLog.truth_id]
      );

      return NextResponse.redirect(new URL('/?payment=success&type=gift', APP_URL));
    } else {
      const boostHours = BOOST_HOURS[paymentLog.boost_duration] || 1;
      const boostEndTime = new Date();
      boostEndTime.setHours(boostEndTime.getHours() + boostHours);

      await pool.query(
        `INSERT INTO boosts (truth_id, order_id, boost_type, ends_at, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [paymentLog.truth_id, orderId, paymentLog.boost_duration, boostEndTime]
      );

      await pool.query(
        'UPDATE truths SET is_boosted = true, boost_ends_at = $1 WHERE id = $2',
        [boostEndTime, paymentLog.truth_id]
      );

      return NextResponse.redirect(new URL('/?payment=success', APP_URL));
    }
  } else {
    const errorMsg = encodeURIComponent(result.errorMessage || 'Odeme basarisiz');
    return NextResponse.redirect(new URL(`/?payment=failed&error=${errorMsg}`, APP_URL));
  }
}
