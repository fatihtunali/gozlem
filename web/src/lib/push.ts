import webpush from 'web-push';
import pool from './db';

// Configure web-push with VAPID keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:bildirim@haydihepberaber.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  actions?: Array<{ action: string; title: string }>;
}

export async function sendPushNotification(
  subscriptionId: string,
  payload: PushPayload
): Promise<boolean> {
  try {
    // Get subscription from database
    const result = await pool.query(
      'SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE id = $1',
      [subscriptionId]
    );

    if (result.rows.length === 0) {
      return false;
    }

    const sub = result.rows[0];
    const subscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    };

    await webpush.sendNotification(subscription, JSON.stringify(payload));

    // Log success
    await pool.query(
      `INSERT INTO push_logs (subscription_id, title, body, success)
       VALUES ($1, $2, $3, true)`,
      [subscriptionId, payload.title, payload.body]
    );

    // Update last used
    await pool.query(
      'UPDATE push_subscriptions SET last_used_at = NOW() WHERE id = $1',
      [subscriptionId]
    );

    return true;
  } catch (error) {
    console.error('Push notification error:', error);

    // Log failure
    await pool.query(
      `INSERT INTO push_logs (subscription_id, title, body, success, error_message)
       VALUES ($1, $2, $3, false, $4)`,
      [subscriptionId, payload.title, payload.body, String(error)]
    );

    // If subscription is invalid, remove it
    if ((error as any)?.statusCode === 410) {
      await pool.query('DELETE FROM push_subscriptions WHERE id = $1', [subscriptionId]);
    }

    return false;
  }
}

export async function sendPushToTruthOwner(
  truthId: string,
  payload: PushPayload
): Promise<number> {
  try {
    // Find all subscriptions for this truth
    const result = await pool.query(
      'SELECT id FROM push_subscriptions WHERE truth_id = $1',
      [truthId]
    );

    let successCount = 0;
    for (const row of result.rows) {
      const success = await sendPushNotification(row.id, payload);
      if (success) successCount++;
    }

    return successCount;
  } catch (error) {
    console.error('Send push to truth owner error:', error);
    return 0;
  }
}

export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}
