'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Crown, CreditCard, Lock } from 'lucide-react';

function PaymentContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'monthly';
  const orderId = searchParams.get('order') || '';
  const email = searchParams.get('email') || '';

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const planDetails = {
    monthly: { name: 'Aylik Premium', price: '49.99' },
    yearly: { name: 'Yillik Premium', price: '399.99' }
  };

  const currentPlan = planDetails[plan as keyof typeof planDetails] || planDetails.monthly;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
      // In production, this would call Halkbank's payment API
      // For now, simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call our callback endpoint
      const res = await fetch('/api/premium/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: 'success',
          transactionId: `TXN-${Date.now()}`
        })
      });

      const data = await res.json();

      if (data.success) {
        // Store premium status locally
        localStorage.setItem('isPremium', 'true');
        localStorage.setItem('premiumExpiry', data.membership.expiresAt);

        // Redirect to success page
        window.location.href = '/premium/basarili';
      } else {
        setError('Odeme islemi basarisiz oldu. Lutfen tekrar deneyin.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Bir hata olustu. Lutfen tekrar deneyin.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 bg-noise opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{currentPlan.name}</h1>
          <div className="text-3xl font-bold text-amber-400">
            {currentPlan.price} TL
          </div>
        </div>

        {/* Payment form */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
            <Lock className="w-4 h-4" />
            <span>Guvenli odeme</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Card number */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Kart Numarasi</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                  required
                />
              </div>
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Son Kullanim</label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="AA/YY"
                  maxLength={5}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">CVV</label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="123"
                  maxLength={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                  required
                />
              </div>
            </div>

            {/* Card holder */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Kart Sahibi</label>
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                placeholder="AD SOYAD"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                required
              />
            </div>

            {/* Email confirmation */}
            {email && (
              <div className="bg-white/5 rounded-xl p-3 text-sm">
                <span className="text-gray-400">Fatura e-posta:</span>
                <span className="text-white ml-2">{email}</span>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Isleniyor...
                </span>
              ) : (
                `${currentPlan.price} TL Ode`
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-4">
            Odeme bilgileriniz 256-bit SSL ile korunmaktadir.
          </p>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <a href="/premium" className="text-gray-500 hover:text-white transition-colors">
            Geri Don
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PremiumPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
