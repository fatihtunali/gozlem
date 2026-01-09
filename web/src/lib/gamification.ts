import pool from './db';

// Points configuration
const POINTS = {
  CONFESSION: 10,
  HUG_GIVEN: 1,
  HUG_RECEIVED: 2,
  METOO_GIVEN: 1,
  METOO_RECEIVED: 3,
  COMMENT: 2,
  COMMENT_RECEIVED: 5,
  DAILY_VISIT: 5,
  STREAK_BONUS_7: 50,
  STREAK_BONUS_30: 200,
};

interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalVisits: number;
  lastVisitDate: string | null;
}

interface PointsInfo {
  totalPoints: number;
  confessionPoints: number;
  interactionPoints: number;
  streakPoints: number;
  rank?: number;
}

// Update user streak on visit
export async function updateStreak(userHash: string): Promise<{ streak: StreakInfo; pointsEarned: number }> {
  const today = new Date().toISOString().split('T')[0];
  let pointsEarned = 0;

  try {
    // Get current streak info
    const result = await pool.query(
      'SELECT current_streak, longest_streak, last_visit_date, total_visits FROM user_streaks WHERE user_hash = $1',
      [userHash]
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let totalVisits = 0;
    let lastVisitDate: string | null = null;

    if (result.rows.length > 0) {
      const row = result.rows[0];
      currentStreak = row.current_streak;
      longestStreak = row.longest_streak;
      totalVisits = row.total_visits;
      lastVisitDate = row.last_visit_date?.toISOString().split('T')[0] || null;

      // Already visited today
      if (lastVisitDate === today) {
        return {
          streak: { currentStreak, longestStreak, totalVisits, lastVisitDate },
          pointsEarned: 0,
        };
      }

      // Check if streak continues (yesterday)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastVisitDate === yesterdayStr) {
        currentStreak += 1;
      } else {
        // Streak broken, start new
        currentStreak = 1;
      }

      // Update longest streak if needed
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }

      totalVisits += 1;

      // Update existing record
      await pool.query(
        `UPDATE user_streaks
         SET current_streak = $1, longest_streak = $2, last_visit_date = $3,
             total_visits = $4, updated_at = NOW()
         WHERE user_hash = $5`,
        [currentStreak, longestStreak, today, totalVisits, userHash]
      );
    } else {
      // First visit
      currentStreak = 1;
      longestStreak = 1;
      totalVisits = 1;

      await pool.query(
        `INSERT INTO user_streaks (user_hash, current_streak, longest_streak, last_visit_date, total_visits)
         VALUES ($1, $2, $3, $4, $5)`,
        [userHash, currentStreak, longestStreak, today, totalVisits]
      );
    }

    // Award daily visit points
    pointsEarned = POINTS.DAILY_VISIT;

    // Streak bonuses
    if (currentStreak === 7) {
      pointsEarned += POINTS.STREAK_BONUS_7;
    } else if (currentStreak === 30) {
      pointsEarned += POINTS.STREAK_BONUS_30;
    }

    if (pointsEarned > 0) {
      await addPoints(userHash, pointsEarned, 'streak', 'Gunluk giris');
    }

    return {
      streak: { currentStreak, longestStreak, totalVisits, lastVisitDate: today },
      pointsEarned,
    };
  } catch (error) {
    console.error('Update streak error:', error);
    return {
      streak: { currentStreak: 0, longestStreak: 0, totalVisits: 0, lastVisitDate: null },
      pointsEarned: 0,
    };
  }
}

