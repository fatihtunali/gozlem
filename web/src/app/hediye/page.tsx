'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface GiftType {
  id: string;
  name: string;
  emoji: string;
  price: number;
  description: string;
}

function GiftPageContent() {
  const searchParams = useSearchParams();
  const truthId = searchParams.get('id');
  const truthContent = searchParams.get('content');

  const [giftTypes, setGiftTypes] = useState<GiftType[]>([]);
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpMonth, setCardExpMonth] = useState('');
  const [cardExpYear, setCardExpYear] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const [formAction, setFormAction] = useState('');
  const [formFields, setFormFields] = useState<Record<string, string>>({});

  // Fetch gift types
  useEffect(() => {
    fetch('/api/gifts')
      .then(res => res.json())
      .then(data => {
        setGiftTypes(data.gifts || []);
        if (data.gifts?.length > 0) {
          setSelectedGift(data.gifts[0].id);
        }
      })
      .catch(console.error);
  }, []);

  // Auto-submit form when formAction is set
  useEffect(() => {
    if (formAction && formRef.current) {
      formRef.current.submit();
    }
  }, [formAction]);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payments/halkbank/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          truthId,
          paymentType: 'gift',
          giftTypeId: selectedGift,
          giftMessage: message,
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardExpMonth,
          cardExpYear,
          cardCvv,
          cardHolderName,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Odeme baslatilamadi');
      }

      // Set form action and fields for 3D Secure redirect
      setFormAction(data.formAction);
      setFormFields(data.formFields);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata olustu');
      setLoading(false);
    }
  };

  if (!truthId) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Itiraf bulunamadi</p>
          <Link href="/" className="text-purple-400 hover:text-purple-300">
            Ana Sayfaya Don
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center animate-bounce-slow">
            <span className="text-4xl">{giftTypes.find(g => g.id === selectedGift)?.emoji || '🎁'}</span>
          </div>
          <h1 className="text-2xl font-light mb-4">Hediye Gonderildi!</h1>
          <p className="text-gray-400 mb-8">
            Hediyeniz itiraf sahibine iletildi. Desteginiz icin tesekkurler!
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            Ana Sayfaya Don
          </Link>
        </div>
      </div>
    );
  }

  const selectedGiftType = giftTypes.find(g => g.id === selectedGift);

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      {/* Hidden form for 3D Secure redirect */}
      {formAction && (
        <form ref={formRef} action={formAction} method="POST" style={{ display: 'none' }}>
          {Object.entries(formFields).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
        </form>
      )}

      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[100px] animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-8">
          <Link href="/" className="text-gray-500 hover:text-white transition-colors mb-4 inline-block">
            &larr; Vazgec
          </Link>
          <h1 className="text-2xl md:text-3xl font-extralight tracking-wide mb-2">
            Hediye Gonder
          </h1>
          <p className="text-gray-500 text-sm">Itiraf sahibine destek ol</p>
        </header>

        {/* Truth preview */}
        {truthContent && (
          <div className="glass-card rounded-2xl p-4 mb-6">
            <p className="text-gray-300 text-sm line-clamp-2">{decodeURIComponent(truthContent)}</p>
          </div>
        )}

        {/* Gift selection */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {giftTypes.map(gift => (
            <button
              key={gift.id}
              type="button"
              onClick={() => setSelectedGift(gift.id)}
              className={`p-4 rounded-2xl text-center transition-all ${
                selectedGift === gift.id
                  ? 'bg-gradient-to-r from-pink-600/30 to-purple-600/30 border border-pink-500/50 scale-105'
                  : 'glass-card hover:border-white/20'
              }`}
            >
              <div className="text-3xl mb-2">{gift.emoji}</div>
              <div className="text-sm font-medium">{gift.name}</div>
              <div className="text-xs text-gray-400 mt-1">{gift.price.toFixed(2)} TL</div>
            </button>
          ))}
        </div>

        {/* Optional message */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Mesaj (opsiyonel)</label>
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Guzel sozler..."
            maxLength={100}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>

        {/* Payment form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Kart Numarasi</label>
            <input
              type="text"
              value={cardNumber}
              onChange={e => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="0000 0000 0000 0000"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 transition-colors"
              required
              maxLength={19}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Ay</label>
              <input
                type="text"
                value={cardExpMonth}
                onChange={e => setCardExpMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                placeholder="MM"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 transition-colors text-center"
                required
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Yil</label>
              <input
                type="text"
                value={cardExpYear}
                onChange={e => setCardExpYear(e.target.value.replace(/\D/g, '').slice(0, 2))}
                placeholder="YY"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 transition-colors text-center"
                required
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">CVV</label>
              <input
                type="text"
                value={cardCvv}
                onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="***"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 transition-colors text-center"
                required
                maxLength={4}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Kart Uzerindeki Isim</label>
            <input
              type="text"
              value={cardHolderName}
              onChange={e => setCardHolderName(e.target.value.toUpperCase())}
              placeholder="AD SOYAD"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 transition-colors uppercase"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 transition-colors"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selectedGift || !cardNumber || !cardExpMonth || !cardExpYear || !cardCvv || !cardHolderName || !email}
            className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Yonlendiriliyor...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>{selectedGiftType?.emoji}</span>
                <span>Hediye Gonder - {selectedGiftType?.price.toFixed(2)} TL</span>
              </span>
            )}
          </button>

          <p className="text-center text-xs text-gray-600">
            Odemeleriniz 3D Secure ile guvence altindadir.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function GiftPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <GiftPageContent />
    </Suspense>
  );
}
