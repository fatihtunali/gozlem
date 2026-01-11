import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import api from './api';

// Bildirim ayarlari
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Push token al
export async function pushTokenAl(): Promise<string | null> {
  let token: string | null = null;

  // Fiziksel cihaz kontrolu
  if (!Device.isDevice) {
    console.log('Push bildirimler sadece fiziksel cihazlarda calisir');
    return null;
  }

  // Bildirim izni kontrol et
  const { status: mevcutDurum } = await Notifications.getPermissionsAsync();
  let sonDurum = mevcutDurum;

  if (mevcutDurum !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    sonDurum = status;
  }

  if (sonDurum !== 'granted') {
    console.log('Bildirim izni verilmedi');
    return null;
  }

  try {
    // Expo push token al (FCM ile)
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });

    token = tokenData.data;
    console.log('Push token alindi:', token);
  } catch (error) {
    console.error('Push token alinamadi:', error);
  }

  // Android icin kanal olustur
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('varsayilan', {
      name: 'Varsayilan Bildirimler',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B6B',
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
    });

    await Notifications.setNotificationChannelAsync('itiraflar', {
      name: 'Yeni Itiraflar',
      description: 'Yeni itiraflar hakkinda bildirimler',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B6B',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('yorumlar', {
      name: 'Yorum Bildirimleri',
      description: 'Itiraflariniza yapilan yorumlar',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4ECDC4',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('tepkiler', {
      name: 'Tepki Bildirimleri',
      description: 'Ben de ve sarilma bildirimleri',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#FFE66D',
    });
  }

  return token;
}

// Push token'i sunucuya kaydet
export async function pushTokenKaydet(token: string): Promise<void> {
  try {
    await api.post('/api/push/register', {
      token,
      platform: Platform.OS,
      device_name: Device.deviceName || 'Bilinmeyen Cihaz',
    });
    console.log('Push token sunucuya kaydedildi');
  } catch (error) {
    console.error('Push token kaydedilemedi:', error);
  }
}

// Bildirim dinleyicileri
export function bildirimDinleyicileriKur(
  onBildirimAlindi: (notification: Notifications.Notification) => void,
  onBildirimeTiklandi: (response: Notifications.NotificationResponse) => void
) {
  // Bildirim alindinda
  const almaAboneligi = Notifications.addNotificationReceivedListener(onBildirimAlindi);

  // Bildirime tiklandiginda
  const tiklamaAboneligi = Notifications.addNotificationResponseReceivedListener(onBildirimeTiklandi);

  // Temizlik fonksiyonu
  return () => {
    almaAboneligi.remove();
    tiklamaAboneligi.remove();
  };
}

// Yerel bildirim gonder (test icin)
export async function yerelBildirimGonder(
  baslik: string,
  icerik: string,
  veri?: Record<string, unknown>,
  kanal: string = 'varsayilan'
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: baslik,
      body: icerik,
      data: veri || {},
      sound: 'default',
    },
    trigger: null, // Hemen goster
  });
}

// Zamanlanmis bildirim
export async function zamanlanmisBildirimOlustur(
  baslik: string,
  icerik: string,
  saniyeSonra: number,
  veri?: Record<string, unknown>
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: baslik,
      body: icerik,
      data: veri || {},
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: saniyeSonra,
    },
  });
  return id;
}

// Tum zamanlanmis bildirimleri iptal et
export async function tumBildirimleriIptalEt(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Badge sayisini guncelle
export async function badgeSayisiniGuncelle(sayi: number): Promise<void> {
  await Notifications.setBadgeCountAsync(sayi);
}

// Badge sayisini sifirla
export async function badgeSifirla(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}

// Bildirim izni durumunu kontrol et
export async function bildirimIzniKontrol(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

// Bildirim izni iste
export async function bildirimIzniIste(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export default {
  pushTokenAl,
  pushTokenKaydet,
  bildirimDinleyicileriKur,
  yerelBildirimGonder,
  zamanlanmisBildirimOlustur,
  tumBildirimleriIptalEt,
  badgeSayisiniGuncelle,
  badgeSifirla,
  bildirimIzniKontrol,
  bildirimIzniIste,
};
