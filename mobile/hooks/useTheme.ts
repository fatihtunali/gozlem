import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import { useKullaniciStore } from '../stores/userStore';

// Tema renkleri
export const temaRenkleri = {
  karanlik: {
    arkaplan: '#0f0f0f',
    kart: '#1a1a1a',
    kartSecili: '#252525',
    kenarlık: '#2a2a2a',
    metin: '#ffffff',
    metinSoluk: '#888888',
    metinCokSoluk: '#555555',
    primary: '#d946ef',
    primaryKoyu: '#a21caf',
    basari: '#22c55e',
    uyari: '#f59e0b',
    hata: '#ef4444',
    benDe: '#3b82f6',
    saril: '#f97316',
    gradientBaslangic: '#1a1a1a',
    gradientBitis: '#0f0f0f',
  },
  aydinlik: {
    arkaplan: '#ffffff',
    kart: '#f5f5f5',
    kartSecili: '#eeeeee',
    kenarlık: '#e0e0e0',
    metin: '#000000',
    metinSoluk: '#666666',
    metinCokSoluk: '#999999',
    primary: '#d946ef',
    primaryKoyu: '#a21caf',
    basari: '#16a34a',
    uyari: '#d97706',
    hata: '#dc2626',
    benDe: '#2563eb',
    saril: '#ea580c',
    gradientBaslangic: '#ffffff',
    gradientBitis: '#f5f5f5',
  },
};

export type TemaRenkleri = typeof temaRenkleri.karanlik;

export const useTheme = () => {
  const sistemRengi = useColorScheme();
  const { tema, gercekTema, gercekTemaBelirle, temaDegistir } = useKullaniciStore();

  // Sistem teması değiştiğinde güncelle
  useEffect(() => {
    gercekTemaBelirle(sistemRengi === 'dark');
  }, [sistemRengi, tema]);

  const karanlikMi = gercekTema === 'karanlik';
  const renkler = karanlikMi ? temaRenkleri.karanlik : temaRenkleri.aydinlik;

  return {
    tema,
    gercekTema,
    karanlikMi,
    renkler,
    temaDegistir,
  };
};

export default useTheme;
