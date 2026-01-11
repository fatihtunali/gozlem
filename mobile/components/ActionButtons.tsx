import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface ActionButtonsProps {
  itirafId: string;
  benDeSayisi: number;
  sarilSayisi: number;
  onBenDe: () => void;
  onSaril: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  itirafId,
  benDeSayisi,
  sarilSayisi,
  onBenDe,
  onSaril,
}) => {
  const { renkler } = useTheme();
  const [benDeAnimasyon] = useState(new Animated.Value(1));
  const [sarilAnimasyon] = useState(new Animated.Value(1));

  // Buton animasyonu
  const animasyonuBaslat = (animasyon: Animated.Value, callback: () => void) => {
    Animated.sequence([
      Animated.timing(animasyon, {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(animasyon, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animasyon, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
    callback();
  };

  // Paylas
  const paylas = async () => {
    try {
      await Share.share({
        message: `Haydi Hep Beraber uygulamasında bu itirafa bak!\n\nhttps://haydihepberaber.com/?highlight=${itirafId}`,
      });
    } catch (error) {
      console.error('Paylaşım hatası:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: renkler.kart, borderColor: renkler.kenarlık }]}>
      {/* Ben de */}
      <TouchableOpacity
        onPress={() => animasyonuBaslat(benDeAnimasyon, onBenDe)}
        style={styles.buton}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.butonIcerik,
            { transform: [{ scale: benDeAnimasyon }] },
          ]}
        >
          <View style={[styles.ikonContainer, { backgroundColor: renkler.benDe + '20' }]}>
            <Ionicons name="hand-left" size={24} color={renkler.benDe} />
          </View>
          <Text style={[styles.sayi, { color: renkler.metin }]}>{benDeSayisi}</Text>
          <Text style={[styles.etiket, { color: renkler.metinSoluk }]}>Ben de</Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Ayirici */}
      <View style={[styles.ayirici, { backgroundColor: renkler.kenarlık }]} />

      {/* Saril */}
      <TouchableOpacity
        onPress={() => animasyonuBaslat(sarilAnimasyon, onSaril)}
        style={styles.buton}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.butonIcerik,
            { transform: [{ scale: sarilAnimasyon }] },
          ]}
        >
          <View style={[styles.ikonContainer, { backgroundColor: renkler.saril + '20' }]}>
            <Ionicons name="heart" size={24} color={renkler.saril} />
          </View>
          <Text style={[styles.sayi, { color: renkler.metin }]}>{sarilSayisi}</Text>
          <Text style={[styles.etiket, { color: renkler.metinSoluk }]}>Sarıl</Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Ayirici */}
      <View style={[styles.ayirici, { backgroundColor: renkler.kenarlık }]} />

      {/* Paylas */}
      <TouchableOpacity
        onPress={paylas}
        style={styles.buton}
        activeOpacity={0.7}
      >
        <View style={styles.butonIcerik}>
          <View style={[styles.ikonContainer, { backgroundColor: renkler.primary + '20' }]}>
            <Ionicons name="share-social" size={24} color={renkler.primary} />
          </View>
          <Text style={[styles.etiket, { color: renkler.metinSoluk, marginTop: 8 }]}>
            Paylaş
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
  },
  buton: {
    flex: 1,
    alignItems: 'center',
  },
  butonIcerik: {
    alignItems: 'center',
  },
  ikonContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sayi: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  etiket: {
    fontSize: 12,
    marginTop: 2,
  },
  ayirici: {
    width: 1,
    height: '80%',
    alignSelf: 'center',
  },
});

export default ActionButtons;
