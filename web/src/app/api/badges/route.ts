import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getAllBadges, getUserBadges } from '@/lib/badges';

function hashIP(ip: string): string {
  return createHash('sha256').update(ip + (process.env.IP_SALT || 'default-salt')).digest('hex').slice(0, 16);
}

/**
 * GET /api/badges
 * Get all badges or user's badges
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true';

    if (showAll) {
      // Return all available badges
      const badges = await getAllBadges();
      return NextResponse.json({ badges });
    }

    // Get user's badges
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') || 'unknown';
    const userHash = hashIP(ip);

    const userBadges = await getUserBadges(userHash);
    const allBadges = await getAllBadges();

    // Mark which badges user has
    const badgesWithStatus = allBadges.map(badge => ({
      ...badge,
      earned: userBadges.some(ub => ub.badge_id === badge.id),
      earned_at: userBadges.find(ub => ub.badge_id === badge.id)?.awarded_at || null,
    }));

    return NextResponse.json({
      badges: badgesWithStatus,
      earned_count: userBadges.length,
      total_count: allBadges.length,
    });
  } catch (error) {
    console.error('Get badges error:', error);
    return NextResponse.json({ error: 'Failed to get badges' }, { status: 500 });
  }
}
