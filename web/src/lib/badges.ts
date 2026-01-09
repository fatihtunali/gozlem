import pool from './db';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
}

interface UserBadge {
  badge_id: string;
  awarded_at: string;
  badge: Badge;
}

// Get all available badges
export async function getAllBadges(): Promise<Badge[]> {
  const result = await pool.query(
    'SELECT * FROM badges WHERE is_active = true ORDER BY category, requirement_value'
  );
  return result.rows;
}

// Get badges for a user
export async function getUserBadges(userHash: string): Promise<UserBadge[]> {
  const result = await pool.query(
    `SELECT ub.badge_id, ub.awarded_at,
            b.id, b.name, b.description, b.icon, b.category, b.requirement_type, b.requirement_value
     FROM user_badges ub
     JOIN badges b ON ub.badge_id = b.id
     WHERE ub.user_hash = $1
     ORDER BY ub.awarded_at DESC`,
    [userHash]
  );

  return result.rows.map(row => ({
    badge_id: row.badge_id,
    awarded_at: row.awarded_at,
    badge: {
      id: row.id,
      name: row.name,
      description: row.description,
      icon: row.icon,
      category: row.category,
      requirement_type: row.requirement_type,
      requirement_value: row.requirement_value,
    }
  }));
}

// Award a badge to a user
export async function awardBadge(userHash: string, badgeId: string, truthId?: string): Promise<boolean> {
  try {
    await pool.query(
      `INSERT INTO user_badges (user_hash, badge_id, truth_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_hash, badge_id) DO NOTHING`,
      [userHash, badgeId, truthId || null]
    );
    return true;
  } catch (error) {
    console.error('Award badge error:', error);
    return false;
  }
}

// Check and award badges based on user actions
export async function checkAndAwardBadges(
  userHash: string,
  actionType: 'confession' | 'hug_given' | 'metoo_given' | 'hug_received' | 'gift_given',
  truthId?: string
): Promise<string[]> {
  const awardedBadges: string[] = [];

  try {
    // Get user stats
    let confessionCount = 0;
    let hugGivenCount = 0;
    let metooGivenCount = 0;
    let hugReceivedCount = 0;
    let giftGivenCount = 0;

    // Count confessions
    const confessionResult = await pool.query(
      'SELECT COUNT(*) as count FROM truths WHERE ip_hash = $1',
      [userHash]
    );
    confessionCount = parseInt(confessionResult.rows[0].count);

    // Count hugs given (from hug_logs or events)
    const hugGivenResult = await pool.query(
      `SELECT COUNT(*) as count FROM events
       WHERE ip_hash = $1 AND event_type = 'hug'`,
      [userHash]
    );
    hugGivenCount = parseInt(hugGivenResult.rows[0]?.count || '0');

    // Count me-too given
    const metooGivenResult = await pool.query(
      `SELECT COUNT(*) as count FROM events
       WHERE ip_hash = $1 AND event_type = 'me_too'`,
      [userHash]
    );
    metooGivenCount = parseInt(metooGivenResult.rows[0]?.count || '0');

    // Count hugs received on user's confessions
    const hugReceivedResult = await pool.query(
      `SELECT COALESCE(SUM(hug_count), 0) as count FROM truths WHERE ip_hash = $1`,
      [userHash]
    );
    hugReceivedCount = parseInt(hugReceivedResult.rows[0].count);

    // Count gifts given
    const giftGivenResult = await pool.query(
      `SELECT COUNT(*) as count FROM payment_logs
       WHERE status = 'SUCCESS' AND order_id LIKE 'GIFT-%'`,
      [userHash]
    );
    giftGivenCount = parseInt(giftGivenResult.rows[0]?.count || '0');

    // Check confession badges
    if (confessionCount >= 1) {
      if (await awardBadge(userHash, 'first_confession', truthId)) {
        awardedBadges.push('first_confession');
      }
    }
    if (confessionCount >= 5) {
      if (await awardBadge(userHash, 'five_confessions', truthId)) {
        awardedBadges.push('five_confessions');
      }
    }
    if (confessionCount >= 10) {
      if (await awardBadge(userHash, 'ten_confessions', truthId)) {
        awardedBadges.push('ten_confessions');
      }
    }

    // Check hug given badges
    if (hugGivenCount >= 1) {
      if (await awardBadge(userHash, 'first_hug')) {
        awardedBadges.push('first_hug');
      }
    }
    if (hugGivenCount >= 100) {
      if (await awardBadge(userHash, 'hundred_hugs')) {
        awardedBadges.push('hundred_hugs');
      }
    }
    if (hugGivenCount >= 500) {
      if (await awardBadge(userHash, 'five_hundred_hugs')) {
        awardedBadges.push('five_hundred_hugs');
      }
    }

    // Check me-too badges
    if (metooGivenCount >= 1) {
      if (await awardBadge(userHash, 'first_me_too')) {
        awardedBadges.push('first_me_too');
      }
    }
    if (metooGivenCount >= 100) {
      if (await awardBadge(userHash, 'hundred_metoo')) {
        awardedBadges.push('hundred_metoo');
      }
    }

    // Check hug received badges
    if (hugReceivedCount >= 100) {
      if (await awardBadge(userHash, 'received_hundred_hugs')) {
        awardedBadges.push('received_hundred_hugs');
      }
    }

    // Check gift given badge
    if (giftGivenCount >= 1) {
      if (await awardBadge(userHash, 'gift_giver')) {
        awardedBadges.push('gift_giver');
      }
    }

    // Check time-based badges for confession
    if (actionType === 'confession' && truthId) {
      const hour = new Date().getHours();
      if (hour >= 0 && hour < 5) {
        if (await awardBadge(userHash, 'night_owl', truthId)) {
          awardedBadges.push('night_owl');
        }
      }
      if (hour >= 5 && hour < 7) {
        if (await awardBadge(userHash, 'early_bird', truthId)) {
          awardedBadges.push('early_bird');
        }
      }
    }

    return awardedBadges;
  } catch (error) {
    console.error('Check and award badges error:', error);
    return awardedBadges;
  }
}
