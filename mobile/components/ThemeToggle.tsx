import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

type TemaSecenegi = 'karanlik' | 'aydinlik' | 'sistem';

const TEMA_SECENEKLERI: { id: TemaSecenegi; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'karanlik', label: 'Karanlık', icon: 'moon' },
  { id: 'aydinlik', label: 'Aydınlık', icon: 'sunny' },
  { id: 'sistem', label: 'Sistem', icon: 'phone-portrait' },
];

export const ThemeToggle: React.FC = () => {
  const { tema, renkler, temaDegistir } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.baslik, { color: renkler.metin }]}>Tema</Text>
      <View style={[styles.seceneklerContainer, { backgroundColor: renkler.kart }]}>
        {TEMA_SECENEKLERI.map((secenek) => {
          const seciliMi = tema === secenek.id;

          return (
            <TouchableOpacity
              key={secenek.id}
              onPress={() => temaDegistir(secenek.id)}
              style={[
                styles.secenek,
                {
                  backgroundColor: seciliMi ? renkler.primary : 'transparent',
                },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={secenek.icon}
                size={20}
                color={seciliMi ? '#ffffff' : renkler.metinSoluk}
              />
              <Text
                style={[
                  styles.secenekMetin,
                  { color: seciliMi ? '#ffffff' : renkler.metinSoluk },
                ]}
              >
                {secenek.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  baslik: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  seceneklerContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  secenek: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  secenekMetin: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default ThemeToggle;
