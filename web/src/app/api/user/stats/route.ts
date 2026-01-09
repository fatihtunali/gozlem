import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { updateStreak, getUserPoints, getUserStreak } from '@/lib/gamification';
import { getUserBadges } from '@/lib/badges';

function hashIP(ip: string): string {
  return createHash('sha256').update(ip + (process.env.IP_SALT || 'default-salt')).digest('hex').slice(0, 16);
}

/**
 * GET /api/user/stats
 * Get user statistics including streak, points, and badges
 */
export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') || 'unknown';
    const userHash = hashIP(ip);

    const { searchParams } = new URL(request.url);
    const updateVisit = searchParams.get('visit') === 'true';

    // Update streak if this is a visit
    let streakUpdate = null;
    if (updateVisit) {
      streakUpdate = await updateStreak(userHash);
    }

    // Get all user stats
    const [streak, points, badges] = await Promise.all([
      streakUpdate?.streak || getUserStreak(userHash),
      getUserPoints(userHash),
      getUserBadges(userHash),
    ]);

    return NextResponse.json({
      streak,
      points,
      badges: badges.slice(0, 5).map(b => ({
        id: b.badge_id,
        icon: b.badge.icon,
        name: b.badge.name,
      })),
      badgeCount: badges.length,
      pointsEarned: streakUpdate?.pointsEarned || 0,
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
  }
}
