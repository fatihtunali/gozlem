'use client';

import { useState, useEffect, useCallback } from 'react';

interface Truth {
  id: string;
  content: string;
  me_too_count: number;
  created_at: string;
  hasVoted?: boolean;
}

export default function Home() {
  const [truths, setTruths] = useState<Truth[]>([]);
  const [newTruth, setNewTruth] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const fetchTruths = useCallback(async () => {
    try {
      const res = await fetch('/api/truths');
      const data = await res.json();
      setTruths(data.truths || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch truths:', err);
    }
  }, []);

  useEffect(() => {
    fetchTruths();
  }, [fetchTruths]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTruth.trim() || newTruth.length < 10 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/truths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newTruth.trim() }),
      });

      if (res.ok) {
        setNewTruth('');
        setShowForm(false);
        setJustSubmitted(true);
        setTimeout(() => setJustSubmitted(false), 3000);
        fetchTruths();
      }
    } catch (err) {
      console.error('Failed to submit truth:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMeToo = async (truthId: string) => {
    try {
      const res = await fetch(`/api/truths/${truthId}/me-too`, {
        method: 'POST',
      });

      if (res.ok) {
        setTruths(prev => prev.map(t =>
          t.id === truthId
            ? { ...t, me_too_count: t.me_too_count + 1, hasVoted: true }
            : t
        ));
      }
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'az önce';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika önce`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} gün önce`;
    return `${Math.floor(seconds / 604800)} hafta önce`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-hidden relative">
      {/* Animated gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-purple-900/20 via-transparent to-transparent animate-pulse-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-blue-900/20 via-transparent to-transparent animate-pulse-slow animation-delay-2000" />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/10 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4 animate-fade-in">
            haydi hep beraber
          </h1>
          <p className="text-gray-500 text-lg animate-fade-in animation-delay-200">
            Kimseye söyleyemediğin şeyi buraya bırak.
          </p>
          <p className="text-gray-600 text-sm mt-2 animate-fade-in animation-delay-400">
            Yalnız değilsin.
          </p>
        </header>

        {/* Submit button / Form */}
        <div className="mb-12 animate-fade-in animation-delay-600">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-6 border border-gray-800 rounded-2xl text-gray-400 hover:border-gray-600 hover:text-gray-300 transition-all duration-500 hover:shadow-lg hover:shadow-purple-900/10 group"
            >
              <span className="group-hover:opacity-0 transition-opacity">
                İçini dök...
              </span>
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                Tıkla ve yaz
              </span>
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <textarea
                  value={newTruth}
                  onChange={(e) => setNewTruth(e.target.value)}
                  placeholder="Burada güvendesin. Kimse kim olduğunu bilmiyor..."
                  className="w-full h-40 bg-gray-900/50 border border-gray-800 rounded-2xl p-6 text-white placeholder-gray-600 focus:outline-none focus:border-purple-800/50 focus:shadow-lg focus:shadow-purple-900/20 transition-all duration-300 resize-none"
                  maxLength={500}
                  autoFocus
                />
                <span className="absolute bottom-4 right-4 text-gray-600 text-sm">
                  {newTruth.length}/500
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={newTruth.length < 10 || isSubmitting}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-900/80 to-blue-900/80 rounded-xl font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:from-purple-800/80 hover:to-blue-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/30"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Gönderiliyor...
                    </span>
                  ) : (
                    'Anonim Paylaş'
                  )}
                </button>
              </div>

              {newTruth.length > 0 && newTruth.length < 10 && (
                <p className="text-gray-600 text-sm text-center">
                  En az 10 karakter yazmalısın
                </p>
              )}
            </form>
          )}
        </div>

        {/* Success message */}
        {justSubmitted && (
          <div className="mb-8 text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-900/30 border border-green-800/50 rounded-full text-green-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Paylaşıldı. Seninle birlikte binlerce kişi var.
            </div>
          </div>
        )}

        {/* Truths list */}
        <div className="space-y-4">
          {truths.map((truth, index) => (
            <div
              key={truth.id}
              className="group p-6 bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-gray-800/50 rounded-2xl hover:border-gray-700/50 transition-all duration-500 hover:shadow-xl hover:shadow-purple-900/5 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <p className="text-gray-200 text-lg leading-relaxed mb-4">
                "{truth.content}"
              </p>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">
                  {formatTimeAgo(truth.created_at)}
                </span>

                <button
                  onClick={() => !truth.hasVoted && handleMeToo(truth.id)}
                  disabled={truth.hasVoted}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    truth.hasVoted
                      ? 'bg-purple-900/30 text-purple-400 cursor-default'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-purple-900/30 hover:text-purple-300'
                  }`}
                >
                  <span className="text-lg">✋</span>
                  <span className="font-medium">{truth.me_too_count.toLocaleString('tr-TR')}</span>
                  <span className="text-sm opacity-70">ben de</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {truths.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-6xl mb-4">🤫</div>
            <p className="text-gray-500">Henüz kimse itiraf etmedi.</p>
            <p className="text-gray-600 text-sm mt-2">İlk sen ol.</p>
          </div>
        )}

        {/* Footer counter */}
        <footer className="mt-16 text-center animate-fade-in">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-900/50 border border-gray-800/50 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-gray-400">
              <span className="text-white font-medium">{totalCount.toLocaleString('tr-TR')}</span>
              {' '}kişi içini döktü
            </span>
          </div>
        </footer>

        {/* Bottom spacing */}
        <div className="h-20" />
      </div>
    </div>
  );
}
