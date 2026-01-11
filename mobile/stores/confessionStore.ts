import { create } from 'zustand';
import { Itiraf, itiraflarGetir, benDe, saril, itirafAra } from '../services/api';
import { SAYFA_BOYUTU } from '../utils/constants';

interface ItirafState {
  // Veri
  itiraflar: Itiraf[];
  toplam: number;
  istatistikler: {
    toplamItiraf: number;
    toplamBenDe: number;
    benzersizKullanici: number;
  };

  // Filtreler
  kategori: string;
  siralama: 'new' | 'top';

  // Sayfalama
  sayfa: number;
  dahaVar: boolean;

  // Durum
  yukleniyor: boolean;
  yenileniyor: boolean;
  dahaYukleniyor: boolean;
  hata: string | null;

  // Aksiyonlar
  itiraflarYukle: (yenidenYukle?: boolean) => Promise<void>;
  dahaFazlaYukle: () => Promise<void>;
  kategoriDegistir: (kategori: string) => void;
  siralamaDegistir: (siralama: 'new' | 'top') => void;
  benDeYap: (itirafId: string) => Promise<void>;
  sarilYap: (itirafId: string) => Promise<void>;
  ara: (sorgu: string) => Promise<Itiraf[]>;
  temizle: () => void;
}

export const useItirafStore = create<ItirafState>((set, get) => ({
  // Baslangic degerleri
  itiraflar: [],
  toplam: 0,
  istatistikler: {
    toplamItiraf: 0,
    toplamBenDe: 0,
    benzersizKullanici: 0,
  },
  kategori: 'hepsi',
  siralama: 'new',
  sayfa: 0,
  dahaVar: true,
  yukleniyor: false,
  yenileniyor: false,
  dahaYukleniyor: false,
  hata: null,

  // Itirafları yukle
  itiraflarYukle: async (yenidenYukle = false) => {
    const state = get();

    if (yenidenYukle) {
      set({ yenileniyor: true, hata: null });
    } else {
      set({ yukleniyor: true, hata: null });
    }

    try {
      const yanit = await itiraflarGetir({
        limit: SAYFA_BOYUTU,
        offset: 0,
        category: state.kategori !== 'hepsi' ? state.kategori : undefined,
        sort: state.siralama,
      });

      set({
        itiraflar: yanit.truths,
        toplam: yanit.total,
        istatistikler: {
          toplamItiraf: yanit.stats.totalTruths,
          toplamBenDe: yanit.stats.totalMeToo,
          benzersizKullanici: yanit.stats.uniqueUsers,
        },
        sayfa: 1,
        dahaVar: yanit.truths.length >= SAYFA_BOYUTU,
        yukleniyor: false,
        yenileniyor: false,
      });
    } catch (error) {
      set({
        hata: error instanceof Error ? error.message : 'Bir hata oluştu',
        yukleniyor: false,
        yenileniyor: false,
      });
    }
  },

  // Daha fazla yukle (sayfalama)
  dahaFazlaYukle: async () => {
    const state = get();

    if (state.dahaYukleniyor || !state.dahaVar) return;

    set({ dahaYukleniyor: true });

    try {
      const yanit = await itiraflarGetir({
        limit: SAYFA_BOYUTU,
        offset: state.sayfa * SAYFA_BOYUTU,
        category: state.kategori !== 'hepsi' ? state.kategori : undefined,
        sort: state.siralama,
      });

      set({
        itiraflar: [...state.itiraflar, ...yanit.truths],
        sayfa: state.sayfa + 1,
        dahaVar: yanit.truths.length >= SAYFA_BOYUTU,
        dahaYukleniyor: false,
      });
    } catch (error) {
      set({ dahaYukleniyor: false });
    }
  },

  // Kategori degistir
  kategoriDegistir: (kategori: string) => {
    set({ kategori, sayfa: 0, dahaVar: true });
    get().itiraflarYukle();
  },

  // Siralama degistir
  siralamaDegistir: (siralama: 'new' | 'top') => {
    set({ siralama, sayfa: 0, dahaVar: true });
    get().itiraflarYukle();
  },

  // Ben de aksiyonu
  benDeYap: async (itirafId: string) => {
    try {
      const yanit = await benDe(itirafId);

      if (yanit.success && yanit.me_too_count !== undefined) {
        set({
          itiraflar: get().itiraflar.map((itiraf) =>
            itiraf.id === itirafId
              ? { ...itiraf, me_too_count: yanit.me_too_count! }
              : itiraf
          ),
        });
      }
    } catch (error) {
      console.error('Ben de hatasi:', error);
    }
  },

  // Saril aksiyonu
  sarilYap: async (itirafId: string) => {
    try {
      const yanit = await saril(itirafId);

      if (yanit.success && yanit.hug_count !== undefined) {
        set({
          itiraflar: get().itiraflar.map((itiraf) =>
            itiraf.id === itirafId
              ? { ...itiraf, hug_count: yanit.hug_count! }
              : itiraf
          ),
        });
      }
    } catch (error) {
      console.error('Saril hatasi:', error);
    }
  },

  // Arama
  ara: async (sorgu: string) => {
    try {
      const yanit = await itirafAra(sorgu);
      return yanit.truths;
    } catch (error) {
      console.error('Arama hatasi:', error);
      return [];
    }
  },

  // Temizle
  temizle: () => {
    set({
      itiraflar: [],
      toplam: 0,
      sayfa: 0,
      dahaVar: true,
      hata: null,
    });
  },
}));
