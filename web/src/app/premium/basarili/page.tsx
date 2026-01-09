'use client';

import { useEffect, useState } from 'react';
import { Crown, Check, Sparkles, ArrowRight } from 'lucide-react';

export default function PremiumSuccessPage() {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-amber-600/30 rounded-full blur-[100px] animate-blob" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-orange-600/25 rounded-full blur-[100px] animate-blob animation-delay-2000" />
      </div>
      <div className="fixed inset-0 bg-noise opacity-30 pointer-events-none" />

      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-20">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <Sparkles
                className={`w-4 h-4 ${
                  ['text-amber-400', 'text-orange-400', 'text-yellow-400', 'text-pink-400'][Math.floor(Math.random() * 4)]
                }`}
              />
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-lg mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        {/* Success animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center animate-bounce-slow">
            <Crown className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Success message */}
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 animate-fade-in">
          <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Hosgeldin Premium!
          </span>
        </h1>

        <p className="text-gray-400 text-center mb-8 animate-fade-in animation-delay-200">
          Artik tum premium ozelliklerden yararlanabilirsin.
        </p>

        {/* Features unlocked */}
        <div className="glass-card rounded-2xl p-6 w-full mb-8 animate-fade-in animation-delay-400">
          <h2 className="text-lg font-semibold mb-4 text-center">Acilan Ozellikler</h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-400" />
              </div>
              <span>Reklamlar kaldirildi</span>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-400" />
              </div>
              <span>Itiraflarini one cikarabilirsin</span>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-400" />
              </div>
              <span>Premium rozeti aktif</span>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-400" />
              </div>
              <span>1000 karakter itiraf limiti</span>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-400" />
              </div>
              <span>Detayli istatistikler</span>
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <a
            href="/"
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-amber-500/25 transition-all"
          >
            Itiraf Yazl
            <ArrowRight className="w-5 h-5" />
          </a>

          <a
            href="/premium"
            className="flex-1 py-4 bg-white/10 rounded-xl font-medium text-center hover:bg-white/20 transition-colors"
          >
            Premium Detaylari
          </a>
        </div>
      </div>

      {/* Confetti animation styles */}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
