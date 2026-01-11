import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { KATEGORILER } from '../utils/constants';

interface CategoryFilterProps {
  seciliKategori: string;
  onKategoriSec: (kategori: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  seciliKategori,
  onKategoriSec,
}) => {
  const { renkler } = useTheme();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {KATEGORILER.map((kategori) => {
          const seciliMi = seciliKategori === kategori.id;

          return (
            <TouchableOpacity
              key={kategori.id}
              onPress={() => onKategoriSec(kategori.id)}
              style={[
                styles.kategoriButon,
                {
                  backgroundColor: seciliMi ? renkler.primary : renkler.kart,
                  borderColor: seciliMi ? renkler.primary : renkler.kenarlık,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text style={styles.kategoriEmoji}>{kategori.icon}</Text>
              <Text
                style={[
                  styles.kategoriMetin,
                  {
                    color: seciliMi ? '#ffffff' : renkler.metinSoluk,
                    fontWeight: seciliMi ? '600' : '400',
                  },
                ]}
              >
                {kategori.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  kategoriButon: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  kategoriEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  kategoriMetin: {
    fontSize: 13,
  },
});

export default CategoryFilter;
