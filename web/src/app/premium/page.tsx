'use client';

import { useState, useEffect } from 'react';
import { Crown, Check, Sparkles, Shield, BarChart, Zap, Star } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  features: string[];
}

export default function PremiumPage() {
  const [plans, setPlans] = useState<{ monthly: Plan; yearly: Plan } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [membership, setMembership] = useState<any>(null);

  useEffect(() => {
    // Fetch plans and check current status
    const userFp = localStorage.getItem('user_fingerprint') || '';

    fetch(`/api/premium?user=${userFp}`)
      .then(res => res.json())
      .then(data => {
        setPlans(data.plans);
        if (data.isPremium) {
          setIsPremium(true);
          setMembership(data.membership);
        }
      })
      .catch(console.error);
  }, []);

  const handleSubscribe = async () => {
    if (!email && !localStorage.getItem('user_fingerprint')) {
      alert('Lutfen e-posta adresinizi girin');
      return;
    }

    setIsLoading(true);
    try {
      const userFp = localStorage.getItem('user_fingerprint') || email;

      const res = await fetch('/api/premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIdentifier: userFp,
          planId: selectedPlan,
          email
        })
      });

      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Bir hata olustu. Lutfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return (price / 100).toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (isPremium && membership) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
        <div className="fixed inset-0 bg-noise opacity-30 pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
          <div className="glass-card rounded-3xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Crown className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Premium Uyesin!
            </h1>

            <p className="text-gray-400 mb-6">
              Tum premium ozelliklerin aktif.
            </p>

            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Plan:</span>
                <span className="text-white font-medium">
                  {membership.planType === 'yearly' ? 'Yillik' : 'Aylik'} Premium
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-400">Bitis tarihi:</span>
                <span className="text-white font-medium">
                  {new Date(membership.expiresAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>

            <a
              href="/"
              className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Ana Sayfaya Don
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-orange-600/15 rounded-full blur-[100px] animate-blob animation-delay-2000" />
      </div>
      <div className="fixed inset-0 bg-noise opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300">Premium Uyelik</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              Deneyimini
            </span>
            <br />
            <span className="text-white">Yukselt</span>
          </h1>

          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Reklamlari kaldir, itiraflarini one cikar ve cok daha fazlasi.
          </p>
        </div>

        {/* Plan toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-1 p-1 bg-white/5 rounded-xl">
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedPlan === 'monthly'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Aylik
            </button>
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedPlan === 'yearly'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Yillik
              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                2 ay bedava
              </span>
            </button>
          </div>
        </div>

        {/* Plan card */}
        <div className="max-w-md mx-auto">
          <div className="glass-card rounded-3xl p-8 border-amber-500/30 relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10" />

            <div className="relative">
              {/* Crown icon */}
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>

              {/* Plan name */}
              <h2 className="text-2xl font-bold text-center mb-2">
                {selectedPlan === 'yearly' ? 'Yillik Premium' : 'Aylik Premium'}
              </h2>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-4xl font-bold text-white">
                    {plans ? formatPrice(plans[selectedPlan].price) : '...'}
                  </span>
                  <span className="text-gray-400">TL</span>
                </div>
                <span className="text-sm text-gray-500">
                  {selectedPlan === 'yearly' ? '/yil' : '/ay'}
                </span>
                {selectedPlan === 'yearly' && (
                  <div className="text-sm text-green-400 mt-1">
                    Ayda sadece 33.33 TL
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-gray-300">Tum reklamlar kaldirilir</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-gray-300">
                    Itiraflarini one cikar ({selectedPlan === 'yearly' ? '5' : '2'}x/ay)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Star className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-gray-300">Premium rozeti</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <BarChart className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-gray-300">Detayli istatistikler</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-pink-400" />
                  </div>
                  <span className="text-gray-300">1000 karakter itiraf limiti</span>
                </div>

                {selectedPlan === 'yearly' && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="text-gray-300">Ozel premium renkleri</span>
                  </div>
                )}
              </div>

              {/* Email input */}
              <div className="mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresiniz"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Subscribe button */}
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Yukleniyor...
                  </span>
                ) : (
                  <>Premium Ol</>
                )}
              </button>

              <p className="text-center text-xs text-gray-500 mt-4">
                Guvenli odeme. Istedigin zaman iptal edebilirsin.
              </p>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <a href="/" className="text-gray-500 hover:text-white transition-colors">
            Ana Sayfaya Don
          </a>
        </div>
      </div>
    </div>
  );
}
