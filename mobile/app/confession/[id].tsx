import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useItirafStore } from '../../stores/confessionStore';
import { ActionButtons } from '../../components/ActionButtons';
import { CommentSection } from '../../components/CommentSection';
import { Itiraf, itiraflarGetir } from '../../services/api';
import { KATEGORILER } from '../../utils/constants';

// Zaman formatlama
const zamanFormat = (tarih: string): string => {
  const itirafTarih = new Date(tarih);
  return itirafTarih.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Kategori bilgisi getir
const kategoriGetir = (kategoriId: string) => {
  return KATEGORILER.find((k) => k.id === kategoriId) || { id: kategoriId, label: 'Diğer', icon: '✨' };
};

export default function ConfessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { renkler } = useTheme();
  const { itiraflar, benDeYap, sarilYap } = useItirafStore();

  const [itiraf, setItiraf] = useState<Itiraf | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);

  // Itirafi getir
  useEffect(() => {
    const itirafGetir = async () => {
      // Oncelikle store'dan kontrol et
      const storeDan = itiraflar.find((i) => i.id === id);
      if (storeDan) {
        setItiraf(storeDan);
        setYukleniyor(false);
        return;
      }

      // Store'da yoksa API'den getir
      try {
        const yanit = await itiraflarGetir({ limit: 1, offset: 0 });
        const bulunan = yanit.truths.find((i) => i.id === id);
        if (bulunan) {
          setItiraf(bulunan);
        } else {
          setHata('İtiraf bulunamadı');
        }
      } catch (error) {
        setHata(error instanceof Error ? error.message : 'Bir hata oluştu');
      } finally {
        setYukleniyor(false);
      }
    };

    if (id) {
      itirafGetir();
    }
  }, [id, itiraflar]);

  // Store'daki degisiklikleri takip et
  useEffect(() => {
    if (id) {
      const guncel = itiraflar.find((i) => i.id === id);
      if (guncel) {
        setItiraf(guncel);
      }
    }
  }, [itiraflar, id]);

  // Yukleniyor durumu
  if (yukleniyor) {
    return (
      <View style={[styles.container, styles.merkezle, { backgroundColor: renkler.arkaplan }]}>
        <ActivityIndicator size="large" color={renkler.primary} />
      </View>
    );
  }

  // Hata durumu
  if (hata || !itiraf) {
    return (
      <View style={[styles.container, styles.merkezle, { backgroundColor: renkler.arkaplan }]}>
        <Ionicons name="alert-circle" size={48} color={renkler.hata} />
        <Text style={[styles.hataMetin, { color: renkler.hata }]}>
          {hata || 'İtiraf bulunamadı'}
        </Text>
      </View>
    );
  }

  const kategori = kategoriGetir(itiraf.category);

  const handleBenDe = () => {
    benDeYap(itiraf.id);
  };

  const handleSaril = () => {
    sarilYap(itiraf.id);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: renkler.arkaplan }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Itiraf karti */}
      <View style={[styles.itirafKart, { backgroundColor: renkler.kart }]}>
        {/* Ust kisim */}
        <View style={styles.ustKisim}>
          <View style={styles.kategoriContainer}>
            <Text style={styles.kategoriEmoji}>{kategori.icon}</Text>
            <Text style={[styles.kategoriMetin, { color: renkler.metinSoluk }]}>
              {kategori.label}
            </Text>
          </View>

          <View style={styles.rozetlerContainer}>
            {itiraf.is_featured && (
              <View style={[styles.rozetContainer, { backgroundColor: renkler.uyari + '20' }]}>
                <Ionicons name="star" size={14} color={renkler.uyari} />
                <Text style={[styles.rozetMetin, { color: renkler.uyari }]}>Öne Çıkan</Text>
              </View>
            )}
            {itiraf.is_currently_boosted && (
              <View style={[styles.rozetContainer, { backgroundColor: renkler.primary + '20' }]}>
                <Ionicons name="rocket" size={14} color={renkler.primary} />
                <Text style={[styles.rozetMetin, { color: renkler.primary }]}>Öne Çıkarılmış</Text>
              </View>
            )}
          </View>
        </View>

        {/* Icerik */}
        <Text style={[styles.icerik, { color: renkler.metin }]}>
          {itiraf.content}
        </Text>

        {/* Tarih */}
        <Text style={[styles.tarih, { color: renkler.metinCokSoluk }]}>
          {zamanFormat(itiraf.created_at)}
        </Text>
      </View>

      {/* Aksiyon butonlari */}
      <ActionButtons
        itirafId={itiraf.id}
        benDeSayisi={itiraf.me_too_count}
        sarilSayisi={itiraf.hug_count}
        onBenDe={handleBenDe}
        onSaril={handleSaril}
      />

      {/* Hediye sayisi */}
      {itiraf.gift_count > 0 && (
        <View style={[styles.hediyeContainer, { backgroundColor: renkler.kart }]}>
          <Ionicons name="gift" size={20} color={renkler.uyari} />
          <Text style={[styles.hediyeMetin, { color: renkler.metin }]}>
            {itiraf.gift_count} hediye alındı
          </Text>
        </View>
      )}

      {/* Yorumlar */}
      <CommentSection itirafId={itiraf.id} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  merkezle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  hataMetin: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  itirafKart: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  ustKisim: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  kategoriContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kategoriEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  kategoriMetin: {
    fontSize: 14,
    fontWeight: '500',
  },
  rozetlerContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  rozetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  rozetMetin: {
    fontSize: 11,
    fontWeight: '600',
  },
  icerik: {
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 16,
  },
  tarih: {
    fontSize: 12,
  },
  hediyeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  hediyeMetin: {
    fontSize: 14,
    fontWeight: '500',
  },
});
