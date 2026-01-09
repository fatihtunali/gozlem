import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gizlilik Politikasi',
  description: 'haydi hep beraber gizlilik politikasi ve cerez kullanimi hakkinda bilgi',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 bg-noise opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <a href="/" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8">
          ← Ana Sayfa
        </a>

        <h1 className="text-3xl font-bold mb-8">Gizlilik Politikasi</h1>

        <div className="glass-card rounded-2xl p-8 space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Genel Bakis</h2>
            <p>
              haydi hep beraber (haydihepberaber.com) olarak gizliliginize onem veriyoruz.
              Bu sayfa, sitemizdeki veri toplama ve kullanim uygulamalarini aciklar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Toplanan Veriler</h2>
            <p className="mb-2">Asagidaki verileri toplayabiliriz:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Anonim itiraf icerikleri</li>
              <li>E-posta adresi (opsiyonel, bildirimler icin)</li>
              <li>Tarayici bilgileri ve IP adresi</li>
              <li>Cerez verileri</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Cerez Kullanimi</h2>
            <p className="mb-2">Sitemiz asagidaki amaclarla cerez kullanir:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li><strong>Zorunlu cerezler:</strong> Site islevseligi icin gerekli</li>
              <li><strong>Analitik cerezler:</strong> Google Analytics ile site kullanim analizi</li>
              <li><strong>Reklam cerezleri:</strong> Google AdSense ile kisisellestirilmis reklamlar</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Google AdSense</h2>
            <p>
              Sitemizde Google AdSense reklamlari gosterilmektedir. Google, reklamlari
              kisisellestirmek icin cerezler kullanabilir. Kisisellestirilmis reklamlari
              reddetmek icin cerez tercihlerinizi "Sadece Gerekli" olarak ayarlayabilirsiniz.
            </p>
            <p className="mt-2">
              Daha fazla bilgi icin:{' '}
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:underline"
              >
                Google Reklam Politikalari
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Veri Guvenligi</h2>
            <p>
              Itiraflar anonim olarak saklanir. Kisisel bilgilerinizi ucuncu taraflarla
              pazarlama amaciyla paylasmiyoruz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Haklariniz</h2>
            <p>KVKK kapsaminda asagidaki haklara sahipsiniz:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400 mt-2">
              <li>Verilerinize erisim talep etme</li>
              <li>Verilerinizin silinmesini isteme</li>
              <li>Cerez tercihlerinizi degistirme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Iletisim</h2>
            <p>
              Sorulariniz icin:{' '}
              <a href="mailto:info@haydihepberaber.com" className="text-purple-400 hover:underline">
                info@haydihepberaber.com
              </a>
            </p>
          </section>

          <div className="pt-4 border-t border-white/10 text-sm text-gray-500">
            Son guncelleme: Ocak 2026
          </div>
        </div>
      </div>
    </div>
  );
}
