import { create } from 'zustand';
import {
  temaGetir,
  temaKaydet,
  bildirimTercihleriniGetir,
  bildirimTercihleriniKaydet,
  kullaniciIdGetir,
  kullaniciIdKaydet,
  benzersizIdOlustur,
  premiumDurumGetir as premiumDurumStorageGetir,
  premiumDurumKaydet as premiumDurumStorageKaydet,
  BildirimTercihleri,
} from '../utils/storage';

type Tema = 'karanlik' | 'aydinlik' | 'sistem';

interface KullaniciState {
  // Tema
  tema: Tema;
  gercekTema: 'karanlik' | 'aydinlik';

  // Bildirimler
  bildirimTercihleri: BildirimTercihleri;

  // Kullanici
  kullaniciId: string | null;
  premium: boolean;
  gizliKod: string | null;

  // Durum
  hazir: boolean;

  // Aksiyonlar
  baslat: () => Promise<void>;
  temaDegistir: (tema: Tema) => Promise<void>;
  gercekTemaBelirle: (sistemKaranlik: boolean) => void;
  bildirimTercihleriniGuncelle: (tercihler: Partial<BildirimTercihleri>) => Promise<void>;
  premiumAyarla: (premium: boolean) => Promise<void>;
  gizliKodAyarla: (kod: string) => void;
}

export const useKullaniciStore = create<KullaniciState>((set, get) => ({
  // Baslangic degerleri
  tema: 'sistem',
  gercekTema: 'karanlik',
  bildirimTercihleri: {
    yeniItiraflar: true,
    yorumlar: true,
    begeniiler: true,
  },
  kullaniciId: null,
  premium: false,
  gizliKod: null,
  hazir: false,

  // Uygulama baslatildiginda
  baslat: async () => {
    try {
      // Tema yukle
      const kaydedilmisTema = await temaGetir();

      // Bildirim tercihleri yukle
      const tercihler = await bildirimTercihleriniGetir();

      // Kullanici ID yukle veya olustur
      let kullaniciId = await kullaniciIdGetir();
      if (!kullaniciId) {
        kullaniciId = benzersizIdOlustur();
        await kullaniciIdKaydet(kullaniciId);
      }

      // Premium durum yukle
      const premium = await premiumDurumStorageGetir();

      set({
        tema: kaydedilmisTema,
        bildirimTercihleri: tercihler,
        kullaniciId,
        premium,
        hazir: true,
      });
    } catch (error) {
      console.error('Kullanici store baslatma hatasi:', error);
      set({ hazir: true });
    }
  },

  // Tema degistir
  temaDegistir: async (tema: Tema) => {
    await temaKaydet(tema);
    set({ tema });
  },

  // Gercek temayi belirle (sistem temasina gore)
  gercekTemaBelirle: (sistemKaranlik: boolean) => {
    const { tema } = get();
    let gercekTema: 'karanlik' | 'aydinlik';

    if (tema === 'sistem') {
      gercekTema = sistemKaranlik ? 'karanlik' : 'aydinlik';
    } else {
      gercekTema = tema;
    }

    set({ gercekTema });
  },

  // Bildirim tercihlerini guncelle
  bildirimTercihleriniGuncelle: async (yeniTercihler: Partial<BildirimTercihleri>) => {
    const { bildirimTercihleri } = get();
    const guncelTercihler = { ...bildirimTercihleri, ...yeniTercihler };

    await bildirimTercihleriniKaydet(guncelTercihler);
    set({ bildirimTercihleri: guncelTercihler });
  },

  // Premium ayarla
  premiumAyarla: async (premium: boolean) => {
    await premiumDurumStorageKaydet(premium);
    set({ premium });
  },

  // Gizli kod ayarla
  gizliKodAyarla: (gizliKod: string) => {
    set({ gizliKod });
  },
}));
