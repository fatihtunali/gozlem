// API Ayarlari
export const API_BASE_URL = 'https://haydihepberaber.com';

// Kategoriler
export const KATEGORILER = [
  { id: 'hepsi', label: 'Hepsi', icon: '📋' },
  { id: 'ask', label: 'Aşk', icon: '❤️' },
  { id: 'itiraf', label: 'İtiraf', icon: '🤫' },
  { id: 'mutluluk', label: 'Mutluluk', icon: '😊' },
  { id: 'uzuntu', label: 'Üzüntü', icon: '😢' },
  { id: 'ofke', label: 'Öfke', icon: '😠' },
  { id: 'korku', label: 'Korku', icon: '😨' },
  { id: 'hayal', label: 'Hayal', icon: '💭' },
  { id: 'anı', label: 'Anı', icon: '📸' },
  { id: 'diger', label: 'Diğer', icon: '✨' },
] as const;

// Siralama Secenekleri
export const SIRALAMA_SECENEKLERI = [
  { id: 'new' as const, label: 'En Yeni' },
  { id: 'top' as const, label: 'En Popüler' },
];

// Sayfalama
export const SAYFA_BOYUTU = 20;

// Karakter Limitleri
export const ITIRAF_MIN_KARAKTER = 10;
export const ITIRAF_MAX_KARAKTER_NORMAL = 500;
export const ITIRAF_MAX_KARAKTER_PREMIUM = 1000;
export const YORUM_MAX_KARAKTER = 300;

// Animasyon Sureleri (ms)
export const ANIMASYON = {
  HIZLI: 150,
  NORMAL: 300,
  YAVAS: 500,
} as const;

// Renkler
export const RENKLER = {
  PRIMARY: '#d946ef',
  PRIMARY_DARK: '#a21caf',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  BENDE: '#3b82f6',
  SARIL: '#f97316',
} as const;
