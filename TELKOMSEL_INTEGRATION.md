# Integrasi Telkomsel API untuk Cek Saldo Pulsa

## 📋 Ringkasan
Fitur ini memungkinkan pengguna untuk mengecek saldo pulsa Telkomsel mereka sebelum membeli pulsa melalui aplikasi Gonab.

## 🔧 Komponen yang Ditambahkan

### 1. **pulsaService.js** - Updated
- ✅ Fungsi `checkTelkomselBalance()` untuk mengecek saldo dari API Telkomsel
- ✅ Normalizes phone numbers (format international: 62...)
- ✅ Mengirim API key ke backend

### 2. **PulsaScreen.jsx** - Updated  
- ✅ Tombol refresh untuk mengecek saldo langsung
- ✅ Display saldo Telkomsel dalam box khusus
- ✅ Validasi nomor HP sebelum cek saldo

## 🔑 Setup API Key Telkomsel

### Langkah 1: Daftar di Telkomsel Developer Portal
1. Kunjungi: https://developer.telkomsel.com/
2. Login atau daftar akun baru
3. Buat aplikasi baru di developer portal
4. Dapatkan API Key dan API Secret

### Langkah 2: Konfigurasi Environment Variable
1. Buka file `.env` di root folder project:
```bash
REACT_APP_TELKOMSEL_API_KEY=your_api_key_from_telkomsel
```

2. Jika file `.env` belum ada, copy dari `.env.example`:
```bash
cp .env.example .env
```

3. Update nilai API key sesuai yang didapat dari Telkomsel

### Langkah 3: Backend Endpoint - `/api/pulsa/check-balance`

Anda perlu membuat endpoint backend:

```javascript
// backend/routes/pulsa.js
router.post('/check-balance', async (req, res) => {
  try {
    const { phone, apiKey } = req.body;
    
    // Validasi API key
    if (apiKey !== process.env.TELKOMSEL_API_KEY) {
      return res.json({ 
        success: false, 
        message: 'API key tidak valid' 
      });
    }

    // Call Telkomsel API
    const telkomselResponse = await checkTelkomselAPI(phone, apiKey);
    
    if (telkomselResponse.success) {
      return res.json({
        success: true,
        balance: telkomselResponse.balance,
        message: 'Saldo berhasil diambil'
      });
    } else {
      return res.json({
        success: false,
        message: 'Gagal mengambil saldo dari Telkomsel',
        balance: null
      });
    }
  } catch (error) {
    console.error('Error checking balance:', error);
    res.json({
      success: false,
      message: 'Terjadi kesalahan server',
      balance: null
    });
  }
});

// Function untuk call Telkomsel API
async function checkTelkomselAPI(phone, apiKey) {
  try {
    const response = await fetch('https://api.telkomsel.com/v1/balance/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        phone: phone,
        timestamp: new Date().toISOString()
      })
    });

    const data = await response.json();
    
    if (data.success) {
      return {
        success: true,
        balance: data.balance, // dalam Rupiah
        message: data.message
      };
    } else {
      return {
        success: false,
        message: data.message || 'Gagal mengecek saldo'
      };
    }
  } catch (error) {
    console.error('Telkomsel API Error:', error);
    return {
      success: false,
      message: 'Gagal terhubung ke API Telkomsel'
    };
  }
}
```

## 📱 Cara Penggunaan

1. **User membuka PulsaScreen**
2. **Masukkan nomor HP** (format: 08XXXXXXXXXX)
3. **Klik tombol refresh** (icon ↻) untuk mengecek saldo
4. **Saldo akan ditampilkan** dalam box biru jika berhasil
5. **Kemudian user bisa membeli pulsa** dengan nominal yang diinginkan

## 🔌 Endpoint API yang Diperlukan

### Check Balance
```
POST /api/pulsa/check-balance
Content-Type: application/json

Body:
{
  "phone": "628XXXXXXXXX",
  "apiKey": "TELKOMSEL_API_KEY"
}

Response Success:
{
  "success": true,
  "balance": 50000,
  "message": "Saldo berhasil diambil"
}

Response Error:
{
  "success": false,
  "balance": null,
  "message": "Gagal mengambil saldo dari Telkomsel"
}
```

## 📞 Format Nomor HP

- **Input User**: 08XXXXXXXXXX (10-13 digit)
- **Normalize ke**: 62XXXXXXXXXX (format internasional)
- Validasi menggunakan regex: `/^08\d{8,11}$/`

## ⚠️ Important Notes

1. **API Key Security**: 
   - Jangan commit `.env` ke git
   - Simpan API key dengan aman di server backend
   - Gunakan environment variables di production

2. **Rate Limiting**:
   - Telkomsel API mungkin memiliki rate limit
   - Implementasikan cooldown/debounce untuk tombol cek saldo

3. **Error Handling**:
   - Handle timeout dari API Telkomsel
   - Show user-friendly error messages

4. **Testing**:
   - Gunakan nomor test dari Telkomsel jika tersedia
   - Test dengan berbagai format nomor HP

## 🚀 Next Steps

1. ✅ Update `.env` dengan API key Telkomsel
2. ✅ Implementasi backend endpoint untuk check balance
3. ✅ Test dengan nomor real Telkomsel  
4. ✅ Deploy ke production

## 📚 Referensi

- Telkomsel Developer Portal: https://developer.telkomsel.com/
- API Documentation: Check di developer portal Telkomsel
- Format Nomor Indonesia: https://en.wikipedia.org/wiki/Telephone_numbers_in_Indonesia
