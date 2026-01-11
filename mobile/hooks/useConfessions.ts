import { useCallback, useEffect, useState } from 'react';
import { useItirafStore } from '../stores/confessionStore';
import { yorumlariGetir, yorumEkle, trendHashtaglerGetir, Yorum, Hashtag } from '../services/api';

// Ana itiraf hook'u
export const useConfessions = () => {
  const store = useItirafStore();

  // Ilk yukleme
  useEffect(() => {
    if (store.itiraflar.length === 0 && !store.yukleniyor) {
      store.itiraflarYukle();
    }
  }, []);

  return {
    itiraflar: store.itiraflar,
    toplam: store.toplam,
    istatistikler: store.istatistikler,
    kategori: store.kategori,
    siralama: store.siralama,
    yukleniyor: store.yukleniyor,
    yenileniyor: store.yenileniyor,
    dahaYukleniyor: store.dahaYukleniyor,
    dahaVar: store.dahaVar,
    hata: store.hata,
    yenile: () => store.itiraflarYukle(true),
    dahaFazlaYukle: store.dahaFazlaYukle,
    kategoriDegistir: store.kategoriDegistir,
    siralamaDegistir: store.siralamaDegistir,
    benDeYap: store.benDeYap,
    sarilYap: store.sarilYap,
    ara: store.ara,
  };
};

// Yorumlar hook'u
export const useComments = (itirafId: string) => {
  const [yorumlar, setYorumlar] = useState<Yorum[]>([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  // Yorumlari yukle
  const yukle = useCallback(async () => {
    setYukleniyor(true);
    setHata(null);

    try {
      const yanit = await yorumlariGetir(itirafId);
      setYorumlar(yanit.comments);
    } catch (error) {
      setHata(error instanceof Error ? error.message : 'Yorumlar yüklenemedi');
    } finally {
      setYukleniyor(false);
    }
  }, [itirafId]);

  // Yorum gonder
  const gonder = useCallback(
    async (icerik: string) => {
      setGonderiliyor(true);
      setHata(null);

      try {
        const yeniYorum = await yorumEkle(itirafId, icerik);
        setYorumlar((onceki) => [...onceki, yeniYorum]);
        return true;
      } catch (error) {
        setHata(error instanceof Error ? error.message : 'Yorum gönderilemedi');
        return false;
      } finally {
        setGonderiliyor(false);
      }
    },
    [itirafId]
  );

  // Ilk yukleme
  useEffect(() => {
    yukle();
  }, [yukle]);

  return {
    yorumlar,
    yukleniyor,
    gonderiliyor,
    hata,
    yenile: yukle,
    gonder,
  };
};

// Trend hashtagler hook'u
export const useHashtags = () => {
  const [hashtagler, setHashtagler] = useState<Hashtag[]>([]);
  const [yukleniyor, setYukleniyor] = useState(false);

  const yukle = useCallback(async () => {
    setYukleniyor(true);

    try {
      const yanit = await trendHashtaglerGetir(20);
      setHashtagler(yanit.hashtags);
    } catch (error) {
      console.error('Hashtagler yuklenemedi:', error);
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    yukle();
  }, [yukle]);

  return {
    hashtagler,
    yukleniyor,
    yenile: yukle,
  };
};

export default useConfessions;
