# 📍 Peta Interaktif - Integrasi Gonab App

## 🎯 Ringkasan Perubahan

Saya telah menambahkan fitur peta interaktif ke aplikasi Gonab untuk memberikan pengalaman yang lebih mirip dengan Gojek. Berikut adalah perubahan yang telah dilakukan:

### 1. **Komponen Peta Baru** 📌
**File:** `src/components/Map.jsx`
- Komponen React yang mengintegrasikan Leaflet (perpustakaan peta open-source)
- Memuat Leaflet dari CDN (tidak memerlukan npm install khusus)
- Menampilkan peta dengan:
  - **Marker Biru** untuk lokasi jemput
  - **Marker Merah** untuk lokasi tujuan
  - Zoom otomatis untuk menampilkan kedua lokasi
  - Kemampuan klik untuk memilih lokasi
  - Popup info saat marker diklik

### 2. **Layar Perjalanan (GonabRideScreen)** 🚗
**File:** `src/screens/GonabRideScreen.jsx`
- Mengganti Google Maps iframe dengan komponen Map interaktif
- Peta ditampilkan di bagian atas layar dengan gradient overlay
- Update otomatis saat pengguna mengubah lokasi jemput/tujuan
- Menampilkan marker real-time untuk kedua lokasi

### 3. **Layar Makanan (GonabFoodScreen)** 🍽️
**File:** `src/screens/GonabFoodScreen.jsx`
- Menambahkan peta restoran di bagian atas
- Tinggi peta: 264px (h-64)
- Menampilkan lokasi layanan makanan di area Nabire
- Fixed header dengan peta yang sticky saat scroll

### 4. **Layar Mart (GomartScreen)** 🏪
**File:** `src/screens/GomartScreen.jsx`
- Menambahkan peta toko/minimarket
- Tinggi peta: 224px (h-56)
- Menampilkan lokasi GonabMart di area Nabire
- Sticky header dengan peta untuk navigasi yang lebih baik

## 🗺️ Fitur Peta

### Lokasi Default (Nabire, Papua)
- **Pickup Default:** Oyehe, Nabire, Papua Tengah (-1.984, 134.189)
- **Jl. Kartini:** -1.982, 134.190
- **Mal Nabire:** -1.985, 134.188

### Teknologi
- **Library:** Leaflet 1.9.4
- **CDN:** cdnjs.cloudflare.com
- **Base Map:** OpenStreetMap
- **Icons:** Custom SVG dengan warna kode (Biru: #2255ee, Merah: #ef4444)
- **No External Dependencies:** Menggunakan CDN untuk menghindari masalah instalasi npm

## 🎨 Tampilan & UX

### GonabRideScreen
```
┌─────────────────────────┐
│  ← Tombol kembali       │
├─────────────────────────┤
│                         │
│      PETA LEAFLET       │
│   (Pickup + Dropoff)    │
│                         │
├─────────────────────────┤
│ Form Jemput & Tujuan    │
│ Pilih Kendaraan         │
│ Harga & Pembayaran      │
│ PESAN SEKARANG          │
└─────────────────────────┘
```

### GonabFoodScreen
```
┌──────────────────────────┐
│ ← Search  🛒            │
├──────────────────────────┤
│                          │
│    PETA RESTORAN         │
│   (OpenStreetMap)        │
│                          │
├──────────────────────────┤
│ Tab: Terdekat/Terlaris   │
│ Menu Populer             │
│ Daftar Makanan           │
└──────────────────────────┘
```

### GomartScreen
```
┌──────────────────────────┐
│ ← GonabMart             │
├──────────────────────────┤
│                          │
│    PETA TOKO             │
│   (Lokasi Minimarket)    │
│                          │
├──────────────────────────┤
│ Daftar Produk            │
│ Keranjang Belanja         │
│ Checkout                 │
└──────────────────────────┘
```

## 📋 Kode Perubahan

### Import Ditambahkan
```javascript
import Map from '../components/Map';
```

### Penggunaan Peta
```javascript
<Map 
  pickup={pickup}
  dropoff={dropoff}
  height="100%"
  onLocationSelect={(coords) => {
    console.log('Selected location:', coords);
  }}
/>
```

## 🚀 Cara Menjalankan

1. Pastikan semua dependencies sudah terinstall:
   ```bash
   npm install
   ```

2. Jalankan development server:
   ```bash
   npm run dev
   ```

3. Buka browser dan akses aplikasi (biasanya di `http://localhost:5173`)

4. Navigasi ke:
   - **Ride:** Lihat peta dengan marker jemput/tujuan
   - **Food:** Lihat peta restoran
   - **Mart:** Lihat peta minimarket

## ✨ Keunggulan Implementasi

✅ **Tidak Memerlukan Instalasi Berat:** Menggunakan CDN Leaflet  
✅ **Responsif:** Menyesuaikan dengan ukuran layar  
✅ **User-Friendly:** Marker yang jelas dengan warna yang berbeda  
✅ **Performa Baik:** Loading dari CDN global yang cepat  
✅ **Dapat Dikustomisasi:** Props untuk mengubah lokasi, zoom, dll  
✅ **Kompatibel:** Bekerja dengan semua browser modern  

## 🔧 Kustomisasi Lebih Lanjut

Untuk menambahkan fitur lebih lanjut, Anda dapat:

1. **Menambah lebih banyak marker:** Ubah array coordinates
2. **Mengganti base map:** Ubah URL tile layer
3. **Menambah routing:** Integrasikan dengan OSRM atau Mapbox
4. **Geolocation real-time:** Gunakan HTML5 Geolocation API
5. **Clustering markers:** Gunakan Leaflet.markercluster

## 📚 Referensi

- [Leaflet Documentation](https://leafletjs.com/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Leaflet CDN](https://cdnjs.com/libraries/leaflet)

---

**Status:** ✅ Implementasi Selesai  
**Last Updated:** Maret 1, 2026
