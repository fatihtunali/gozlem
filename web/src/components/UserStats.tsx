'use client';

import { useState, useEffect } from 'react';
import { Flame, Trophy, Star } from 'lucide-react';

interface UserStatsData {
  streak: {
    currentStreak: number;
    longestStreak: number;
    totalVisits: number;
  };
  points: {
    totalPoints: number;
    rank?: number;
  };
  badgeCount: number;
  pointsEarned?: number;
}

interface UserStatsProps {
  className?: string;
  compact?: boolean;
}

export default function UserStats({ className = '', compact = false }: UserStatsProps) {
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/user/stats?visit=true');
      const data = await res.json();
      setStats(data);

      // Show animation if points were earned
      if (data.pointsEarned > 0) {
        setShowPointsAnimation(true);
        setTimeout(() => setShowPointsAnimation(false), 3000);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex gap-3 ${className}`}>
        <div className="w-16 h-8 bg-white/5 rounded-lg animate-pulse" />
        <div className="w-16 h-8 bg-white/5 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!stats) return null;

  if (compact) {
    return (
      <div className={`flex items-center gap-3 text-sm ${className}`}>
        {stats.streak.currentStreak > 0 && (
          <div className="flex items-center gap-1 text-orange-400" title={`${stats.streak.currentStreak} gunluk seri`}>
            <Flame className="w-4 h-4" />
            <span>{stats.streak.currentStreak}</span>
          </div>
        )}
        {stats.points.totalPoints > 0 && (
          <div className="flex items-center gap-1 text-yellow-400" title={`${stats.points.totalPoints} puan`}>
            <Star className="w-4 h-4" />
            <span>{stats.points.totalPoints}</span>
          </div>
        )}
        {stats.points.rank && stats.points.rank <= 100 && (
          <div className="flex items-center gap-1 text-purple-400" title={`Siralama: #${stats.points.rank}`}>
            <Trophy className="w-4 h-4" />
            <span>#{stats.points.rank}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`glass-card rounded-2xl p-4 ${className}`}>
      {/* Points earned animation */}
      {showPointsAnimation && stats.pointsEarned && stats.pointsEarned > 0 && (
        <div className="absolute top-2 right-2 text-green-400 text-sm font-medium animate-bounce">
          +{stats.pointsEarned} puan!
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 text-center">
        {/* Streak */}
        <div>
          <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
            <Flame className="w-5 h-5" />
            <span className="text-2xl font-bold">{stats.streak.currentStreak}</span>
          </div>
          <div className="text-xs text-gray-500">Gunluk Seri</div>
          {stats.streak.longestStreak > stats.streak.currentStreak && (
            <div className="text-[10px] text-gray-600">En uzun: {stats.streak.longestStreak}</div>
          )}
        </div>

        {/* Points */}
        <div>
          <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
            <Star className="w-5 h-5" />
            <span className="text-2xl font-bold">{stats.points.totalPoints}</span>
          </div>
          <div className="text-xs text-gray-500">Puan</div>
          {stats.points.rank && (
            <div className="text-[10px] text-gray-600">Siralama: #{stats.points.rank}</div>
          )}
        </div>

        {/* Badges */}
        <div>
          <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
            <Trophy className="w-5 h-5" />
            <span className="text-2xl font-bold">{stats.badgeCount}</span>
          </div>
          <div className="text-xs text-gray-500">Rozet</div>
        </div>
      </div>
    </div>
  );
}
