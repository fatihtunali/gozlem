'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === 'true';

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {success ? (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-light mb-4">Abonelik Iptal Edildi</h1>
            <p className="text-gray-400 mb-8">
              Haftalik bulten aboneligin basariyla iptal edildi. Artik e-posta almayacaksin.
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-500/20 flex items-center justify-center">
              <span className="text-4xl">📧</span>
            </div>
            <h1 className="text-2xl font-light mb-4">Abonelik Iptali</h1>
            <p className="text-gray-400 mb-8">
              Aboneligini iptal etmek icin e-postana gelen linki kullan.
            </p>
          </>
        )}

        <a
          href="/"
          className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
        >
          Ana Sayfaya Don
        </a>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gray-600 border-t-white rounded-full" />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