// Add points to user
export async function addPoints(
  userHash: string,
  points: number,
  category: 'confession' | 'interaction' | 'streak',
  reason: string,
  truthId?: string
): Promise<void> {
  try {
    // Update or create user points
    const columnMap = {
      confession: 'confession_points',
      interaction: 'interaction_points',
      streak: 'streak_points',
    };
    const column = columnMap[category];

    await pool.query(
      `INSERT INTO user_points (user_hash, total_points, ${column})
       VALUES ($1, $2, $2)
       ON CONFLICT (user_hash) DO UPDATE SET
         total_points = user_points.total_points + $2,
         ${column} = user_points.${column} + $2,
         updated_at = NOW()`,
      [userHash, points]
    );

    // Log points history
    await pool.query(
      `INSERT INTO points_history (user_hash, points, reason, truth_id)
       VALUES ($1, $2, $3, $4)`,
      [userHash, points, reason, truthId || null]
    );
  } catch (error) {
    console.error('Add points error:', error);
  }
}

// Get user points and rank
export async function getUserPoints(userHash: string): Promise<PointsInfo> {
  try {
    const result = await pool.query(
      `SELECT total_points, confession_points, interaction_points, streak_points,
              (SELECT COUNT(*) + 1 FROM user_points WHERE total_points > up.total_points) as rank
       FROM user_points up
       WHERE user_hash = $1`,
      [userHash]
    );

    if (result.rows.length === 0) {
      return {
        totalPoints: 0,
        confessionPoints: 0,
        interactionPoints: 0,
        streakPoints: 0,
        rank: undefined,
      };
    }

    const row = result.rows[0];
    return {
      totalPoints: row.total_points,
      confessionPoints: row.confession_points,
      interactionPoints: row.interaction_points,
      streakPoints: row.streak_points,
      rank: parseInt(row.rank),
    };
  } catch (error) {
    console.error('Get user points error:', error);
    return {
      totalPoints: 0,
      confessionPoints: 0,
      interactionPoints: 0,
      streakPoints: 0,
    };
  }
}

// Get user streak info
export async function getUserStreak(userHash: string): Promise<StreakInfo> {
  try {
    const result = await pool.query(
      'SELECT current_streak, longest_streak, last_visit_date, total_visits FROM user_streaks WHERE user_hash = $1',
      [userHash]
    );

    if (result.rows.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalVisits: 0,
        lastVisitDate: null,
      };
    }

    const row = result.rows[0];
    return {
      currentStreak: row.current_streak,
      longestStreak: row.longest_streak,
      totalVisits: row.total_visits,
      lastVisitDate: row.last_visit_date?.toISOString().split('T')[0] || null,
    };
  } catch (error) {
    console.error('Get user streak error:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalVisits: 0,
      lastVisitDate: null,
    };
  }
}

// Get leaderboard
export async function getLeaderboard(limit: number = 10): Promise<Array<{ rank: number; points: number }>> {
  try {
    const result = await pool.query(
      `SELECT total_points as points,
              ROW_NUMBER() OVER (ORDER BY total_points DESC) as rank
       FROM user_points
       ORDER BY total_points DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows.map(row => ({
      rank: parseInt(row.rank),
      points: row.points,
    }));
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return [];
  }
}

// Award points for confession
export async function awardConfessionPoints(userHash: string, truthId: string): Promise<number> {
  await addPoints(userHash, POINTS.CONFESSION, 'confession', 'Itiraf paylasimi', truthId);
  return POINTS.CONFESSION;
}

// Award points for interaction
export async function awardInteractionPoints(
  userHash: string,
  type: 'hug' | 'metoo' | 'comment',
  truthId: string
): Promise<number> {
  const pointsMap = {
    hug: POINTS.HUG_GIVEN,
    metoo: POINTS.METOO_GIVEN,
    comment: POINTS.COMMENT,
  };
  const points = pointsMap[type];
  await addPoints(userHash, points, 'interaction', `Etkilesim: ${type}`, truthId);
  return points;
}

// Log event for tracking
export async function logEvent(
  userHash: string,
  eventType: string,
  truthId?: string
): Promise<void> {
  try {
    await pool.query(
      'INSERT INTO events (ip_hash, event_type, truth_id) VALUES ($1, $2, $3)',
      [userHash, eventType, truthId || null]
    );
  } catch (error) {
    console.error('Log event error:', error);
  }
}
