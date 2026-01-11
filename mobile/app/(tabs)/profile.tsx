import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { ThemeToggle } from '../../components/ThemeToggle';

const UYGULAMA_VERSIYONU = '1.0.0';

export default function ProfileScreen() {
  const { renkler } = useTheme();
  const { premium, bildirimTercihleri, bildirimTercihleriniGuncelle } = useAuth();

  // Link ac
  const linkAc = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Hata', 'Link açılamadı');
    });
  };

  // Ayar satirini render et
  const renderAyarSatiri = ({
    icon,
    baslik,
    aciklama,
    onPress,
    sag,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    baslik: string;
    aciklama?: string;
    onPress?: () => void;
    sag?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={[styles.ayarSatiri, { backgroundColor: renkler.kart }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.ayarIkon, { backgroundColor: renkler.primary + '20' }]}>
        <Ionicons name={icon} size={20} color={renkler.primary} />
      </View>
      <View style={styles.ayarIcerik}>
        <Text style={[styles.ayarBaslik, { color: renkler.metin }]}>{baslik}</Text>
        {aciklama && (
          <Text style={[styles.ayarAciklama, { color: renkler.metinSoluk }]}>
            {aciklama}
          </Text>
        )}
      </View>
      {sag || (onPress && <Ionicons name="chevron-forward" size={20} color={renkler.metinSoluk} />)}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: renkler.arkaplan }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Premium durumu */}
      <TouchableOpacity
        style={[
          styles.premiumContainer,
          {
            backgroundColor: premium ? renkler.primary : renkler.kart,
            borderColor: premium ? renkler.primary : renkler.kenarlık,
          },
        ]}
        onPress={() => router.push('/premium')}
        activeOpacity={0.8}
      >
        <View style={styles.premiumIcerik}>
          <View
            style={[
              styles.premiumIkon,
              { backgroundColor: premium ? 'rgba(255,255,255,0.2)' : renkler.uyari + '20' },
            ]}
          >
            <Ionicons
              name="diamond"
              size={28}
              color={premium ? '#ffffff' : renkler.uyari}
            />
          </View>
          <View style={styles.premiumMetinContainer}>
            <Text
              style={[
                styles.premiumBaslik,
                { color: premium ? '#ffffff' : renkler.metin },
              ]}
            >
              {premium ? 'Premium Üye' : 'Premium\'a Geç'}
            </Text>
            <Text
              style={[
                styles.premiumAciklama,
                { color: premium ? 'rgba(255,255,255,0.8)' : renkler.metinSoluk },
              ]}
            >
              {premium
                ? 'Tüm özelliklerin kilidi açıldı'
                : 'Daha fazla karakter, reklamsız deneyim'}
            </Text>
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={premium ? '#ffffff' : renkler.metinSoluk}
        />
      </TouchableOpacity>

      {/* Tema */}
      <View style={styles.bolum}>
        <Text style={[styles.bolumBaslik, { color: renkler.metinSoluk }]}>
          Görünüm
        </Text>
        <View style={[styles.bolumIcerik, { backgroundColor: renkler.kart }]}>
          <ThemeToggle />
        </View>
      </View>

      {/* Bildirimler */}
      <View style={styles.bolum}>
        <Text style={[styles.bolumBaslik, { color: renkler.metinSoluk }]}>
          Bildirimler
        </Text>
        <View style={[styles.bolumIcerik, { backgroundColor: renkler.kart }]}>
          {renderAyarSatiri({
            icon: 'notifications',
            baslik: 'Yeni İtiraflar',
            aciklama: 'Yeni itiraflardan haberdar ol',
            sag: (
              <Switch
                value={bildirimTercihleri.yeniItiraflar}
                onValueChange={(deger) =>
                  bildirimTercihleriniGuncelle({ yeniItiraflar: deger })
                }
                trackColor={{ false: renkler.kenarlık, true: renkler.primary + '60' }}
                thumbColor={
                  bildirimTercihleri.yeniItiraflar ? renkler.primary : renkler.metinSoluk
                }
              />
            ),
          })}
          {renderAyarSatiri({
            icon: 'chatbubble',
            baslik: 'Yorumlar',
            aciklama: 'İtiraflarına yapılan yorumlar',
            sag: (
              <Switch
                value={bildirimTercihleri.yorumlar}
                onValueChange={(deger) =>
                  bildirimTercihleriniGuncelle({ yorumlar: deger })
                }
                trackColor={{ false: renkler.kenarlık, true: renkler.primary + '60' }}
                thumbColor={
                  bildirimTercihleri.yorumlar ? renkler.primary : renkler.metinSoluk
                }
              />
            ),
          })}
          {renderAyarSatiri({
            icon: 'heart',
            baslik: 'Beğeniler',
            aciklama: 'Ben de ve sarılma bildirimleri',
            sag: (
              <Switch
                value={bildirimTercihleri.begeniiler}
                onValueChange={(deger) =>
                  bildirimTercihleriniGuncelle({ begeniiler: deger })
                }
                trackColor={{ false: renkler.kenarlık, true: renkler.primary + '60' }}
                thumbColor={
                  bildirimTercihleri.begeniiler ? renkler.primary : renkler.metinSoluk
                }
              />
            ),
          })}
        </View>
      </View>

      {/* Hakkinda */}
      <View style={styles.bolum}>
        <Text style={[styles.bolumBaslik, { color: renkler.metinSoluk }]}>
          Hakkında
        </Text>
        <View style={[styles.bolumIcerik, { backgroundColor: renkler.kart }]}>
          {renderAyarSatiri({
            icon: 'globe',
            baslik: 'Web Sitesi',
            aciklama: 'haydihepberaber.com',
            onPress: () => linkAc('https://haydihepberaber.com'),
          })}
          {renderAyarSatiri({
            icon: 'shield-checkmark',
            baslik: 'Gizlilik Politikası',
            onPress: () => linkAc('https://haydihepberaber.com/gizlilik'),
          })}
          {renderAyarSatiri({
            icon: 'document-text',
            baslik: 'Kullanım Koşulları',
            onPress: () => linkAc('https://haydihepberaber.com/kullanim-kosullari'),
          })}
          {renderAyarSatiri({
            icon: 'mail',
            baslik: 'İletişim',
            aciklama: 'Geri bildirim gönder',
            onPress: () => linkAc('mailto:iletisim@haydihepberaber.com'),
          })}
        </View>
      </View>

      {/* Versiyon */}
      <View style={styles.versiyonContainer}>
        <Text style={[styles.versiyonMetin, { color: renkler.metinCokSoluk }]}>
          Haydi Hep Beraber v{UYGULAMA_VERSIYONU}
        </Text>
        <Text style={[styles.versiyonMetin, { color: renkler.metinCokSoluk }]}>
          ❤️ ile yapıldı
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  premiumContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  premiumIcerik: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  premiumIkon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumMetinContainer: {
    marginLeft: 12,
    flex: 1,
  },
  premiumBaslik: {
    fontSize: 16,
    fontWeight: '600',
  },
  premiumAciklama: {
    fontSize: 12,
    marginTop: 2,
  },
  bolum: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  bolumBaslik: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bolumIcerik: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  ayarSatiri: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  ayarIkon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ayarIcerik: {
    flex: 1,
    marginLeft: 12,
  },
  ayarBaslik: {
    fontSize: 15,
    fontWeight: '500',
  },
  ayarAciklama: {
    fontSize: 12,
    marginTop: 2,
  },
  versiyonContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 4,
  },
  versiyonMetin: {
    fontSize: 12,
  },
});
