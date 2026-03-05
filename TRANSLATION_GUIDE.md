# 📱 Panduan Sistem Terjemahan Gonab App

## ✅ Status Implementasi

Berikut halaman yang sudah menggunakan sistem terjemahan:
- ✅ **HomeScreen** - Beranda dengan search dan location
- ✅ **ProfileScreen** - Profil dengan email verification
- ✅ **WalletScreen** - Dompet GonabPay
- ✅ **LanguageScreen** - Pemilihan bahasa
- ✅ **BottomNav** - Navigasi bawah

## 🎯 Cara Menambahkan Terjemahan ke Halaman Lain

### Langkah 1: Tambahkan Teks ke `translations.js`

```javascript
// Di src/utils/translations.js, tambahkan ke object terjemahan:

id: {
  // Contoh untuk SettingsScreen
  settingsTitle: 'Pengaturan Akun',
  privacySettings: 'Pengaturan Privasi',
  notificationSettings: 'Pengaturan Notifikasi',
  darkMode: 'Mode Gelap',
  // ... tambahkan lebih banyak teks
},
en: {
  settingsTitle: 'Account Settings',
  privacySettings: 'Privacy Settings',
  notificationSettings: 'Notification Settings',
  darkMode: 'Dark Mode',
  // ... English translations
}
```

### Langkah 2: Import di Component/Screen

```javascript
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../utils/translations';
```

### Langkah 3: Gunakan dalam Component

```javascript
const YourScreen = () => {
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  
  return (
    <div>
      <h2>{t('settingsTitle')}</h2>
      <p>{t('privacySettings')}</p>
    </div>
  );
};
```

## 🔧 Contoh Implementasi Lengkap

### SettingsScreen (Belum diterjemahkan)

1. **Buka `src/screens/SettingsScreen.jsx`**

2. **Tambahkan imports:**
```javascript
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../utils/translations';
```

3. **Tambahkan di function component:**
```javascript
const { language } = useLanguage();
const { t } = useTranslation(language);
```

4. **Ganti semua teks hardcoded dengan `t('key')`**

Contoh:
```javascript
// Sebelum
<h2>Pengaturan Akun</h2>

// Sesudah
<h2>{t('settingsTitle')}</h2>
```

## 📝 Teks yang Sudah Tersedia di Translations

### Common
- `back`, `save`, `cancel`, `close`
- `loading`, `loadingData`, `error`, `success`

### Navigation
- `home`, `wallet`, `profile`, `settings`, `help`, `history`

### Authentication
- `login`, `logout`, `signUp`
- `userNotFound`, `emailNotFound`
- `tooManyRequests`, `failedToSendEmail`

### Profile
- `myProfile`, `profileSettings`, `editProfile`
- `changePassword`, `deleteAccount`
- `verified`, `notVerified`

### Email Verification
- `emailVerification`, `verificationSuccess`
- `emailVerified`, `verificationSent`
- `instructions`, `checkInbox`, `waitEmail`
- `clickLink`, `dontCloseApp`, `autoUpdate`

### Home
- `balance`, `topUp`, `search`, `location`
- `typeHere`, `notFound`

### Wallet
- `walletTitle`, `yourBalance`
- `showQRCode`

## 🎨 Menambahkan Teks Baru

### Ketika perlu menambah teks baru:

1. **Edit `src/utils/translations.js`**
2. **Tambahkan key yang deskriptif di KEDUA bahasa (id dan en)**
3. **Import dan gunakan di component dengan `t('key')`**

Contoh:
```javascript
// translations.js
id: {
  welcomeMessage: 'Selamat datang di Gonab',
},
en: {
  welcomeMessage: 'Welcome to Gonab',
}

// Component
const { t } = useTranslation(language);
return <h1>{t('welcomeMessage')}</h1>;
```

## ✨ Fitur Bonus

### Bahasa berubah otomatis di semua halaman
- Ketika user memilih bahasa di **LanguageScreen**
- Semua component yang menggunakan `useTranslation()` akan update
- Tidak perlu reload halaman!

### Bahasa tersimpan di localStorage
- Pilihan bahasa user disimpan otomatis
- Ketika app dibuka kembali, bahasa sebelumnya akan digunakan

### Mudah untuk tambah bahasa baru
- Tinggal tambahkan object baru di `translations.js`
- Contoh: `es`, `fr`, `ja`, dll

## 🚀 Halaman yang Masih Perlu Terjemahan

- [ ] SettingsScreen
- [ ] HelpScreen
- [ ] HistoryScreen
- [ ] VouchersScreen
- [ ] NotificationScreen
- [ ] EditProfileScreen
- [ ] ChangePasswordScreen
- [ ] DeleteAccountScreen
- [ ] GonabRideScreen
- [ ] GonabFoodScreen
- [ ] GomartScreen
- [ ] PulsaScreen
- [ ] PromoScreen
- Semua Modal Components

## 💡 Tips

1. **Gunakan key yang deskriptif**: `settingsTitle` bukan `text1`
2. **Kelompokkan teks berdasarkan kategori**: semua teks profile bersama, wallet bersama, dll
3. **Jangan lupa kedua bahasa**: SELALU update `id` dan `en` bersama-sama
4. **Test dengan mengubah bahasa**: Pastikan semua text berubah dengan benar

## 📞 Bantuan

Jika ada pertanyaan tentang implementasi terjemahan, check:
- `src/utils/translations.js` - Semua teks tersedia di sini
- `src/context/LanguageContext.jsx` - Logika bahasa global
- `src/screens/ProfileScreen.jsx` - Contoh implementasi lengkap
