'use client';

import { useState, useEffect } from 'react';

interface DashboardStats {
  total_truths: number;
  visible_truths: number;
  truths_today: number;
  total_comments: number;
  comments_today: number;
  total_metoo: number;
  total_hugs: number;
  successful_payments: number;
  total_revenue: number;
  active_boosts: number;
}

interface Truth {
  id: string;
  content: string;
  category: string;
  me_too_count: number;
  hug_count: number;
  is_visible: boolean;
  is_boosted: boolean;
  boost_ends_at: string | null;
  created_at: string;
  secret_code: string;
  owner_email: string | null;
  comment_count: number;
}

interface Comment {
  id: string;
  content: string;
  is_visible: boolean;
  created_at: string;
  truth_id: string;
  truth_content: string;
}

interface Payment {
  id: string;
  order_id: string;
  amount: number;
  status: string;
  customer_email: string;
  boost_duration: string;
  created_at: string;
  truth_content: string;
}

type Tab = 'dashboard' | 'truths' | 'comments' | 'payments';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(false);

  // Dashboard data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTruths, setRecentTruths] = useState<Truth[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);

  // Lists data
  const [truths, setTruths] = useState<Truth[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async (type: string, pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?type=${type}&page=${pageNum}`, {
        headers: { Authorization: `Bearer ${password}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          setIsAuthenticated(false);
          setAuthError('Oturum suresi doldu');
        }
        return;
      }

      const data = await res.json();

      if (type === 'dashboard') {
        setStats(data.stats);
        setRecentTruths(data.recentTruths);
        setRecentPayments(data.recentPayments);
      } else if (type === 'truths') {
        setTruths(data.truths);
        setTotalPages(data.totalPages);
      } else if (type === 'comments') {
        setComments(data.comments);
        setTotalPages(data.totalPages);
      } else if (type === 'payments') {
        setPayments(data.payments);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const res = await fetch('/api/admin?type=dashboard', {
        headers: { Authorization: `Bearer ${password}` },
      });

      if (res.ok) {
        setIsAuthenticated(true);
        const data = await res.json();
        setStats(data.stats);
        setRecentTruths(data.recentTruths);
        setRecentPayments(data.recentPayments);
      } else {
        setAuthError('Yanlis sifre');
      }
    } catch {
      setAuthError('Baglanti hatasi');
    }
  };

  const handleAction = async (action: string, id: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({ action, id }),
      });

      if (res.ok) {
        // Refresh current tab data
        fetchData(activeTab, page);
      }
    } catch (error) {
      console.error('Action error:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData(activeTab, page);
    }
  }, [activeTab, page, isAuthenticated]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center">
        <div className="max-w-sm w-full p-6">
          <h1 className="text-2xl font-light text-center mb-8">Admin Paneli</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Sifre"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50"
              autoFocus
            />
            {authError && (
              <p className="text-red-400 text-sm text-center">{authError}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-medium"
            >
              Giris Yap
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-light">Admin Paneli</h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-gray-400 hover:text-white"
          >
            Cikis
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
          {(['dashboard', 'truths', 'comments', 'payments'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'dashboard' && 'Dashboard'}
              {tab === 'truths' && 'Itiraflar'}
              {tab === 'comments' && 'Yorumlar'}
              {tab === 'payments' && 'Odemeler'}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Dashboard */}
        {!loading && activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-400">{stats.total_truths}</div>
                <div className="text-xs text-gray-500">Toplam Itiraf</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-400">{stats.truths_today}</div>
                <div className="text-xs text-gray-500">Bugun</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-400">{stats.total_comments}</div>
                <div className="text-xs text-gray-500">Yorum</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-amber-400">{stats.active_boosts}</div>
                <div className="text-xs text-gray-500">Aktif Boost</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-emerald-400">{formatMoney(stats.total_revenue)}</div>
                <div className="text-xs text-gray-500">Toplam Gelir</div>
              </div>
            </div>

            {/* Recent items */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="font-medium mb-4">Son Itiraflar</h3>
                <div className="space-y-2">
                  {recentTruths.map(t => (
                    <div key={t.id} className="text-sm">
                      <p className="text-gray-300 truncate">{t.content}</p>
                      <p className="text-gray-600 text-xs">{formatDate(t.created_at)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="font-medium mb-4">Son Odemeler</h3>
                <div className="space-y-2">
                  {recentPayments.map(p => (
                    <div key={p.order_id} className="text-sm flex justify-between">
                      <span className={p.status === 'SUCCESS' ? 'text-green-400' : 'text-red-400'}>
                        {formatMoney(p.amount)}
                      </span>
                      <span className="text-gray-600">{formatDate(p.created_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Truths list */}
        {!loading && activeTab === 'truths' && (
          <div className="space-y-4">
            {truths.map(truth => (
              <div key={truth.id} className={`bg-white/5 rounded-xl p-4 ${!truth.is_visible ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 bg-purple-500/20 rounded-full">{truth.category}</span>
                      {truth.is_boosted && <span className="text-xs px-2 py-0.5 bg-amber-500/20 rounded-full text-amber-400">Boosted</span>}
                      {!truth.is_visible && <span className="text-xs px-2 py-0.5 bg-red-500/20 rounded-full text-red-400">Gizli</span>}
                    </div>
                    <p className="text-gray-300 mb-2">{truth.content}</p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>✋ {truth.me_too_count}</span>
                      <span>🤗 {truth.hug_count}</span>
                      <span>💬 {truth.comment_count}</span>
                      <span>Kod: {truth.secret_code}</span>
                      {truth.owner_email && <span>📧 {truth.owner_email}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {truth.is_visible ? (
                      <button
                        onClick={() => handleAction('hide_truth', truth.id)}
                        className="px-3 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30"
                      >
                        Gizle
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction('show_truth', truth.id)}
                        className="px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                      >
                        Goster
                      </button>
                    )}
                    <button
                      onClick={() => handleAction('delete_truth', truth.id)}
                      className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 bg-white/10 rounded-lg disabled:opacity-50"
                >
                  Onceki
                </button>
                <span className="px-3 py-1">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 bg-white/10 rounded-lg disabled:opacity-50"
                >
                  Sonraki
                </button>
              </div>
            )}
          </div>
        )}

        {/* Comments list */}
        {!loading && activeTab === 'comments' && (
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className={`bg-white/5 rounded-xl p-4 ${!comment.is_visible ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {!comment.is_visible && <span className="text-xs px-2 py-0.5 bg-red-500/20 rounded-full text-red-400 mb-2 inline-block">Gizli</span>}
                    <p className="text-gray-300 mb-2">{comment.content}</p>
                    <p className="text-xs text-gray-600 truncate">Itiraf: {comment.truth_content}</p>
                  </div>
                  <div className="flex gap-2">
                    {comment.is_visible ? (
                      <button
                        onClick={() => handleAction('hide_comment', comment.id)}
                        className="px-3 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30"
                      >
                        Gizle
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction('show_comment', comment.id)}
                        className="px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                      >
                        Goster
                      </button>
                    )}
                    <button
                      onClick={() => handleAction('delete_comment', comment.id)}
                      className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 bg-white/10 rounded-lg disabled:opacity-50"
                >
                  Onceki
                </button>
                <span className="px-3 py-1">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 bg-white/10 rounded-lg disabled:opacity-50"
                >
                  Sonraki
                </button>
              </div>
            )}
          </div>
        )}

        {/* Payments list */}
        {!loading && activeTab === 'payments' && (
          <div className="space-y-4">
            {payments.map(payment => (
              <div key={payment.order_id} className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-lg font-bold ${payment.status === 'SUCCESS' ? 'text-green-400' : payment.status === 'FAILED' ? 'text-red-400' : 'text-yellow-400'}`}>
                        {formatMoney(payment.amount)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${payment.status === 'SUCCESS' ? 'bg-green-500/20 text-green-400' : payment.status === 'FAILED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {payment.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{payment.customer_email}</p>
                    <p className="text-xs text-gray-600">{payment.order_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">{payment.boost_duration}</p>
                    <p className="text-xs text-gray-600">{formatDate(payment.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 bg-white/10 rounded-lg disabled:opacity-50"
                >
                  Onceki
                </button>
                <span className="px-3 py-1">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 bg-white/10 rounded-lg disabled:opacity-50"
                >
                  Sonraki
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
