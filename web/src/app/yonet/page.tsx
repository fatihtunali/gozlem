'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Truth {
  id: string;
  content: string;
  category: string;
  me_too_count: number;
  hug_count: number;
  comment_count: number;
  created_at: string;
  owner_email: string | null;
  notify_comments: boolean;
  is_currently_boosted: boolean;
  boost_ends_at: string | null;
  comments: Array<{
    id: string;
    content: string;
    created_at: string;
  }>;
}

const CATEGORIES: Record<string, { label: string; icon: string; color: string }> = {
  itiraf: { label: 'Itiraf', icon: '🤫', color: 'from-purple-500 to-purple-600' },
  ask: { label: 'Ask', icon: '💔', color: 'from-pink-500 to-rose-600' },
  korku: { label: 'Korku', icon: '😰', color: 'from-gray-600 to-gray-700' },
  pismanlik: { label: 'Pismanlik', icon: '😔', color: 'from-blue-500 to-blue-600' },
  umut: { label: 'Umut', icon: '🌅', color: 'from-amber-500 to-orange-600' },
  sir: { label: 'Sir', icon: '🔒', color: 'from-emerald-500 to-emerald-600' },
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'az once';
  if (diffMins < 60) return `${diffMins} dk once`;
  if (diffHours < 24) return `${diffHours} saat once`;
  if (diffDays < 7) return `${diffDays} gun once`;
  return date.toLocaleDateString('tr-TR');
}

function ManagePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCode = searchParams.get('kod') || '';

  const [code, setCode] = useState(initialCode);
  const [truth, setTruth] = useState<Truth | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [notifyComments, setNotifyComments] = useState(true);
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchTruth = async (secretCode: string) => {
    if (!secretCode || secretCode.length !== 8) {
      setError('Gecersiz kod. Kod 8 karakter olmali.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/truths/manage?code=${secretCode}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Itiraf bulunamadi');
        setTruth(null);
        return;
      }

      setTruth(data.truth);
      setEmail(data.truth.owner_email || '');
      setNotifyComments(data.truth.notify_comments);
    } catch {
      setError('Bir hata olustu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      fetchTruth(initialCode);
    }
  }, [initialCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTruth(code);
  };

  const handleSaveEmail = async () => {
    setSavingEmail(true);
    setEmailSaved(false);

    try {
      const res = await fetch('/api/truths/manage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, email, notifyComments }),
      });

      if (res.ok) {
        setEmailSaved(true);
        setTimeout(() => setEmailSaved(false), 3000);
      }
    } catch {
      setError('Kaydetme basarisiz');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const res = await fetch(`/api/truths/manage?code=${code}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/?deleted=true');
      } else {
        setError('Silme basarisiz');
      }
    } catch {
      setError('Silme basarisiz');
    } finally {
      setDeleting(false);
    }
  };

  const catInfo = truth ? CATEGORIES[truth.category] || { label: truth.category, icon: '📝', color: 'from-gray-500 to-gray-600' } : null;

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[100px] animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-8">
          <Link href="/" className="text-gray-500 hover:text-white transition-colors mb-4 inline-block">
            &larr; Ana Sayfa
          </Link>
          <h1 className="text-2xl md:text-3xl font-extralight tracking-wide mb-2">
            Itirafini Yonet
          </h1>
          <p className="text-gray-500 text-sm">Gizli kodunla itirafina eris</p>
        </header>

        {/* Code input form */}
        {!truth && (
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 mb-6">
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Gizli Kod</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                placeholder="XXXXXXXX"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 transition-colors text-center text-2xl font-mono tracking-widest"
                maxLength={8}
              />
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm text-center">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading || code.length !== 8}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-medium disabled:opacity-50 hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              {loading ? 'Araniyor...' : 'Itirafimi Bul'}
            </button>
          </form>
        )}

        {/* Truth display */}
        {truth && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{truth.me_too_count}</div>
                <div className="text-xs text-gray-500">Ben De</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-pink-400">{truth.hug_count}</div>
                <div className="text-xs text-gray-500">Sarilma</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{truth.comment_count}</div>
                <div className="text-xs text-gray-500">Yorum</div>
              </div>
            </div>

            {/* Boost status */}
            {truth.is_currently_boosted && (
              <div className="glass-card rounded-xl p-4 border border-amber-500/30 bg-amber-500/5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚀</span>
                  <div>
                    <p className="font-medium text-amber-400">One Cikarilmis</p>
                    <p className="text-sm text-gray-400">
                      {truth.boost_ends_at && `Bitis: ${new Date(truth.boost_ends_at).toLocaleString('tr-TR')}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Confession content */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                {catInfo && (
                  <span className={`px-2 py-0.5 rounded-full text-xs bg-gradient-to-r ${catInfo.color}`}>
                    {catInfo.icon} {catInfo.label}
                  </span>
                )}
                <span className="text-gray-600 text-xs">{formatTimeAgo(truth.created_at)}</span>
              </div>
              <p className="text-gray-100 text-lg leading-relaxed">{truth.content}</p>
            </div>

            {/* Comments */}
            {truth.comments.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-medium mb-4">Yorumlar ({truth.comments.length})</h3>
                <div className="space-y-3">
                  {truth.comments.map(comment => (
                    <div key={comment.id} className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-300">{comment.content}</p>
                      <span className="text-gray-600 text-xs">{formatTimeAgo(comment.created_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Email settings */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-medium mb-4">Bildirim Ayarlari</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">E-posta Adresi</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyComments}
                    onChange={e => setNotifyComments(e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-gray-300">Yeni yorumlarda bildirim al</span>
                </label>
                <button
                  onClick={handleSaveEmail}
                  disabled={savingEmail}
                  className="w-full py-3 bg-white/10 rounded-xl font-medium hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  {savingEmail ? 'Kaydediliyor...' : emailSaved ? '✓ Kaydedildi' : 'Kaydet'}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              {!truth.is_currently_boosted && (
                <a
                  href={`/boost?id=${truth.id}&content=${encodeURIComponent(truth.content.slice(0, 100))}`}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl font-medium text-center hover:shadow-lg hover:shadow-amber-500/25 transition-all"
                >
                  🚀 One Cikar
                </a>
              )}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 transition-colors"
              >
                Sil
              </button>
            </div>

            {/* Back button */}
            <button
              onClick={() => {
                setTruth(null);
                setCode('');
              }}
              className="w-full py-2 text-gray-500 hover:text-white transition-colors"
            >
              Baska bir itiraf ara
            </button>
          </div>
        )}

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div className="max-w-sm w-full glass-card rounded-2xl p-6">
              <h3 className="text-xl font-medium text-white mb-4">Itirafini silmek istediginden emin misin?</h3>
              <p className="text-gray-400 mb-6">Bu islem geri alinamaz.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 bg-white/10 rounded-xl font-medium hover:bg-white/20 transition-colors"
                >
                  Vazgec
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-3 bg-red-500 rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Siliniyor...' : 'Evet, Sil'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ManagePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <ManagePageContent />
    </Suspense>
  );
}
