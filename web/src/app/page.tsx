'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Truth {
  id: string;
  content: string;
  category: string;
  me_too_count: number;
  created_at: string;
  is_featured?: boolean;
  hasVoted?: boolean;
  isNew?: boolean;
}

interface Stats {
  totalTruths: number;
  totalMeToo: number;
  uniqueUsers: number;
}

const CATEGORIES = [
  { id: 'all', label: 'Hepsi', icon: '✨', color: 'from-gray-500 to-gray-600' },
  { id: 'itiraf', label: 'İtiraf', icon: '🤫', color: 'from-purple-500 to-purple-600' },
  { id: 'ask', label: 'Aşk', icon: '💔', color: 'from-pink-500 to-rose-600' },
  { id: 'korku', label: 'Korku', icon: '😰', color: 'from-gray-600 to-gray-700' },
  { id: 'pismanlik', label: 'Pişmanlık', icon: '😔', color: 'from-blue-500 to-blue-600' },
  { id: 'umut', label: 'Umut', icon: '🌅', color: 'from-amber-500 to-orange-600' },
  { id: 'sir', label: 'Sır', icon: '🔒', color: 'from-emerald-500 to-emerald-600' },
];

export default function Home() {
  const [truths, setTruths] = useState<Truth[]>([]);
  const [stats, setStats] = useState<Stats>({ totalTruths: 0, totalMeToo: 0, uniqueUsers: 0 });
  const [newTruth, setNewTruth] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [formCategory, setFormCategory] = useState('itiraf');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<'new' | 'top'>('new');
  const [votingId, setVotingId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch truths
  const fetchTruths = useCallback(async (offset = 0, append = false) => {
    try {
      if (offset === 0) setLoading(true);
      else setLoadingMore(true);

      const categoryParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : '';
      const res = await fetch(`/api/truths?limit=20&offset=${offset}&sort=${sortBy}${categoryParam}`);
      const data = await res.json();

      if (append) {
        setTruths(prev => [...prev, ...data.truths]);
      } else {
        setTruths(data.truths || []);
      }

      setStats(data.stats || { totalTruths: 0, totalMeToo: 0, uniqueUsers: 0 });
      setHasMore(data.truths?.length === 20);
    } catch (err) {
      console.error('Failed to fetch truths:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    fetchTruths(0, false);
  }, [fetchTruths]);

  // Infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchTruths(truths.length, true);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, loading, truths.length, fetchTruths]);

  // Submit truth
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTruth.trim() || newTruth.length < 10 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/truths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newTruth.trim(), category: formCategory }),
      });

      if (res.ok) {
        const newItem = await res.json();
        setTruths(prev => [{ ...newItem, isNew: true }, ...prev]);
        setStats(prev => ({ ...prev, totalTruths: prev.totalTruths + 1 }));
        setNewTruth('');
        setShowForm(false);
        setJustSubmitted(true);
        setTimeout(() => setJustSubmitted(false), 4000);
      }
    } catch (err) {
      console.error('Failed to submit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Me too vote with animation
  const handleMeToo = async (truthId: string) => {
    if (votingId) return;
    setVotingId(truthId);

    try {
      const res = await fetch(`/api/truths/${truthId}/me-too`, { method: 'POST' });
      if (res.ok) {
        setTruths(prev => prev.map(t =>
          t.id === truthId ? { ...t, me_too_count: t.me_too_count + 1, hasVoted: true } : t
        ));
        setStats(prev => ({ ...prev, totalMeToo: prev.totalMeToo + 1 }));
      }
    } catch (err) {
      console.error('Failed to vote:', err);
    } finally {
      setTimeout(() => setVotingId(null), 500);
    }
  };

  // Random truth
  const handleRandom = async () => {
    try {
      const res = await fetch('/api/truths?random=true&limit=1');
      const data = await res.json();
      if (data.truths?.[0]) {
        const randomTruth = data.truths[0];
        // Scroll to top and highlight
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTruths(prev => {
          const filtered = prev.filter(t => t.id !== randomTruth.id);
          return [{ ...randomTruth, isNew: true }, ...filtered];
        });
      }
    } catch (err) {
      console.error('Failed to get random:', err);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return 'az önce';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}dk önce`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}sa önce`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}g önce`;
    return `${Math.floor(seconds / 604800)}h önce`;
  };

  const getCategoryInfo = (cat: string) => CATEGORIES.find(c => c.id === cat) || CATEGORIES[1];

  return (
    <div className="min-h-screen bg-[#08080a] text-white overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-600/5 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Grain overlay */}
      <div className="fixed inset-0 opacity-20 pointer-events-none bg-noise" />

      {/* Main content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extralight tracking-wide mb-3 animate-fade-in">
            haydi hep beraber
          </h1>
          <p className="text-gray-500 animate-fade-in animation-delay-200">
            Kimseye söyleyemediğin şeyi buraya bırak.
          </p>

          {/* Live stats */}
          <div className="flex items-center justify-center gap-6 mt-6 text-sm animate-fade-in animation-delay-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-gray-400">
                <span className="text-white font-medium">{stats.totalTruths.toLocaleString('tr-TR')}</span> itiraf
              </span>
            </div>
            <div className="text-gray-600">•</div>
            <div className="text-gray-400">
              <span className="text-white font-medium">{stats.totalMeToo.toLocaleString('tr-TR')}</span> "ben de"
            </div>
          </div>
        </header>

        {/* Submit button */}
        <div className="mb-8 animate-fade-in animation-delay-600">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-5 glass-card rounded-2xl text-gray-400 hover:text-white hover:border-purple-500/30 transition-all duration-500 group"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="text-xl opacity-50 group-hover:opacity-100 transition-opacity">✍️</span>
                <span>İçini dök...</span>
              </span>
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
              {/* Category selector */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.slice(1).map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all duration-300 ${
                      formCategory === cat.id
                        ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <textarea
                  value={newTruth}
                  onChange={(e) => setNewTruth(e.target.value)}
                  placeholder="Burada güvendesin..."
                  className="w-full h-32 bg-transparent border-0 text-white placeholder-gray-600 focus:outline-none resize-none text-lg"
                  maxLength={500}
                  autoFocus
                />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">{newTruth.length}/500</span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-500 hover:text-white transition-colors"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={newTruth.length < 10 || isSubmitting}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ...
                      </span>
                    ) : (
                      'Paylaş'
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Success message */}
        {justSubmitted && (
          <div className="mb-6 animate-fade-in">
            <div className="glass-card rounded-full px-6 py-3 text-center border-green-500/30">
              <span className="text-green-400">✓ Paylaşıldı. Yalnız değilsin.</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                  selectedCategory === cat.id
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Sort & Random */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('new')}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  sortBy === 'new' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'
                }`}
              >
                Yeni
              </button>
              <button
                onClick={() => setSortBy('top')}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  sortBy === 'top' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'
                }`}
              >
                Popüler
              </button>
            </div>
            <button
              onClick={handleRandom}
              className="px-4 py-1.5 rounded-lg text-sm bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 hover:from-purple-600/30 hover:to-blue-600/30 transition-all"
            >
              🎲 Rastgele
            </button>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-3" />
                <div className="h-4 bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Truths list */}
        {!loading && (
          <div className="space-y-3">
            {truths.map((truth) => {
              const catInfo = getCategoryInfo(truth.category);
              const isVoting = votingId === truth.id;

              return (
                <div
                  key={truth.id}
                  className={`glass-card rounded-2xl p-6 transition-all duration-500 ${
                    truth.isNew ? 'animate-slide-in ring-1 ring-purple-500/30' : ''
                  } ${isVoting ? 'scale-[1.02]' : ''}`}
                >
                  {/* Category badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs bg-gradient-to-r ${catInfo.color} bg-opacity-20`}>
                      {catInfo.icon} {catInfo.label}
                    </span>
                    <span className="text-gray-600 text-xs">{formatTimeAgo(truth.created_at)}</span>
                  </div>

                  {/* Content */}
                  <p className="text-gray-100 text-lg leading-relaxed mb-4">
                    {truth.content}
                  </p>

                  {/* Me too button */}
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => !truth.hasVoted && handleMeToo(truth.id)}
                      disabled={truth.hasVoted}
                      className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                        truth.hasVoted
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-white/5 text-gray-400 hover:bg-purple-500/20 hover:text-purple-300 hover:scale-105 active:scale-95'
                      } ${isVoting ? 'animate-vote-pop' : ''}`}
                    >
                      <span className={`text-lg transition-transform ${isVoting ? 'animate-wave' : 'group-hover:animate-wave'}`}>
                        ✋
                      </span>
                      <span className="font-medium tabular-nums">
                        {truth.me_too_count.toLocaleString('tr-TR')}
                      </span>
                      <span className="text-sm opacity-60">ben de</span>

                      {/* Sparkle effect on vote */}
                      {isVoting && (
                        <span className="absolute inset-0 pointer-events-none">
                          {[...Array(6)].map((_, i) => (
                            <span
                              key={i}
                              className="absolute w-1 h-1 bg-purple-400 rounded-full animate-sparkle"
                              style={{
                                left: `${50 + (Math.random() - 0.5) * 80}%`,
                                top: `${50 + (Math.random() - 0.5) * 80}%`,
                                animationDelay: `${i * 50}ms`,
                              }}
                            />
                          ))}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && truths.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 animate-bounce-slow">🤫</div>
            <p className="text-gray-500 mb-2">Bu kategoride henüz itiraf yok.</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              İlk sen ol →
            </button>
          </div>
        )}

        {/* Load more indicator */}
        <div ref={loadMoreRef} className="py-8 text-center">
          {loadingMore && (
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <span className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
              Yükleniyor...
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center pb-8 text-gray-600 text-sm">
          <p>Burada herkes anonim. Yargılama yok.</p>
        </footer>
      </div>
    </div>
  );
}
