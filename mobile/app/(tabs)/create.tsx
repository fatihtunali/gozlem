import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { itirafOlustur } from '../../services/api';
import {
  KATEGORILER,
  ITIRAF_MIN_KARAKTER,
  ITIRAF_MAX_KARAKTER_NORMAL,
  ITIRAF_MAX_KARAKTER_PREMIUM,
} from '../../utils/constants';

// Kategori listesi (hepsi haric)
const ITIRAF_KATEGORILERI = KATEGORILER.filter((k) => k.id !== 'hepsi');

export default function CreateScreen() {
  const { renkler } = useTheme();
  const { premium, gizliKodAyarla } = useAuth();

  const [icerik, setIcerik] = useState('');
  const [kategori, setKategori] = useState('itiraf');
  const [email, setEmail] = useState('');
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [basarili, setBasarili] = useState(false);
  const [gizliKod, setGizliKod] = useState<string | null>(null);

  const maxKarakter = premium ? ITIRAF_MAX_KARAKTER_PREMIUM : ITIRAF_MAX_KARAKTER_NORMAL;
  const karakterSayisi = icerik.length;
  const gecerliMi = karakterSayisi >= ITIRAF_MIN_KARAKTER && karakterSayisi <= maxKarakter;

  // Itiraf gonder
  const handleGonder = async () => {
    if (!gecerliMi || gonderiliyor) return;

    // Email kontrolu
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Hata', 'Geçersiz e-posta adresi');
      return;
    }

    setGonderiliyor(true);

    try {
      const sonuc = await itirafOlustur({
        content: icerik.trim(),
        category: kategori,
        email: email.trim() || undefined,
      });

      setGizliKod(sonuc.secret_code);
      gizliKodAyarla(sonuc.secret_code);
      setBasarili(true);
    } catch (error) {
      Alert.alert('Hata', error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setGonderiliyor(false);
    }
  };

  // Yeni itiraf
  const yeniItiraf = () => {
    setIcerik('');
    setKategori('itiraf');
    setEmail('');
    setBasarili(false);
    setGizliKod(null);
  };

  // Basarili ekrani
  if (basarili && gizliKod) {
    return (
      <View style={[styles.container, { backgroundColor: renkler.arkaplan }]}>
        <View style={styles.basariliContainer}>
          <View style={[styles.basariliIkon, { backgroundColor: renkler.basari + '20' }]}>
            <Ionicons name="checkmark-circle" size={64} color={renkler.basari} />
          </View>

          <Text style={[styles.basariliBaslik, { color: renkler.metin }]}>
            İtirafın Gönderildi!
          </Text>

          <Text style={[styles.basariliAciklama, { color: renkler.metinSoluk }]}>
            İtirafın incelendikten sonra yayınlanacak. Aşağıdaki gizli kodunu sakla!
          </Text>

          <View style={[styles.gizliKodContainer, { backgroundColor: renkler.kart, borderColor: renkler.kenarlık }]}>
            <Text style={[styles.gizliKodEtiket, { color: renkler.metinSoluk }]}>
              Gizli Kodun
            </Text>
            <Text style={[styles.gizliKod, { color: renkler.primary }]}>
              {gizliKod}
            </Text>
            <Text style={[styles.gizliKodUyari, { color: renkler.metinCokSoluk }]}>
              Bu kod ile itirafını yönetebilirsin
            </Text>
          </View>

          <TouchableOpacity
            onPress={yeniItiraf}
            style={[styles.yeniItirafButon, { backgroundColor: renkler.primary }]}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.yeniItirafMetin}>Yeni İtiraf Yaz</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: renkler.arkaplan }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Kategori secimi */}
        <View style={styles.bolum}>
          <Text style={[styles.bolumBaslik, { color: renkler.metin }]}>
            Kategori
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.kategoriScrollContent}
          >
            {ITIRAF_KATEGORILERI.map((kat) => {
              const seciliMi = kategori === kat.id;
              return (
                <TouchableOpacity
                  key={kat.id}
                  onPress={() => setKategori(kat.id)}
                  style={[
                    styles.kategoriButon,
                    {
                      backgroundColor: seciliMi ? renkler.primary : renkler.kart,
                      borderColor: seciliMi ? renkler.primary : renkler.kenarlık,
                    },
                  ]}
                >
                  <Text style={styles.kategoriEmoji}>{kat.icon}</Text>
                  <Text
                    style={[
                      styles.kategoriMetin,
                      { color: seciliMi ? '#ffffff' : renkler.metinSoluk },
                    ]}
                  >
                    {kat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Icerik */}
        <View style={styles.bolum}>
          <View style={styles.bolumBaslikContainer}>
            <Text style={[styles.bolumBaslik, { color: renkler.metin }]}>
              İtirafın
            </Text>
            <Text
              style={[
                styles.karakterSayisi,
                {
                  color:
                    karakterSayisi > maxKarakter
                      ? renkler.hata
                      : karakterSayisi >= ITIRAF_MIN_KARAKTER
                      ? renkler.basari
                      : renkler.metinSoluk,
                },
              ]}
            >
              {karakterSayisi}/{maxKarakter}
            </Text>
          </View>

          <TextInput
            style={[
              styles.icerikInput,
              {
                backgroundColor: renkler.kart,
                borderColor: renkler.kenarlık,
                color: renkler.metin,
              },
            ]}
            placeholder="İtirafını buraya yaz..."
            placeholderTextColor={renkler.metinCokSoluk}
            value={icerik}
            onChangeText={setIcerik}
            multiline
            maxLength={maxKarakter + 50} // Biraz fazla bırak uyarı için
            textAlignVertical="top"
          />

          {!premium && (
            <Text style={[styles.premiumIpucu, { color: renkler.metinCokSoluk }]}>
              💎 Premium ile {ITIRAF_MAX_KARAKTER_PREMIUM} karaktere kadar yazabilirsin
            </Text>
          )}
        </View>

        {/* Email (opsiyonel) */}
        <View style={styles.bolum}>
          <Text style={[styles.bolumBaslik, { color: renkler.metin }]}>
            E-posta (opsiyonel)
          </Text>
          <TextInput
            style={[
              styles.emailInput,
              {
                backgroundColor: renkler.kart,
                borderColor: renkler.kenarlık,
                color: renkler.metin,
              },
            ]}
            placeholder="ornek@email.com"
            placeholderTextColor={renkler.metinCokSoluk}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={[styles.emailIpucu, { color: renkler.metinCokSoluk }]}>
            Yorumlardan haberdar olmak için e-posta girebilirsin
          </Text>
        </View>

        {/* Gonder butonu */}
        <TouchableOpacity
          onPress={handleGonder}
          disabled={!gecerliMi || gonderiliyor}
          style={[
            styles.gonderButon,
            {
              backgroundColor: gecerliMi && !gonderiliyor ? renkler.primary : renkler.kenarlık,
            },
          ]}
        >
          {gonderiliyor ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#ffffff" />
              <Text style={styles.gonderMetin}>Gönder</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Kurallar */}
        <View style={[styles.kurallarContainer, { backgroundColor: renkler.kart }]}>
          <Text style={[styles.kurallarBaslik, { color: renkler.metin }]}>
            Kurallar
          </Text>
          <Text style={[styles.kurallarMetin, { color: renkler.metinSoluk }]}>
            • Link, telefon numarası paylaşmak yasaktır{'\n'}
            • Hakaret ve küfür içeren itiraflar yayınlanmaz{'\n'}
            • Kişisel bilgi paylaşmaktan kaçının{'\n'}
            • İtiraflar incelendikten sonra yayınlanır
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  bolum: {
    marginBottom: 24,
  },
  bolumBaslikContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bolumBaslik: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  karakterSayisi: {
    fontSize: 13,
    marginBottom: 12,
  },
  kategoriScrollContent: {
    gap: 8,
  },
  kategoriButon: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  kategoriEmoji: {
    fontSize: 14,
  },
  kategoriMetin: {
    fontSize: 13,
    fontWeight: '500',
  },
  icerikInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 150,
  },
  premiumIpucu: {
    fontSize: 12,
    marginTop: 8,
  },
  emailInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
  },
  emailIpucu: {
    fontSize: 12,
    marginTop: 8,
  },
  gonderButon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  gonderMetin: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  kurallarContainer: {
    padding: 16,
    borderRadius: 12,
  },
  kurallarBaslik: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  kurallarMetin: {
    fontSize: 13,
    lineHeight: 20,
  },
  basariliContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  basariliIkon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  basariliBaslik: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  basariliAciklama: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  gizliKodContainer: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 32,
  },
  gizliKodEtiket: {
    fontSize: 13,
    marginBottom: 8,
  },
  gizliKod: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 8,
  },
  gizliKodUyari: {
    fontSize: 12,
  },
  yeniItirafButon: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  yeniItirafMetin: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
