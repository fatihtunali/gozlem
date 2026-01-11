import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Itiraf } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import { KATEGORILER } from '../utils/constants';

interface ConfessionCardProps {
  itiraf: Itiraf;
  onBenDe: (id: string) => void;
  onSaril: (id: string) => void;
}

// Zaman formatlama
const zamanFormat = (tarih: string): string => {
  const simdi = new Date();
  const itirafTarih = new Date(tarih);
  const fark = simdi.getTime() - itirafTarih.getTime();

  const dakika = Math.floor(fark / 60000);
  const saat = Math.floor(fark / 3600000);
  const gun = Math.floor(fark / 86400000);

  if (dakika < 1) return 'Az önce';
  if (dakika < 60) return `${dakika} dk`;
  if (saat < 24) return `${saat} saat`;
  if (gun < 7) return `${gun} gün`;

  return itirafTarih.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
  });
};

// Kategori emojisi getir
const kategoriEmoji = (kategori: string): string => {
  const bulunan = KATEGORILER.find((k) => k.id === kategori);
  return bulunan?.icon || '✨';
};

export const ConfessionCard: React.FC<ConfessionCardProps> = ({
  itiraf,
  onBenDe,
  onSaril,
}) => {
  const { renkler, karanlikMi } = useTheme();
  const [benDeAnimasyon] = useState(new Animated.Value(1));
  const [sarilAnimasyon] = useState(new Animated.Value(1));

  // Buton animasyonu
  const butonAnimasyonuBaslat = (animasyon: Animated.Value) => {
    Animated.sequence([
      Animated.timing(animasyon, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animasyon, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleBenDe = () => {
    butonAnimasyonuBaslat(benDeAnimasyon);
    onBenDe(itiraf.id);
  };

  const handleSaril = () => {
    butonAnimasyonuBaslat(sarilAnimasyon);
    onSaril(itiraf.id);
  };

  const handleDetay = () => {
    router.push(`/confession/${itiraf.id}`);
  };

  return (
    <Pressable
      onPress={handleDetay}
      style={[
        styles.kart,
        {
          backgroundColor: renkler.kart,
          borderColor: itiraf.is_currently_boosted ? renkler.primary : renkler.kenarlık,
          borderWidth: itiraf.is_currently_boosted ? 2 : 1,
        },
      ]}
    >
      {/* Ust kisim - Kategori ve zaman */}
      <View style={styles.ustKisim}>
        <View style={styles.kategoriContainer}>
          <Text style={styles.kategoriEmoji}>{kategoriEmoji(itiraf.category)}</Text>
          <Text style={[styles.kategoriMetin, { color: renkler.metinSoluk }]}>
            {KATEGORILER.find((k) => k.id === itiraf.category)?.label || 'Diğer'}
          </Text>
        </View>

        <View style={styles.zamanContainer}>
          {itiraf.is_featured && (
            <View style={[styles.rozetContainer, { backgroundColor: renkler.uyari + '20' }]}>
              <Ionicons name="star" size={12} color={renkler.uyari} />
            </View>
          )}
          {itiraf.is_currently_boosted && (
            <View style={[styles.rozetContainer, { backgroundColor: renkler.primary + '20' }]}>
              <Ionicons name="rocket" size={12} color={renkler.primary} />
            </View>
          )}
          <Text style={[styles.zamanMetin, { color: renkler.metinCokSoluk }]}>
            {zamanFormat(itiraf.created_at)}
          </Text>
        </View>
      </View>

      {/* Icerik */}
      <Text
        style={[styles.icerik, { color: renkler.metin }]}
        numberOfLines={6}
      >
        {itiraf.content}
      </Text>

      {/* Alt kisim - Aksiyonlar */}
      <View style={styles.altKisim}>
        {/* Ben de butonu */}
        <TouchableOpacity
          onPress={handleBenDe}
          style={styles.aksiyonButon}
          activeOpacity={0.7}
        >
          <Animated.View
            style={[
              styles.aksiyonIcerik,
              { transform: [{ scale: benDeAnimasyon }] },
            ]}
          >
            <Ionicons name="hand-left" size={18} color={renkler.benDe} />
            <Text style={[styles.aksiyonSayi, { color: renkler.benDe }]}>
              {itiraf.me_too_count}
            </Text>
            <Text style={[styles.aksiyonMetin, { color: renkler.metinSoluk }]}>
              Ben de
            </Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Saril butonu */}
        <TouchableOpacity
          onPress={handleSaril}
          style={styles.aksiyonButon}
          activeOpacity={0.7}
        >
          <Animated.View
            style={[
              styles.aksiyonIcerik,
              { transform: [{ scale: sarilAnimasyon }] },
            ]}
          >
            <Ionicons name="heart" size={18} color={renkler.saril} />
            <Text style={[styles.aksiyonSayi, { color: renkler.saril }]}>
              {itiraf.hug_count}
            </Text>
            <Text style={[styles.aksiyonMetin, { color: renkler.metinSoluk }]}>
              Sarıl
            </Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Yorum butonu */}
        <TouchableOpacity
          onPress={handleDetay}
          style={styles.aksiyonButon}
          activeOpacity={0.7}
        >
          <View style={styles.aksiyonIcerik}>
            <Ionicons name="chatbubble-outline" size={18} color={renkler.metinSoluk} />
            <Text style={[styles.aksiyonMetin, { color: renkler.metinSoluk, marginLeft: 4 }]}>
              Yorumlar
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  kart: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
  },
  ustKisim: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  kategoriContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kategoriEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  kategoriMetin: {
    fontSize: 13,
    fontWeight: '500',
  },
  zamanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rozetContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zamanMetin: {
    fontSize: 12,
  },
  icerik: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  altKisim: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  aksiyonButon: {
    flex: 1,
    alignItems: 'center',
  },
  aksiyonIcerik: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aksiyonSayi: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    marginRight: 4,
  },
  aksiyonMetin: {
    fontSize: 12,
  },
});

export default ConfessionCard;
