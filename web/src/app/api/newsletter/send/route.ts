import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendWeeklyDigest } from '@/lib/email';

// POST - Send weekly digest (called by cron)
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get top truths from the last week
    const truthsResult = await pool.query(
      `SELECT content, category, me_too_count, COALESCE(hug_count, 0) as hug_count
       FROM truths
       WHERE is_visible = TRUE
         AND created_at > NOW() - INTERVAL '7 days'
       ORDER BY (me_too_count + COALESCE(hug_count, 0)) DESC
       LIMIT 5`
    );

    const truths = truthsResult.rows;

    if (truths.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No truths to send this week',
        sent: 0
      });
    }

    // Get active subscribers
    const subscribersResult = await pool.query(
      `SELECT email, unsubscribe_token FROM newsletter_subscribers WHERE is_active = TRUE`
    );

    const subscribers = subscribersResult.rows;

    if (subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No subscribers',
        sent: 0
      });
    }

    // Send emails
    let successCount = 0;
    let failureCount = 0;

    for (const subscriber of subscribers) {
      const sent = await sendWeeklyDigest(subscriber.email, truths);
      if (sent) {
        successCount++;
      } else {
        failureCount++;
      }
    }

    // Log the send
    await pool.query(
      `INSERT INTO newsletter_logs (subscriber_count, success_count, failure_count)
       VALUES ($1, $2, $3)`,
      [subscribers.length, successCount, failureCount]
    );

    return NextResponse.json({
      success: true,
      message: `Weekly digest sent`,
      subscribers: subscribers.length,
      successCount,
      failureCount
    });
  } catch (error) {
    console.error('Weekly digest send failed:', error);
    return NextResponse.json({ error: 'Bir hata olustu' }, { status: 500 });
  }
}
