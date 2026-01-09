'use client';

import { useState, useEffect } from 'react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  earned: boolean;
  earned_at: string | null;
}

interface BadgesDisplayProps {
  className?: string;
  compact?: boolean;
}

export default function BadgesDisplay({ className = '', compact = false }: BadgesDisplayProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [earnedCount, setEarnedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const res = await fetch('/api/badges');
      const data = await res.json();
      setBadges(data.badges || []);
      setEarnedCount(data.earned_count || 0);
      setTotalCount(data.total_count || 0);
    } catch (error) {
      console.error('Failed to fetch badges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex gap-2 ${className}`}>
        {[1, 2, 3].map(i => (
          <div key={i} className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  const earnedBadges = badges.filter(b => b.earned);
  const displayBadges = showAll ? badges : earnedBadges;

  if (compact) {
    // Compact mode - just show earned badge icons
    if (earnedBadges.length === 0) return null;

    return (
      <div className={`flex gap-1 ${className}`}>
        {earnedBadges.slice(0, 5).map(badge => (
          <span
            key={badge.id}
            title={`${badge.name}: ${badge.description}`}
            className="text-lg"
          >
            {badge.icon}
          </span>
        ))}
        {earnedBadges.length > 5 && (
          <span className="text-xs text-gray-500">+{earnedBadges.length - 5}</span>
        )}
      </div>
    );
  }

  return (
    <div className={`glass-card rounded-2xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Rozetlerim</h3>
        <span className="text-sm text-gray-500">
          {earnedCount}/{totalCount}
        </span>
      </div>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setShowAll(false)}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            !showAll ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Kazanilanlar ({earnedCount})
        </button>
        <button
          onClick={() => setShowAll(true)}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            showAll ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Tumu ({totalCount})
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {displayBadges.map(badge => (
          <div
            key={badge.id}
            className={`text-center p-3 rounded-xl transition-all ${
              badge.earned
                ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30'
                : 'bg-white/5 opacity-40 grayscale'
            }`}
          >
            <div className={`text-3xl mb-1 ${badge.earned ? '' : 'grayscale'}`}>
              {badge.icon}
            </div>
            <div className={`text-xs ${badge.earned ? 'text-white' : 'text-gray-500'}`}>
              {badge.name}
            </div>
            {badge.earned && badge.earned_at && (
              <div className="text-[10px] text-gray-500 mt-1">
                {new Date(badge.earned_at).toLocaleDateString('tr-TR')}
              </div>
            )}
          </div>
        ))}
      </div>

      {displayBadges.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl mb-2 block">🎯</span>
          <p className="text-sm">Henuz rozet kazanmadin</p>
          <p className="text-xs mt-1">Itiraf paylas ve etkilesime gec!</p>
        </div>
      )}
    </div>
  );
}
