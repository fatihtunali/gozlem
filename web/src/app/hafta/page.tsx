'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface WeeklyStats {
  totalTruths: number;
  totalMeToo: number;
  totalHugs: number;
  totalComments: number;
  topTruths: Array<{
    id: string;
    content: string;
    category: string;
    me_too_count: number;
    hug_count: number;
  }>;
  categoryStats: Array<{
    category: string;
    count: number;
  }>;
}

const CATEGORIES: Record<string, { label: string; icon: string; color: string }> = {
  itiraf: { label: 'İtiraf', icon: '🤫', color: 'from-purple-500 to-purple-600' },
  ask: { label: 'Aşk', icon: '💔', color: 'from-pink-500 to-rose-600' },
  korku: { label: 'Korku', icon: '😰', color: 'from-gray-600 to-gray-700' },
  pismanlik: { label: 'Pişmanlık', icon: '😔', color: 'from-blue-500 to-blue-600' },
  umut: { label: 'Umut', icon: '🌅', color: 'from-amber-500 to-orange-600' },
  sir: { label: 'Sır', icon: '🔒', color: 'from-emerald-500 to-emerald-600' },
};

export default function WeeklyPage() {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/weekly')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch weekly stats:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center">
        <p className="text-gray-500">Veriler yüklenemedi.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[100px] animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <Link href="/" className="text-gray-500 hover:text-white transition-colors mb-4 inline-block">
            ← Ana Sayfa
          </Link>
          <h1 className="text-3xl md:text-4xl font-extralight tracking-wide mb-3">
            📊 Haftalık Özet
          </h1>
          <p className="text-gray-500">Bu hafta neler oldu?</p>
        </header>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400">{stats.totalTruths}</div>
            <div className="text-sm text-gray-500 mt-1">Yeni İtiraf</div>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400">{stats.totalMeToo}</div>
            <div className="text-sm text-gray-500 mt-1">Ben De</div>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-pink-400">{stats.totalHugs}</div>
            <div className="text-sm text-gray-500 mt-1">Sarılma</div>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400">{stats.totalComments}</div>
            <div className="text-sm text-gray-500 mt-1">Yorum</div>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="mb-12">
          <h2 className="text-xl font-light mb-6 text-center">Kategori Dağılımı</h2>
          <div className="glass-card rounded-2xl p-6">
            <div className="space-y-4">
              {stats.categoryStats.map(cat => {
                const catInfo = CATEGORIES[cat.category] || { label: cat.category, icon: '📝', color: 'from-gray-500 to-gray-600' };
                const maxCount = Math.max(...stats.categoryStats.map(c => c.count));
                const percentage = maxCount > 0 ? (cat.count / maxCount) * 100 : 0;

                return (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-2">
                        <span>{catInfo.icon}</span>
                        <span className="text-sm">{catInfo.label}</span>
                      </span>
                      <span className="text-sm text-gray-400">{cat.count}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${catInfo.color} transition-all duration-1000`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top confessions */}
        <div className="mb-12">
          <h2 className="text-xl font-light mb-6 text-center">🏆 Haftanın En Çok Etkileşim Alanları</h2>
          <div className="space-y-4">
            {stats.topTruths.map((truth, index) => {
              const catInfo = CATEGORIES[truth.category] || { label: truth.category, icon: '📝', color: 'from-gray-500 to-gray-600' };

              return (
                <div key={truth.id} className="glass-card rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs bg-gradient-to-r ${catInfo.color}`}>
                          {catInfo.icon} {catInfo.label}
                        </span>
                      </div>
                      <p className="text-gray-100 leading-relaxed mb-3">
                        {truth.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>✋ {truth.me_too_count} ben de</span>
                        <span>🤗 {truth.hug_count} sarıldı</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
          >
            ✍️ Sen de içini dök
          </Link>
        </div>

        {/* Footer */}
        <footer className="text-center py-8 text-gray-600 text-sm mt-8">
          <p>haydihepberaber.com</p>
        </footer>
      </div>
    </div>
  );
}
