import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL } from '../utils/constants';

// API istemcisi
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hata yonetimi
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const data = error.response.data as { error?: string };
      throw new Error(data.error || 'Bir hata oluştu');
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Bağlantı zaman aşımına uğradı');
    }
    throw new Error('Bağlantı hatası');
  }
);

// ==================== Tipler ====================

export interface Itiraf {
  id: string;
  content: string;
  category: string;
  me_too_count: number;
  hug_count: number;
  gift_count: number;
  created_at: string;
  is_featured: boolean;
  is_boosted: boolean;
  is_currently_boosted: boolean;
  boost_ends_at: string | null;
}

export interface ItirafListesiYaniti {
  truths: Itiraf[];
  total: number;
  stats: {
    totalTruths: number;
    totalMeToo: number;
    uniqueUsers: number;
  };
  limit: number;
  offset: number;
  hashtag: string | null;
}

export interface YeniItiraf {
  content: string;
  category: string;
  email?: string;
}

export interface OlusturulanItiraf {
  id: string;
  content: string;
  category: string;
  me_too_count: number;
  created_at: string;
  secret_code: string;
}

export interface Yorum {
  id: string;
  content: string;
  created_at: string;
}

export interface YorumListesiYaniti {
  comments: Yorum[];
}

export interface Hashtag {
  tag: string;
  usage_count: number;
}

export interface HashtagListesiYaniti {
  hashtags: Hashtag[];
}

export interface AksiyonYaniti {
  success: boolean;
  me_too_count?: number;
  hug_count?: number;
}

// ==================== Itiraf API ====================

// Itiraf listesi getir
export const itiraflarGetir = async (params: {
  limit?: number;
  offset?: number;
  category?: string;
  sort?: 'new' | 'top';
  featured?: boolean;
  random?: boolean;
  hashtag?: string;
}): Promise<ItirafListesiYaniti> => {
  const queryParams = new URLSearchParams();

  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());
  if (params.category && params.category !== 'hepsi') queryParams.append('category', params.category);
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.featured) queryParams.append('featured', 'true');
  if (params.random) queryParams.append('random', 'true');
  if (params.hashtag) queryParams.append('hashtag', params.hashtag);

  const response = await api.get<ItirafListesiYaniti>(`/api/truths?${queryParams.toString()}`);
  return response.data;
};

// Yeni itiraf olustur
export const itirafOlustur = async (itiraf: YeniItiraf): Promise<OlusturulanItiraf> => {
  const response = await api.post<OlusturulanItiraf>('/api/truths', itiraf);
  return response.data;
};

// Itiraf ara
export const itirafAra = async (query: string): Promise<ItirafListesiYaniti> => {
  const response = await api.get<ItirafListesiYaniti>(`/api/truths/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

// ==================== Aksiyon API ====================

// Ben de
export const benDe = async (itirafId: string): Promise<AksiyonYaniti> => {
  const response = await api.post<AksiyonYaniti>(`/api/truths/${itirafId}/me-too`);
  return response.data;
};

// Saril
export const saril = async (itirafId: string): Promise<AksiyonYaniti> => {
  const response = await api.post<AksiyonYaniti>(`/api/truths/${itirafId}/hug`);
  return response.data;
};

// ==================== Yorum API ====================

// Yorumlari getir
export const yorumlariGetir = async (itirafId: string): Promise<YorumListesiYaniti> => {
  const response = await api.get<YorumListesiYaniti>(`/api/truths/${itirafId}/comments`);
  return response.data;
};

// Yorum ekle
export const yorumEkle = async (itirafId: string, content: string): Promise<Yorum> => {
  const response = await api.post<Yorum>(`/api/truths/${itirafId}/comments`, { content });
  return response.data;
};

// ==================== Hashtag API ====================

// Trend hashtagler
export const trendHashtaglerGetir = async (limit?: number): Promise<HashtagListesiYaniti> => {
  const queryParams = limit ? `?limit=${limit}` : '';
  const response = await api.get<HashtagListesiYaniti>(`/api/hashtags${queryParams}`);
  return response.data;
};

// ==================== Premium API ====================

export interface PremiumDurum {
  is_premium: boolean;
  expires_at: string | null;
  plan: string | null;
}

export const premiumDurumGetir = async (secretCode: string): Promise<PremiumDurum> => {
  const response = await api.get<PremiumDurum>(`/api/premium?code=${secretCode}`);
  return response.data;
};

// ==================== Push Bildirim API ====================

export interface PushKayit {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const pushKaydet = async (subscription: PushKayit): Promise<void> => {
  await api.post('/api/push/subscribe', subscription);
};

export default api;
