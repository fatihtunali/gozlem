'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Truth {
  id: string;
  content: string;
  category: string;
  me_too_count: number;
  hug_count: number;
  created_at: string;
  is_featured?: boolean;
  hasVoted?: boolean;
  hasHugged?: boolean;
  isNew?: boolean;
  showComments?: boolean;
  comments?: Comment[];
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
}

interface Stats {
  totalTruths: number;
  totalMeToo: number;
  uniqueUsers: number;
}

interface DailyTheme {
  title: string;
  description: string;
  category: string;
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
  const [huggingId, setHuggingId] = useState<string | null>(null);
  const [shareModalTruth, setShareModalTruth] = useState<Truth | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Truth[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [dailyTheme, setDailyTheme] = useState<DailyTheme | null>(null);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // Fetch daily theme
  useEffect(() => {
    fetch('/api/theme')
      .then(res => res.json())
      .then(data => setDailyTheme(data))
      .catch(console.error);
  }, []);

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
    setSearchResults(null);
    setSearchQuery('');
    fetchTruths(0, false);
  }, [fetchTruths]);

  // Search
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/truths/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.truths || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(searchQuery);
      }, 300);
    } else {
      setSearchResults(null);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, handleSearch]);

  // Infinite scroll
  useEffect(() => {
    if (searchResults) return; // Disable infinite scroll during search

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
  }, [hasMore, loadingMore, loading, truths.length, fetchTruths, searchResults]);

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
        setTruths(prev => [{ ...newItem, hug_count: 0, isNew: true }, ...prev]);
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

  // Me too vote
  const handleMeToo = async (truthId: string) => {
    if (votingId) return;
    setVotingId(truthId);

    try {
      const res = await fetch(`/api/truths/${truthId}/me-too`, { method: 'POST' });
      if (res.ok) {
        const updateTruth = (t: Truth) =>
          t.id === truthId ? { ...t, me_too_count: t.me_too_count + 1, hasVoted: true } : t;
        setTruths(prev => prev.map(updateTruth));
        if (searchResults) setSearchResults(prev => prev?.map(updateTruth) || null);
        setStats(prev => ({ ...prev, totalMeToo: prev.totalMeToo + 1 }));
      }
    } catch (err) {
      console.error('Failed to vote:', err);
    } finally {
      setTimeout(() => setVotingId(null), 500);
    }
  };

  // Hug
  const handleHug = async (truthId: string) => {
    if (huggingId) return;
    setHuggingId(truthId);

    try {
      const res = await fetch(`/api/truths/${truthId}/hug`, { method: 'POST' });
      if (res.ok) {
        const updateTruth = (t: Truth) =>
          t.id === truthId ? { ...t, hug_count: t.hug_count + 1, hasHugged: true } : t;
        setTruths(prev => prev.map(updateTruth));
        if (searchResults) setSearchResults(prev => prev?.map(updateTruth) || null);
      }
    } catch (err) {
      console.error('Failed to hug:', err);
    } finally {
      setTimeout(() => setHuggingId(null), 500);
    }
  };

  // Toggle comments
  const toggleComments = async (truthId: string) => {
    const truth = truths.find(t => t.id === truthId);
    if (!truth) return;

    if (truth.showComments) {
      setTruths(prev => prev.map(t =>
        t.id === truthId ? { ...t, showComments: false } : t
      ));
      return;
    }

    // Fetch comments
    try {
      const res = await fetch(`/api/truths/${truthId}/comments`);
      const data = await res.json();
      setTruths(prev => prev.map(t =>
        t.id === truthId ? { ...t, showComments: true, comments: data.comments || [] } : t
      ));
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  // Submit comment
  const handleSubmitComment = async (truthId: string) => {
    const content = newComment[truthId]?.trim();
    if (!content || content.length < 2 || submittingComment) return;

    setSubmittingComment(truthId);
    try {
      const res = await fetch(`/api/truths/${truthId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const comment = await res.json();
        setTruths(prev => prev.map(t =>
          t.id === truthId ? { ...t, comments: [...(t.comments || []), comment] } : t
        ));
        setNewComment(prev => ({ ...prev, [truthId]: '' }));
      }
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmittingComment(null);
    }
  };

  // Random truth
  const handleRandom = async () => {
    try {
      const res = await fetch('/api/truths?random=true&limit=1');
      const data = await res.json();
      if (data.truths?.[0]) {
        const randomTruth = data.truths[0];
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

  // Share - download image
  const handleShare = async (truth: Truth) => {
    setShareModalTruth(truth);
  };

  const downloadShareCard = async () => {
    if (!shareCardRef.current || !shareModalTruth) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: '#08080a',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `itiraf-${shareModalTruth.id.slice(0, 8)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to generate image:', err);
    }
  };

  const copyShareLink = () => {
    if (!shareModalTruth) return;
    navigator.clipboard.writeText(`https://haydihepberaber.com/?t=${shareModalTruth.id}`);
    alert('Link kopyalandı!');
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

  const displayTruths = searchResults || truths;

  return (
    <div className="min-h-screen bg-[#08080a] text-white overflow-x-hidden">
      {/* Gradient mesh background */}
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />

      {/* Animated blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[80px] animate-blob animation-delay-4000" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[60px] animate-blob animation-delay-2000" />
      </div>

      {/* Grid mesh overlay */}
      <div className="fixed inset-0 bg-mesh pointer-events-none" />

      {/* Grain overlay */}
      <div className="fixed inset-0 opacity-30 pointer-events-none bg-noise" />

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

        {/* Daily theme banner */}
        {dailyTheme && (
          <div className="mb-6 animate-fade-in">
            <div className="glass-card rounded-2xl p-4 border-purple-500/20">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <div className="font-medium text-purple-300">{dailyTheme.title}</div>
                  <div className="text-sm text-gray-500">{dailyTheme.description}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search bar */}
        <div className="mb-6 animate-fade-in animation-delay-400">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İtiraflarda ara..."
              className="w-full px-4 py-3 pl-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            {isSearching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin inline-block" />
              </span>
            )}
          </div>
          {searchResults && (
            <div className="mt-2 text-sm text-gray-500">
              {searchResults.length} sonuç bulundu
              <button
                onClick={() => { setSearchQuery(''); setSearchResults(null); }}
                className="ml-2 text-purple-400 hover:text-purple-300"
              >
                Temizle
              </button>
            </div>
          )}
        </div>

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
        {!searchResults && (
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
        )}

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
            {displayTruths.map((truth, index) => {
              const catInfo = getCategoryInfo(truth.category);
              const isVoting = votingId === truth.id;
              const isHugging = huggingId === truth.id;
              const isTopToday = index === 0 && sortBy === 'top' && !searchResults;

              return (
                <div
                  key={truth.id}
                  className={`glass-card rounded-2xl p-5 transition-all duration-500 ${
                    truth.isNew ? 'animate-slide-in ring-1 ring-purple-500/30' : ''
                  } ${isVoting || isHugging ? 'scale-[1.01]' : ''} ${
                    isTopToday ? 'ring-2 ring-amber-500/30 bg-amber-500/5' : ''
                  }`}
                >
                  {/* Top badge */}
                  {isTopToday && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                        🔥 Günün İtirafı
                      </span>
                    </div>
                  )}

                  {/* Category badge & time */}
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

                  {/* Action buttons */}
                  <div className="flex items-center justify-between">
                    {/* Left actions */}
                    <div className="flex items-center gap-2">
                      {/* Comments toggle */}
                      <button
                        onClick={() => toggleComments(truth.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                      >
                        💬 <span className="text-xs">{truth.comments?.length || 0}</span>
                      </button>

                      {/* Share button */}
                      <button
                        onClick={() => handleShare(truth)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                      >
                        📤
                      </button>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-2">
                      {/* Hug button */}
                      <button
                        onClick={() => !truth.hasHugged && handleHug(truth.id)}
                        disabled={truth.hasHugged}
                        className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
                          truth.hasHugged
                            ? 'bg-pink-500/20 text-pink-300'
                            : 'bg-white/5 text-gray-400 hover:bg-pink-500/20 hover:text-pink-300'
                        } ${isHugging ? 'animate-vote-pop' : ''}`}
                      >
                        <span className={`transition-transform ${isHugging ? 'scale-125' : 'group-hover:scale-110'}`}>
                          🤗
                        </span>
                        <span className="font-medium tabular-nums text-sm">
                          {truth.hug_count}
                        </span>
                      </button>

                      {/* Me too button */}
                      <button
                        onClick={() => !truth.hasVoted && handleMeToo(truth.id)}
                        disabled={truth.hasVoted}
                        className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
                          truth.hasVoted
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-white/5 text-gray-400 hover:bg-purple-500/20 hover:text-purple-300'
                        } ${isVoting ? 'animate-vote-pop' : ''}`}
                      >
                        <span className={`transition-transform ${isVoting ? 'animate-wave' : 'group-hover:animate-wave'}`}>
                          ✋
                        </span>
                        <span className="font-medium tabular-nums text-sm">
                          {truth.me_too_count}
                        </span>
                        <span className="text-xs opacity-60">ben de</span>
                      </button>
                    </div>
                  </div>

                  {/* Comments section */}
                  {truth.showComments && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      {/* Existing comments */}
                      {truth.comments && truth.comments.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {truth.comments.map(comment => (
                            <div key={comment.id} className="text-sm text-gray-400 bg-white/5 rounded-lg px-3 py-2">
                              {comment.content}
                              <span className="text-gray-600 text-xs ml-2">{formatTimeAgo(comment.created_at)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add comment */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newComment[truth.id] || ''}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [truth.id]: e.target.value }))}
                          placeholder="Anonim yorum..."
                          maxLength={150}
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
                        />
                        <button
                          onClick={() => handleSubmitComment(truth.id)}
                          disabled={!newComment[truth.id]?.trim() || submittingComment === truth.id}
                          className="px-4 py-2 bg-purple-600 rounded-lg text-sm font-medium disabled:opacity-30 hover:bg-purple-500 transition-colors"
                        >
                          {submittingComment === truth.id ? '...' : 'Gönder'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && displayTruths.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 animate-bounce-slow">🤫</div>
            <p className="text-gray-500 mb-2">
              {searchResults ? 'Arama sonucu bulunamadı.' : 'Bu kategoride henüz itiraf yok.'}
            </p>
            {!searchResults && (
              <button
                onClick={() => setShowForm(true)}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                İlk sen ol →
              </button>
            )}
          </div>
        )}

        {/* Load more indicator */}
        {!searchResults && (
          <div ref={loadMoreRef} className="py-8 text-center">
            {loadingMore && (
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <span className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
                Yükleniyor...
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center pb-8 text-gray-600 text-sm">
          <p>Burada herkes anonim. Yargılama yok.</p>
        </footer>
      </div>

      {/* Share Modal */}
      {shareModalTruth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setShareModalTruth(null)}>
          <div className="max-w-md w-full" onClick={e => e.stopPropagation()}>
            {/* Share card preview */}
            <div
              ref={shareCardRef}
              className="bg-[#08080a] p-8 rounded-2xl border border-white/10"
              style={{ background: 'linear-gradient(135deg, #08080a 0%, #1a1a2e 100%)' }}
            >
              <div className="text-center mb-6">
                <div className="text-2xl font-extralight tracking-wide text-white/90">haydi hep beraber</div>
              </div>
              <div className="bg-white/5 rounded-xl p-6 mb-4">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs bg-gradient-to-r ${getCategoryInfo(shareModalTruth.category).color} mb-3`}>
                  {getCategoryInfo(shareModalTruth.category).icon} {getCategoryInfo(shareModalTruth.category).label}
                </span>
                <p className="text-white text-lg leading-relaxed">
                  {shareModalTruth.content}
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                <span>✋ {shareModalTruth.me_too_count} ben de</span>
                <span>🤗 {shareModalTruth.hug_count} sarıldı</span>
              </div>
              <div className="text-center mt-4 text-xs text-gray-600">
                haydihepberaber.com
              </div>
            </div>

            {/* Share actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={downloadShareCard}
                className="flex-1 py-3 bg-purple-600 rounded-xl font-medium hover:bg-purple-500 transition-colors"
              >
                📥 Görseli İndir
              </button>
              <button
                onClick={copyShareLink}
                className="flex-1 py-3 bg-white/10 rounded-xl font-medium hover:bg-white/20 transition-colors"
              >
                🔗 Link Kopyala
              </button>
            </div>
            <button
              onClick={() => setShareModalTruth(null)}
              className="w-full mt-3 py-2 text-gray-500 hover:text-white transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
