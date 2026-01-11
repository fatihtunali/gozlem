import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useConfessions } from '../../hooks/useConfessions';
import { ConfessionCard } from '../../components/ConfessionCard';
import { CategoryFilter } from '../../components/CategoryFilter';
import { SIRALAMA_SECENEKLERI } from '../../utils/constants';

export default function HomeScreen() {
  const { renkler } = useTheme();
  const {
    itiraflar,
    istatistikler,
    kategori,
    siralama,
    yukleniyor,
    yenileniyor,
    dahaYukleniyor,
    dahaVar,
    hata,
    yenile,
    dahaFazlaYukle,
    kategoriDegistir,
    siralamaDegistir,
    benDeYap,
    sarilYap,
  } = useConfessions();

  // Liste bos durumu
  const renderBos = () => (
    <View style={styles.bosContainer}>
      <Ionicons name="document-text-outline" size={48} color={renkler.metinCokSoluk} />
      <Text style={[styles.bosMetin, { color: renkler.metinSoluk }]}>
        Henüz itiraf yok
      </Text>
    </View>
  );

  // Yukleniyor durumu
  const renderYukleniyor = () => (
    <View style={styles.yukleniyorContainer}>
      <ActivityIndicator size="large" color={renkler.primary} />
    </View>
  );

  // Hata durumu
  const renderHata = () => (
    <View style={styles.hataContainer}>
      <Ionicons name="alert-circle" size={48} color={renkler.hata} />
      <Text style={[styles.hataMetin, { color: renkler.hata }]}>{hata}</Text>
      <TouchableOpacity
        onPress={yenile}
        style={[styles.tekrarDeneButon, { backgroundColor: renkler.primary }]}
      >
        <Text style={styles.tekrarDeneMetin}>Tekrar Dene</Text>
      </TouchableOpacity>
    </View>
  );

  // Daha fazla yukleniyor
  const renderFooter = () => {
    if (!dahaYukleniyor) return null;
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color={renkler.primary} />
      </View>
    );
  };

  // Liste baslik
  const renderHeader = useCallback(() => (
    <View>
      {/* Istatistikler */}
      <View style={[styles.istatistiklerContainer, { backgroundColor: renkler.kart }]}>
        <View style={styles.istatistik}>
          <Text style={[styles.istatistikSayi, { color: renkler.primary }]}>
            {istatistikler.toplamItiraf.toLocaleString('tr-TR')}
          </Text>
          <Text style={[styles.istatistikEtiket, { color: renkler.metinSoluk }]}>
            İtiraf
          </Text>
        </View>
        <View style={[styles.istatistikAyirici, { backgroundColor: renkler.kenarlık }]} />
        <View style={styles.istatistik}>
          <Text style={[styles.istatistikSayi, { color: renkler.benDe }]}>
            {istatistikler.toplamBenDe.toLocaleString('tr-TR')}
          </Text>
          <Text style={[styles.istatistikEtiket, { color: renkler.metinSoluk }]}>
            Ben De
          </Text>
        </View>
        <View style={[styles.istatistikAyirici, { backgroundColor: renkler.kenarlık }]} />
        <View style={styles.istatistik}>
          <Text style={[styles.istatistikSayi, { color: renkler.saril }]}>
            {istatistikler.benzersizKullanici.toLocaleString('tr-TR')}
          </Text>
          <Text style={[styles.istatistikEtiket, { color: renkler.metinSoluk }]}>
            Kullanıcı
          </Text>
        </View>
      </View>

      {/* Kategori filtreleme */}
      <CategoryFilter
        seciliKategori={kategori}
        onKategoriSec={kategoriDegistir}
      />

      {/* Siralama */}
      <View style={styles.siralamContainer}>
        {SIRALAMA_SECENEKLERI.map((secenek) => (
          <TouchableOpacity
            key={secenek.id}
            onPress={() => siralamaDegistir(secenek.id)}
            style={[
              styles.siralamaButon,
              {
                backgroundColor:
                  siralama === secenek.id ? renkler.primary + '20' : 'transparent',
                borderColor:
                  siralama === secenek.id ? renkler.primary : renkler.kenarlık,
              },
            ]}
          >
            <Text
              style={[
                styles.siralamaMetin,
                {
                  color:
                    siralama === secenek.id ? renkler.primary : renkler.metinSoluk,
                },
              ]}
            >
              {secenek.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  ), [kategori, siralama, istatistikler, renkler]);

  // Ana icerik
  if (yukleniyor && itiraflar.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: renkler.arkaplan }]}>
        {renderHeader()}
        {renderYukleniyor()}
      </View>
    );
  }

  if (hata && itiraflar.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: renkler.arkaplan }]}>
        {renderHeader()}
        {renderHata()}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: renkler.arkaplan }]}>
      <FlatList
        data={itiraflar}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConfessionCard
            itiraf={item}
            onBenDe={benDeYap}
            onSaril={sarilYap}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderBos}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={yenileniyor}
            onRefresh={yenile}
            tintColor={renkler.primary}
            colors={[renkler.primary]}
          />
        }
        onEndReached={dahaVar ? dahaFazlaYukle : undefined}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listeIcerik}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listeIcerik: {
    paddingBottom: 20,
  },
  istatistiklerContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    paddingVertical: 16,
  },
  istatistik: {
    flex: 1,
    alignItems: 'center',
  },
  istatistikSayi: {
    fontSize: 20,
    fontWeight: '700',
  },
  istatistikEtiket: {
    fontSize: 12,
    marginTop: 4,
  },
  istatistikAyirici: {
    width: 1,
    height: '100%',
  },
  siralamContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  siralamaButon: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  siralamaMetin: {
    fontSize: 13,
    fontWeight: '500',
  },
  bosContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  bosMetin: {
    fontSize: 16,
    marginTop: 16,
  },
  yukleniyorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  hataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  hataMetin: {
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  tekrarDeneButon: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  tekrarDeneMetin: {
    color: '#ffffff',
    fontWeight: '600',
  },
  footerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
