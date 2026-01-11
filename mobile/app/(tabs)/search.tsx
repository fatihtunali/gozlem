import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useConfessions, useHashtags } from '../../hooks/useConfessions';
import { ConfessionCard } from '../../components/ConfessionCard';
import { Itiraf } from '../../services/api';

export default function SearchScreen() {
  const { renkler } = useTheme();
  const { ara, benDeYap, sarilYap } = useConfessions();
  const { hashtagler, yukleniyor: hashtaglerYukleniyor } = useHashtags();

  const [aramaMetni, setAramaMetni] = useState('');
  const [sonuclar, setSonuclar] = useState<Itiraf[]>([]);
  const [araniyor, setAraniyor] = useState(false);
  const [aramaSonucu, setAramaSonucu] = useState(false);

  // Arama yap
  const aramaYap = useCallback(async () => {
    if (!aramaMetni.trim()) return;

    setAraniyor(true);
    setAramaSonucu(false);

    const sonuc = await ara(aramaMetni.trim());
    setSonuclar(sonuc);
    setAramaSonucu(true);
    setAraniyor(false);
  }, [aramaMetni, ara]);

  // Hashtag ile ara
  const hashtagIleAra = useCallback(
    async (hashtag: string) => {
      setAramaMetni(`#${hashtag}`);
      setAraniyor(true);
      setAramaSonucu(false);

      const sonuc = await ara(`#${hashtag}`);
      setSonuclar(sonuc);
      setAramaSonucu(true);
      setAraniyor(false);
    },
    [ara]
  );

  // Bos durum
  const renderBos = () => {
    if (!aramaSonucu) return null;

    return (
      <View style={styles.bosContainer}>
        <Ionicons name="search" size={48} color={renkler.metinCokSoluk} />
        <Text style={[styles.bosMetin, { color: renkler.metinSoluk }]}>
          "{aramaMetni}" için sonuç bulunamadı
        </Text>
      </View>
    );
  };

  // Trend hashtagler
  const renderTrendler = () => {
    if (aramaSonucu || aramaMetni.trim()) return null;

    return (
      <View style={styles.trendlerContainer}>
        <Text style={[styles.trendBaslik, { color: renkler.metin }]}>
          Trend Konular
        </Text>

        {hashtaglerYukleniyor ? (
          <ActivityIndicator size="small" color={renkler.primary} style={{ marginTop: 16 }} />
        ) : hashtagler.length === 0 ? (
          <Text style={[styles.trendBos, { color: renkler.metinSoluk }]}>
            Henüz trend hashtag yok
          </Text>
        ) : (
          <View style={styles.hashtaglerContainer}>
            {hashtagler.map((hashtag) => (
              <TouchableOpacity
                key={hashtag.tag}
                onPress={() => hashtagIleAra(hashtag.tag)}
                style={[styles.hashtagButon, { backgroundColor: renkler.kart, borderColor: renkler.kenarlık }]}
              >
                <Text style={[styles.hashtagMetin, { color: renkler.primary }]}>
                  #{hashtag.tag}
                </Text>
                <Text style={[styles.hashtagSayi, { color: renkler.metinSoluk }]}>
                  {hashtag.usage_count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: renkler.arkaplan }]}>
      {/* Arama kutusu */}
      <View style={styles.aramaContainer}>
        <View
          style={[
            styles.aramaKutu,
            { backgroundColor: renkler.kart, borderColor: renkler.kenarlık },
          ]}
        >
          <Ionicons name="search" size={20} color={renkler.metinSoluk} />
          <TextInput
            style={[styles.aramaInput, { color: renkler.metin }]}
            placeholder="İtiraf veya #hashtag ara..."
            placeholderTextColor={renkler.metinCokSoluk}
            value={aramaMetni}
            onChangeText={setAramaMetni}
            onSubmitEditing={aramaYap}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {aramaMetni.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setAramaMetni('');
                setSonuclar([]);
                setAramaSonucu(false);
              }}
            >
              <Ionicons name="close-circle" size={20} color={renkler.metinSoluk} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={aramaYap}
          disabled={!aramaMetni.trim() || araniyor}
          style={[
            styles.araButon,
            {
              backgroundColor:
                aramaMetni.trim() && !araniyor ? renkler.primary : renkler.kenarlık,
            },
          ]}
        >
          {araniyor ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.araButonMetin}>Ara</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Sonuclar veya trendler */}
      {aramaSonucu ? (
        <FlatList
          data={sonuclar}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConfessionCard
              itiraf={item}
              onBenDe={benDeYap}
              onSaril={sarilYap}
            />
          )}
          ListEmptyComponent={renderBos}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listeIcerik}
          ListHeaderComponent={
            sonuclar.length > 0 ? (
              <Text style={[styles.sonucSayisi, { color: renkler.metinSoluk }]}>
                {sonuclar.length} sonuç bulundu
              </Text>
            ) : null
          }
        />
      ) : (
        renderTrendler()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  aramaContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  aramaKutu: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  aramaInput: {
    flex: 1,
    fontSize: 15,
  },
  araButon: {
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
  },
  araButonMetin: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  listeIcerik: {
    paddingBottom: 20,
  },
  sonucSayisi: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 13,
  },
  bosContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  bosMetin: {
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  trendlerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  trendBaslik: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  trendBos: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },
  hashtaglerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hashtagButon: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  hashtagMetin: {
    fontSize: 14,
    fontWeight: '500',
  },
  hashtagSayi: {
    fontSize: 12,
  },
});
