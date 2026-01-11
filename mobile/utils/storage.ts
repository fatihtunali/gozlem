import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Anahtarlari
const KEYS = {
  TEMA: '@tema',
  BILDIRIM_TERCIHLERI: '@bildirim_tercihleri',
  KULLANICI_ID: '@kullanici_id',
  PREMIUM_DURUM: '@premium_durum',
  SON_GORULEN_ITIRAF: '@son_gorulen_itiraf',
} as const;

// Tema islemleri
export const temaKaydet = async (tema: 'karanlik' | 'aydinlik' | 'sistem'): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.TEMA, tema);
  } catch (hata) {
    console.error('Tema kaydedilemedi:', hata);
  }
};

export const temaGetir = async (): Promise<'karanlik' | 'aydinlik' | 'sistem'> => {
  try {
    const tema = await AsyncStorage.getItem(KEYS.TEMA);
    return (tema as 'karanlik' | 'aydinlik' | 'sistem') || 'sistem';
  } catch (hata) {
    console.error('Tema alinamadi:', hata);
    return 'sistem';
  }
};

// Bildirim tercihleri
export interface BildirimTercihleri {
  yeniItiraflar: boolean;
  yorumlar: boolean;
  begeniiler: boolean;
}

export const bildirimTercihleriniKaydet = async (tercihler: BildirimTercihleri): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.BILDIRIM_TERCIHLERI, JSON.stringify(tercihler));
  } catch (hata) {
    console.error('Bildirim tercihleri kaydedilemedi:', hata);
  }
};

export const bildirimTercihleriniGetir = async (): Promise<BildirimTercihleri> => {
  try {
    const tercihler = await AsyncStorage.getItem(KEYS.BILDIRIM_TERCIHLERI);
    if (tercihler) {
      return JSON.parse(tercihler);
    }
    return { yeniItiraflar: true, yorumlar: true, begeniiler: true };
  } catch (hata) {
    console.error('Bildirim tercihleri alinamadi:', hata);
    return { yeniItiraflar: true, yorumlar: true, begeniiler: true };
  }
};

// Kullanici ID (anonim)
export const kullaniciIdKaydet = async (id: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.KULLANICI_ID, id);
  } catch (hata) {
    console.error('Kullanici ID kaydedilemedi:', hata);
  }
};

export const kullaniciIdGetir = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(KEYS.KULLANICI_ID);
  } catch (hata) {
    console.error('Kullanici ID alinamadi:', hata);
    return null;
  }
};

// Benzersiz ID olustur
export const benzersizIdOlustur = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Premium durum
export const premiumDurumKaydet = async (premium: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.PREMIUM_DURUM, JSON.stringify(premium));
  } catch (hata) {
    console.error('Premium durum kaydedilemedi:', hata);
  }
};

export const premiumDurumGetir = async (): Promise<boolean> => {
  try {
    const durum = await AsyncStorage.getItem(KEYS.PREMIUM_DURUM);
    return durum ? JSON.parse(durum) : false;
  } catch (hata) {
    console.error('Premium durum alinamadi:', hata);
    return false;
  }
};

// Tum verileri temizle
export const tumVerileriTemizle = async (): Promise<void> => {
  try {
    const anahtarlar = Object.values(KEYS);
    await AsyncStorage.multiRemove(anahtarlar);
  } catch (hata) {
    console.error('Veriler temizlenemedi:', hata);
  }
};
