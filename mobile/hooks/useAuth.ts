import { useEffect } from 'react';
import { useKullaniciStore } from '../stores/userStore';

// Kullanici durumu hook'u
export const useAuth = () => {
  const store = useKullaniciStore();

  // Uygulama baslarken baslat
  useEffect(() => {
    if (!store.hazir) {
      store.baslat();
    }
  }, []);

  return {
    hazir: store.hazir,
    kullaniciId: store.kullaniciId,
    premium: store.premium,
    gizliKod: store.gizliKod,
    bildirimTercihleri: store.bildirimTercihleri,
    premiumAyarla: store.premiumAyarla,
    gizliKodAyarla: store.gizliKodAyarla,
    bildirimTercihleriniGuncelle: store.bildirimTercihleriniGuncelle,
  };
};

export default useAuth;
