import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useComments } from '../hooks/useConfessions';
import { YORUM_MAX_KARAKTER } from '../utils/constants';

interface CommentSectionProps {
  itirafId: string;
}

// Zaman formatlama
const zamanFormat = (tarih: string): string => {
  const simdi = new Date();
  const yorumTarih = new Date(tarih);
  const fark = simdi.getTime() - yorumTarih.getTime();

  const dakika = Math.floor(fark / 60000);
  const saat = Math.floor(fark / 3600000);
  const gun = Math.floor(fark / 86400000);

  if (dakika < 1) return 'Az önce';
  if (dakika < 60) return `${dakika} dk`;
  if (saat < 24) return `${saat} saat`;
  if (gun < 7) return `${gun} gün`;

  return yorumTarih.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
  });
};

export const CommentSection: React.FC<CommentSectionProps> = ({ itirafId }) => {
  const { renkler } = useTheme();
  const { yorumlar, yukleniyor, gonderiliyor, hata, gonder, yenile } = useComments(itirafId);
  const [yeniYorum, setYeniYorum] = useState('');

  const handleGonder = async () => {
    if (!yeniYorum.trim() || gonderiliyor) return;

    const basarili = await gonder(yeniYorum.trim());
    if (basarili) {
      setYeniYorum('');
    }
  };

  const renderYorum = ({ item }: { item: { id: string; content: string; created_at: string } }) => (
    <View style={[styles.yorumKart, { backgroundColor: renkler.kart, borderColor: renkler.kenarlık }]}>
      <View style={styles.yorumBaslik}>
        <View style={[styles.avatarContainer, { backgroundColor: renkler.primary + '20' }]}>
          <Ionicons name="person" size={14} color={renkler.primary} />
        </View>
        <Text style={[styles.zamanMetin, { color: renkler.metinCokSoluk }]}>
          {zamanFormat(item.created_at)}
        </Text>
      </View>
      <Text style={[styles.yorumMetin, { color: renkler.metin }]}>{item.content}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Baslik */}
      <View style={styles.baslik}>
        <Text style={[styles.baslikMetin, { color: renkler.metin }]}>
          Yorumlar ({yorumlar.length})
        </Text>
        <TouchableOpacity onPress={yenile} disabled={yukleniyor}>
          <Ionicons
            name="refresh"
            size={20}
            color={yukleniyor ? renkler.metinCokSoluk : renkler.metinSoluk}
          />
        </TouchableOpacity>
      </View>

      {/* Hata */}
      {hata && (
        <View style={[styles.hataContainer, { backgroundColor: renkler.hata + '20' }]}>
          <Text style={[styles.hataMetin, { color: renkler.hata }]}>{hata}</Text>
        </View>
      )}

      {/* Yorum listesi */}
      {yukleniyor ? (
        <View style={styles.yukleniyorContainer}>
          <ActivityIndicator size="small" color={renkler.primary} />
        </View>
      ) : yorumlar.length === 0 ? (
        <View style={styles.bosContainer}>
          <Ionicons name="chatbubble-outline" size={32} color={renkler.metinCokSoluk} />
          <Text style={[styles.bosMetin, { color: renkler.metinSoluk }]}>
            Henüz yorum yok. İlk yorumu sen yaz!
          </Text>
        </View>
      ) : (
        <FlatList
          data={yorumlar}
          keyExtractor={(item) => item.id}
          renderItem={renderYorum}
          scrollEnabled={false}
          contentContainerStyle={styles.yorumListesi}
        />
      )}

      {/* Yorum yazma alani */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.girisContainer}
      >
        <View
          style={[
            styles.girisKutu,
            { backgroundColor: renkler.kart, borderColor: renkler.kenarlık },
          ]}
        >
          <TextInput
            style={[styles.input, { color: renkler.metin }]}
            placeholder="Yorum yaz..."
            placeholderTextColor={renkler.metinCokSoluk}
            value={yeniYorum}
            onChangeText={setYeniYorum}
            maxLength={YORUM_MAX_KARAKTER}
            multiline
          />
          <TouchableOpacity
            onPress={handleGonder}
            disabled={!yeniYorum.trim() || gonderiliyor}
            style={[
              styles.gonderButon,
              {
                backgroundColor:
                  yeniYorum.trim() && !gonderiliyor ? renkler.primary : renkler.kenarlık,
              },
            ]}
          >
            {gonderiliyor ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="send" size={18} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>
        <Text style={[styles.karakterSayisi, { color: renkler.metinCokSoluk }]}>
          {yeniYorum.length}/{YORUM_MAX_KARAKTER}
        </Text>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  baslik: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  baslikMetin: {
    fontSize: 18,
    fontWeight: '600',
  },
  hataContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  hataMetin: {
    fontSize: 14,
    textAlign: 'center',
  },
  yukleniyorContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  bosContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  bosMetin: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  yorumListesi: {
    gap: 12,
  },
  yorumKart: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  yorumBaslik: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  zamanMetin: {
    fontSize: 12,
  },
  yorumMetin: {
    fontSize: 14,
    lineHeight: 20,
  },
  girisContainer: {
    marginTop: 16,
  },
  girisKutu: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    maxHeight: 80,
    paddingVertical: 4,
  },
  gonderButon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  karakterSayisi: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
  },
});

export default CommentSection;
