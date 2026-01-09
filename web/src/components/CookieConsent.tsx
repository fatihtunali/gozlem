'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Small delay to not block initial render
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie_consent', 'all');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setShowBanner(false);
    // Enable Google ads personalization
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'ad_storage': 'granted',
        'analytics_storage': 'granted',
        'ad_personalization': 'granted',
        'ad_user_data': 'granted'
      });
    }
  };

  const acceptNecessary = () => {
    localStorage.setItem('cookie_consent', 'necessary');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setShowBanner(false);
    // Disable personalized ads
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'ad_storage': 'denied',
        'analytics_storage': 'granted',
        'ad_personalization': 'denied',
        'ad_user_data': 'denied'
      });
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-fade-in">
      <div className="max-w-4xl mx-auto glass-card rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🍪</span>
              <h3 className="font-semibold text-white">Cerez Kullanimi</h3>
            </div>
            <p className="text-sm text-gray-400">
              Deneyimini iyilestirmek ve reklam gostermek icin cerezler kullaniyoruz.
              "Tumunu Kabul Et" ile kisisellestirilmis reklamlari kabul edersin.{' '}
              <a href="/gizlilik" className="text-purple-400 hover:underline">
                Gizlilik Politikasi
              </a>
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={acceptNecessary}
              className="flex-1 md:flex-none px-4 py-2 text-sm text-gray-400 hover:text-white border border-white/10 rounded-xl hover:border-white/20 transition-all"
            >
              Sadece Gerekli
            </button>
            <button
              onClick={acceptAll}
              className="flex-1 md:flex-none px-6 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              Tumunu Kabul Et
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
