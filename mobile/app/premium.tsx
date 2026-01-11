import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';

const PREMIUM_OZELLIKLERI = [
  {
    icon: 'document-text' as const,
    baslik: '1000 Karakter',
    aciklama: 'Daha uzun itiraflar yazabilirsin',
  },
  {
    icon: 'rocket' as const,
    baslik: 'Öne Çıkarma',
    aciklama: 'İtiraflarını öne çıkar',
  },
  {
    icon: 'ban' as const,
    baslik: 'Reklamsız',
    aciklama: 'Hiç reklam görmeden kullan',
  },
  {
    icon: 'gift' as const,
    baslik: 'Hediye Gönder',
    aciklama: 'İtiraflara hediye gönderebilirsin',
  },
  {
    icon: 'star' as const,
    baslik: 'Premium Rozet',
    aciklama: 'Profilinde özel rozet',
  },
  {
    icon: 'color-palette' as const,
    baslik: 'Özel Temalar',
    aciklama: 'Yakında gelecek özel temalar',
  },
];

const PLANLAR = [
  {
    id: 'aylik',
    baslik: 'Aylık',
    fiyat: '29.99',
    periyot: 'ay',
    aciklama: 'Her ay otomatik yenilenir',
    indirim: null,
  },
  {
    id: 'yillik',
    baslik: 'Yıllık',
    fiyat: '199.99',
    periyot: 'yıl',
    aciklama: '2 ay bedava, %45 indirim',
    indirim: '45%',
    onerilen: true,
  },
];

