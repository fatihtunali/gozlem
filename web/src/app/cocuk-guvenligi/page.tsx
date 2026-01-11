import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cocuk Guvenligi Standartlari',
  description: 'Haydi Hep Beraber cocuk guvenligi standartlari, CSAM onleme politikalari ve guvenlik uygulamalari',
};

export default function ChildSafetyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 bg-noise opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <a href="/" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8">
          ← Ana Sayfa
        </a>

        <h1 className="text-3xl font-bold mb-8">Cocuk Guvenligi Standartlari</h1>

        <div className="glass-card rounded-2xl p-8 space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Taahhudumuz</h2>
            <p>
              Haydi Hep Beraber olarak, cocuklarin guvenligini en yuksek oncelik olarak kabul ediyoruz.
              Platformumuzda cocuklarin cinsel istismari ve suistimali (CSAE) ile cocuklarin cinsel
              istismari nitelikli materyallere (CSAM) karsi sifir tolerans politikasi uyguluyoruz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Yas Sinirlamasi</h2>
            <p>
              Uygulamamiz 13 yas ve uzeri kullanicilar icin tasarlanmistir. 13 yasin altindaki
              cocuklarin uygulamamizi kullanmasi yasaktir. Yas dogrulamasi icin gerekli onlemleri almaktayiz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Icerik Denetimi</h2>
            <p className="mb-2">Platformumuzda asagidaki icerik denetim mekanizmalari aktiftir:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Otomatik icerik filtreleme sistemleri</li>
              <li>Kullanici bildirimleri uzerine manuel inceleme</li>
              <li>Yasadisi ve zararli iceriklerin aninda kaldirilmasi</li>
              <li>Tekrarlayan ihlallerde hesap askiya alma veya kalici engelleme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Yasaklanan Icerikler</h2>
            <p className="mb-2">Asagidaki icerikler kesinlikle yasaktir ve aninda kaldirilir:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Cocuklarin cinsel istismari nitelikli materyal (CSAM)</li>
              <li>Cocuklara yonelik her turlu istismar icerigi</li>
              <li>Reşit olmayanlarin cinsellestirilmesi</li>
              <li>Cocuklari hedef alan taciz veya zorbalik</li>
              <li>Cocuklarin kisisel bilgilerinin paylasilmasi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Bildirim Mekanizmalari</h2>
            <p className="mb-2">
              Kullanicilarimiz, cocuk guvenligini tehdit eden icerikleri asagidaki yollarla bildirebilir:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Uygulama ici &quot;Bildir&quot; butonu ile aninda bildirim</li>
              <li>E-posta ile bildirim: <a href="mailto:guvenlik@haydihepberaber.com" className="text-purple-400 hover:underline">guvenlik@haydihepberaber.com</a></li>
              <li>Acil durumlar icin: <a href="mailto:fatihtunali@gmail.com" className="text-purple-400 hover:underline">fatihtunali@gmail.com</a></li>
            </ul>
            <p className="mt-2">
              Tum bildirimler 24 saat icinde incelenir ve gerekli islemler baslatilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Yetkililerle Isbirligi</h2>
            <p>
              Cocuklarin cinsel istismari ile ilgili icerikleri tespit ettigimizde veya bildirim
              aldigimizda, ilgili ulusal ve uluslararasi yetkililerle tam isbirligi yapariz:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-400 mt-2">
              <li>Turkiye Cumhuriyeti Emniyet Genel Mudurlugu Siber Suclarla Mucadele Daire Baskanligi</li>
              <li>NCMEC (National Center for Missing & Exploited Children)</li>
              <li>Ilgili bolgesel ve ulusal kolluk kuvvetleri</li>
            </ul>
            <p className="mt-2">
              Yasal zorunluluklara uygun olarak, ilgili verileri yetkili makamlara iletmekteyiz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Egitim ve Farkindalik</h2>
            <p>
              Platformumuzda cocuk guvenligi konusunda farkindalik olusturmak icin duzenli olarak
              bilgilendirme yapmakta ve kullanicilari supleli aktiviteleri bildirmeye tesvik etmekteyiz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Iletisim Bilgileri</h2>
            <p className="mb-2">
              Cocuk guvenligi ile ilgili her turlu soru, oneri veya bildirim icin:
            </p>
            <ul className="list-none space-y-2 text-gray-400">
              <li>
                <strong className="text-white">Guvenlik Ekibi:</strong>{' '}
                <a href="mailto:guvenlik@haydihepberaber.com" className="text-purple-400 hover:underline">
                  guvenlik@haydihepberaber.com
                </a>
              </li>
              <li>
                <strong className="text-white">Genel Iletisim:</strong>{' '}
                <a href="mailto:info@haydihepberaber.com" className="text-purple-400 hover:underline">
                  info@haydihepberaber.com
                </a>
              </li>
              <li>
                <strong className="text-white">Belirlenmis Ilgili Kisi:</strong>{' '}
                <a href="mailto:fatihtunali@gmail.com" className="text-purple-400 hover:underline">
                  fatihtunali@gmail.com
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Politika Guncellemeleri</h2>
            <p>
              Bu cocuk guvenligi standartlari, yasal gereklilikler ve en iyi uygulamalar
              dogrultusunda duzenli olarak guncellenmektedir. Onemli degisiklikler
              kullanicilara bildirilecektir.
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
