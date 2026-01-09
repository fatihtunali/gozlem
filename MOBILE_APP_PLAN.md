# Haydi Hep Beraber - Mobil Uygulama Plani

## Teknoloji Stack
- **Framework:** React Native + Expo
- **Dil:** TypeScript
- **State Management:** Zustand
- **Navigation:** Expo Router
- **UI:** NativeWind (Tailwind for React Native)
- **HTTP Client:** Axios
- **Push Notifications:** Expo Notifications

## Uygulama Yapisi

```
mobile/
├── app/                    # Expo Router sayfalar
│   ├── (tabs)/
│   │   ├── index.tsx      # Ana sayfa - itiraf listesi
│   │   ├── search.tsx     # Arama
│   │   ├── create.tsx     # Yeni itiraf
│   │   └── profile.tsx    # Profil/Ayarlar
│   ├── confession/
│   │   └── [id].tsx       # Itiraf detay
│   ├── premium.tsx        # Premium uyelik
│   └── _layout.tsx        # Root layout
├── components/
│   ├── ConfessionCard.tsx
│   ├── CategoryFilter.tsx
│   ├── CommentSection.tsx
│   ├── ActionButtons.tsx
│   └── ThemeToggle.tsx
├── hooks/
│   ├── useConfessions.ts
│   ├── useAuth.ts
│   └── useTheme.ts
├── services/
│   ├── api.ts             # API client
│   └── notifications.ts   # Push notifications
├── stores/
│   ├── confessionStore.ts
│   └── userStore.ts
└── utils/
    ├── storage.ts         # AsyncStorage helpers
    └── constants.ts
```

## Ekranlar

### 1. Ana Sayfa (Home)
- Itiraf listesi (infinite scroll)
- Kategori filtreleme (yatay scroll)
- Siralama (Yeni/Populer)
- Pull-to-refresh
- "Ben de" ve "Saril" butonlari

### 2. Itiraf Detay
- Tam itiraf metni
- Yorumlar listesi
- Yorum yazma
- Paylasim secenekleri
- Hediye gonderme

### 3. Yeni Itiraf
- Kategori secimi
- Metin alani (500/1000 karakter)
- Opsiyonel e-posta
- Gonderme animasyonu
- Gizli kod gosterimi

### 4. Arama
- Metin arama
- Hashtag filtreleme
- Trend hashtagler

### 5. Profil/Ayarlar
- Tema secimi (Karanlik/Aydinlik)
- Bildirim tercihleri
- Premium uyelik durumu
- Gizlilik politikasi
- Uygulama versiyonu

### 6. Premium
- Plan secimi (Aylik/Yillik)
- Odeme entegrasyonu
- Premium ozellikleri

## API Endpoints (Mevcut)

```
GET    /api/truths              # Itiraf listesi
POST   /api/truths              # Yeni itiraf
GET    /api/truths/search       # Arama
POST   /api/truths/:id/me-too   # Ben de
POST   /api/truths/:id/hug      # Saril
GET    /api/truths/:id/comments # Yorumlar
POST   /api/truths/:id/comments # Yorum ekle
GET    /api/hashtags            # Trend hashtagler
GET    /api/premium             # Premium durum
POST   /api/premium             # Premium abone ol
POST   /api/push/subscribe      # Push bildirim kayit
```

## Gelistirme Adimlari

### Faz 1: Temel Yapi (1-2 gun)
- [ ] Expo projesi olustur
- [ ] NativeWind kur
- [ ] Expo Router kur
- [ ] API client olustur
- [ ] Temel navigation

### Faz 2: Ana Ozellikler (3-4 gun)
- [ ] Itiraf listesi
- [ ] Kategori filtreleme
- [ ] Itiraf detay sayfasi
- [ ] "Ben de" ve "Saril" aksiyonlari
- [ ] Yorum sistemi

### Faz 3: Itiraf Olusturma (1-2 gun)
- [ ] Yeni itiraf formu
- [ ] Kategori secimi
- [ ] Basarili gonderim ekrani
- [ ] Gizli kod gosterimi

### Faz 4: Ek Ozellikler (2-3 gun)
- [ ] Arama fonksiyonu
- [ ] Tema destegi
- [ ] Push bildirimleri
- [ ] Premium sayfasi
- [ ] Ayarlar ekrani

### Faz 5: Polish & Test (2-3 gun)
- [ ] Animasyonlar
- [ ] Error handling
- [ ] Loading states
- [ ] iOS testi
- [ ] Android testi

### Faz 6: Yayinlama (2-3 gun)
- [ ] App Store basvurusu
- [ ] Play Store basvurusu
- [ ] Store gorselleri
- [ ] Aciklama metinleri

## Komutlar

```bash
# Proje olusturma
npx create-expo-app mobile --template expo-template-blank-typescript

# Bagimliliklari kurma
cd mobile
npx expo install expo-router react-native-safe-area-context react-native-screens
npm install nativewind tailwindcss zustand axios
npm install @expo/vector-icons expo-notifications expo-device

# Calistirma
npx expo start

# Build
eas build --platform ios
eas build --platform android
```

## Store Bilgileri (Hazirlanacak)

### App Store (iOS)
- Uygulama Adi: Haydi Hep Beraber
- Kategori: Social Networking
- Yas Sinifi: 17+ (kullanici icerigi)
- Gizlilik URL: https://haydihepberaber.com/gizlilik

### Play Store (Android)
- Uygulama Adi: Haydi Hep Beraber
- Kategori: Social
- Icerik Derecelendirmesi: Mature 17+
- Gizlilik URL: https://haydihepberaber.com/gizlilik

## Notlar
- API base URL: https://haydihepberaber.com
- Mevcut web API'leri kullanilacak
- Push notification icin VAPID keys mevcut
- Premium odeme Halkbank entegrasyonu mevcut