export default function PremiumScreen() {
  const { renkler } = useTheme();
  const { premium } = useAuth();
  const [seciliPlan, setSeciliPlan] = useState('yillik');

  // Satin al
  const satinAl = () => {
    // Web sitesine yonlendir
    const plan = PLANLAR.find((p) => p.id === seciliPlan);
    if (plan) {
      Linking.openURL(`https://haydihepberaber.com/premium?plan=${seciliPlan}`).catch(() => {
        Alert.alert('Hata', 'Sayfa açılamadı. Lütfen web sitesinden devam edin.');
      });
    }
  };

  // Zaten premium ise
  if (premium) {
    return (
      <View style={[styles.container, { backgroundColor: renkler.arkaplan }]}>
        <View style={styles.premiumAktifContainer}>
          <View style={[styles.premiumAktifIkon, { backgroundColor: renkler.primary + '20' }]}>
            <Ionicons name="diamond" size={64} color={renkler.primary} />
          </View>
          <Text style={[styles.premiumAktifBaslik, { color: renkler.metin }]}>
            Premium Üyesin!
          </Text>
          <Text style={[styles.premiumAktifAciklama, { color: renkler.metinSoluk }]}>
            Tüm premium özelliklerin kilidi açıldı. Keyifli kullanımlar!
          </Text>

          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.geriButon, { backgroundColor: renkler.primary }]}
          >
            <Text style={styles.geriButonMetin}>Ana Sayfaya Dön</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: renkler.arkaplan }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Baslik */}
      <View style={styles.baslikContainer}>
        <View style={[styles.baslikIkon, { backgroundColor: renkler.primary + '20' }]}>
          <Ionicons name="diamond" size={48} color={renkler.primary} />
        </View>
        <Text style={[styles.baslikMetin, { color: renkler.metin }]}>
          Premium'a Geç
        </Text>
        <Text style={[styles.baslikAciklama, { color: renkler.metinSoluk }]}>
          Tüm özelliklerin kilidini aç
        </Text>
      </View>

      {/* Ozellikler */}
      <View style={styles.ozelliklerContainer}>
        {PREMIUM_OZELLIKLERI.map((ozellik, index) => (
          <View
            key={index}
            style={[styles.ozellikSatiri, { backgroundColor: renkler.kart }]}
          >
            <View style={[styles.ozellikIkon, { backgroundColor: renkler.primary + '20' }]}>
              <Ionicons name={ozellik.icon} size={20} color={renkler.primary} />
            </View>
            <View style={styles.ozellikMetinContainer}>
              <Text style={[styles.ozellikBaslik, { color: renkler.metin }]}>
                {ozellik.baslik}
              </Text>
              <Text style={[styles.ozellikAciklama, { color: renkler.metinSoluk }]}>
                {ozellik.aciklama}
              </Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color={renkler.basari} />
          </View>
        ))}
      </View>

      {/* Plan secimi */}
      <View style={styles.planlarContainer}>
        <Text style={[styles.planlarBaslik, { color: renkler.metin }]}>
          Plan Seç
        </Text>

        {PLANLAR.map((plan) => {
          const seciliMi = seciliPlan === plan.id;
          return (
            <TouchableOpacity
              key={plan.id}
              onPress={() => setSeciliPlan(plan.id)}
              style={[
                styles.planKart,
                {
                  backgroundColor: renkler.kart,
                  borderColor: seciliMi ? renkler.primary : renkler.kenarlık,
                  borderWidth: seciliMi ? 2 : 1,
                },
              ]}
              activeOpacity={0.8}
            >
              {plan.onerilen && (
                <View style={[styles.onerilenRozet, { backgroundColor: renkler.primary }]}>
                  <Text style={styles.onerilenMetin}>ÖNERİLEN</Text>
                </View>
              )}

              <View style={styles.planUstKisim}>
                <View style={styles.planBaslikContainer}>
                  <Text style={[styles.planBaslik, { color: renkler.metin }]}>
                    {plan.baslik}
                  </Text>
                  {plan.indirim && (
                    <View style={[styles.indirimRozet, { backgroundColor: renkler.basari + '20' }]}>
                      <Text style={[styles.indirimMetin, { color: renkler.basari }]}>
                        {plan.indirim} İndirim
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.planFiyatContainer}>
                  <Text style={[styles.planFiyat, { color: renkler.primary }]}>
                    ₺{plan.fiyat}
                  </Text>
                  <Text style={[styles.planPeriyot, { color: renkler.metinSoluk }]}>
                    /{plan.periyot}
                  </Text>
                </View>
              </View>

              <Text style={[styles.planAciklama, { color: renkler.metinSoluk }]}>
                {plan.aciklama}
              </Text>

              {/* Secim gostergesi */}
              <View
                style={[
                  styles.secimGostergesi,
                  {
                    borderColor: seciliMi ? renkler.primary : renkler.kenarlık,
                    backgroundColor: seciliMi ? renkler.primary : 'transparent',
                  },
                ]}
              >
                {seciliMi && <Ionicons name="checkmark" size={16} color="#ffffff" />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Satin al butonu */}
      <TouchableOpacity
        onPress={satinAl}
        style={[styles.satinAlButon, { backgroundColor: renkler.primary }]}
        activeOpacity={0.8}
      >
        <Text style={styles.satinAlMetin}>Premium'a Geç</Text>
      </TouchableOpacity>

      {/* Bilgi */}
      <Text style={[styles.bilgiMetin, { color: renkler.metinCokSoluk }]}>
        Aboneliğinizi istediğiniz zaman iptal edebilirsiniz.{'\n'}
        Ödeme web sitesi üzerinden güvenle yapılır.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  baslikContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  baslikIkon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  baslikMetin: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  baslikAciklama: {
    fontSize: 15,
  },
  ozelliklerContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  ozellikSatiri: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
  },
  ozellikIkon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ozellikMetinContainer: {
    flex: 1,
    marginLeft: 12,
  },
  ozellikBaslik: {
    fontSize: 15,
    fontWeight: '600',
  },
  ozellikAciklama: {
    fontSize: 12,
    marginTop: 2,
  },
  planlarContainer: {
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  planlarBaslik: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  planKart: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  onerilenRozet: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
  },
  onerilenMetin: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  planUstKisim: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  planBaslikContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planBaslik: {
    fontSize: 18,
    fontWeight: '600',
  },
  indirimRozet: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  indirimMetin: {
    fontSize: 11,
    fontWeight: '600',
  },
  planFiyatContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planFiyat: {
    fontSize: 24,
    fontWeight: '700',
  },
  planPeriyot: {
    fontSize: 14,
  },
  planAciklama: {
    fontSize: 13,
  },
  secimGostergesi: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  satinAlButon: {
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  satinAlMetin: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  bilgiMetin: {
    textAlign: 'center',
    fontSize: 12,
    paddingHorizontal: 32,
    paddingVertical: 24,
    lineHeight: 18,
  },
  premiumAktifContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  premiumAktifIkon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  premiumAktifBaslik: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  premiumAktifAciklama: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
  },
  geriButon: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  geriButonMetin: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
