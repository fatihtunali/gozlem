'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const BOOST_OPTIONS = [
  { id: '1_hour', label: '1 Saat', price: 9.99, description: 'Kisa sureli one cikis' },
  { id: '3_hours', label: '3 Saat', price: 19.99, description: 'Ogle ve aksam saatlerinde gorunurluk' },
  { id: '24_hours', label: '24 Saat', price: 49.99, description: 'Tam gun maksimum gorunurluk', popular: true },
];

function BoostPageContent() {
  const searchParams = useSearchParams();
  const truthId = searchParams.get('id');
  const truthContent = searchParams.get('content');

  const [selectedBoost, setSelectedBoost] = useState('24_hours');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpMonth, setCardExpMonth] = useState('');
  const [cardExpYear, setCardExpYear] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formRef = useRef<HTMLFormElement>(null);
  const [formAction, setFormAction] = useState('');
  const [formFields, setFormFields] = useState<Record<string, string>>({});

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
          boostDuration: selectedBoost,
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

  const selectedOption = BOOST_OPTIONS.find(o => o.id === selectedBoost);

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
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-amber-600/15 rounded-full blur-[100px] animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-8">
          <Link href="/" className="text-gray-500 hover:text-white transition-colors mb-4 inline-block">
            &larr; Vazgec
          </Link>
          <h1 className="text-2xl md:text-3xl font-extralight tracking-wide mb-2">
            Itirafini One Cikar
          </h1>
          <p className="text-gray-500 text-sm">Daha fazla kisiye ulas</p>
        </header>

        {/* Truth preview */}
        {truthContent && (
          <div className="glass-card rounded-2xl p-4 mb-6">
            <p className="text-gray-300 text-sm line-clamp-2">{decodeURIComponent(truthContent)}</p>
          </div>
        )}

        {/* Boost options */}
        <div className="space-y-3 mb-8">
          {BOOST_OPTIONS.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedBoost(option.id)}
              className={`w-full p-4 rounded-2xl text-left transition-all ${
                selectedBoost === option.id
                  ? 'bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/50'
                  : 'glass-card hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{option.label}</span>
                    {option.popular && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500 text-black font-medium">
                        Populer
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-amber-400">{option.price.toFixed(2)} TL</div>
                </div>
              </div>
            </button>
          ))}
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
            <label className="block text-sm text-gray-400 mb-2">
              E-posta <span className="text-amber-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 transition-colors"
              required
            />
            <p className="text-xs text-gray-600 mt-1">Odeme bildirimi ve fatura icin gerekli</p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !cardNumber || !cardExpMonth || !cardExpYear || !cardCvv || !cardHolderName || !email}
            className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Yonlendiriliyor...
              </span>
            ) : (
              <span>Odeme Yap - {selectedOption?.price.toFixed(2)} TL</span>
            )}
          </button>

          <p className="text-center text-xs text-gray-600">
            Odemeleriniz Halkbank 3D Secure ile guvence altindadir.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function BoostPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <BoostPageContent />
    </Suspense>
  );
}
