import { useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';

// Splash ekranini otomatik gizlemeyi engelle
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { hazir } = useAuth();
  const { renkler, karanlikMi } = useTheme();

  // Uygulama hazir oldugunda splash'i gizle
  const onLayoutRootView = useCallback(async () => {
    if (hazir) {
      await SplashScreen.hideAsync();
    }
  }, [hazir]);

  useEffect(() => {
    if (hazir) {
      onLayoutRootView();
    }
  }, [hazir, onLayoutRootView]);

  // Yukleniyor ekrani
  if (!hazir) {
    return (
      <View style={[styles.splashContainer, { backgroundColor: '#0f0f0f' }]}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.baslik}>Haydi Hep Beraber</Text>
        <Text style={styles.altBaslik}>İtiraflarını paylaş</Text>
        <View style={styles.yukleniyorContainer}>
          <View style={[styles.yukleniyorCubuk, { backgroundColor: '#d946ef' }]} />
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <StatusBar style={karanlikMi ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: renkler.arkaplan,
          },
          headerTintColor: renkler.metin,
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: renkler.arkaplan,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="confession/[id]"
          options={{
            title: 'İtiraf',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="premium"
          options={{
            title: 'Premium',
            presentation: 'modal',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#d946ef',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  baslik: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  altBaslik: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 48,
  },
  yukleniyorContainer: {
    width: 120,
    height: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
    overflow: 'hidden',
  },
  yukleniyorCubuk: {
    width: '50%',
    height: '100%',
    borderRadius: 2,
  },
});
