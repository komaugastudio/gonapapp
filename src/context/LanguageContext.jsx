import React, { createContext, useContext, useState } from 'react';

const translations = {
  id: {
    app_desc: "Super App Kita Semua", one_app: "Satu aplikasi untuk semua kebutuhanmu.", login_title: "Masuk ke Akun", login_user: "Masuk Pengguna", login_admin: "Masuk Admin", welcome: "Selamat datang,", balance: "Total Saldo", topup: "Isi Saldo", pay: "Bayar", history: "Riwayat", all_services: "Semua Layanan", tab_home: "Beranda", tab_promo: "Promo", tab_orders: "Pesanan", tab_chat: "Chat", settings: "Pengaturan Aplikasi", notif_promo: "Notifikasi Promo", language: "Bahasa", profile: "Profil Saya", acc_settings: "Pengaturan Akun", edit_profile: "Edit Profil Pribadi", saved_address: "Daftar Alamat Tersimpan", security_pin: "Keamanan & PIN NabPay", help_info: "Pusat Bantuan & Info", faq: "Pusat Bantuan (FAQ)", tnc: "Syarat & Ketentuan", logout: "Keluar Akun", promo_title: "Promo Menarik Nabire", orders_title: "Riwayat Pesanan", chat_title: "Pesan Masuk", wallet_title: "Dompet NabPay", in_progress: "Pesanan Sedang Diproses", to_location: "Menuju Lokasi", member: "Anggota NabClub", towards_sultan: "Menuju Anak Sultan", search_dest: "Mau pergi ke mana?", search_placeholder: "Cari lokasi tujuan di Nabire...", choose_dest: "Pilih Tujuan", order_confirm: "Konfirmasi Pesanan", order_now: "Pesan Sekarang", searching: "Mencari Driver...", driver_found: "Driver Ditemukan!", driver_desc: "Driver sedang menuju ke lokasi Anda.", back_home: "Kembali ke Beranda"
  },
  en: {
    app_desc: "Our Super App", one_app: "One app for all your needs.", login_title: "Login to Account", login_user: "User Login", login_admin: "Admin Login", welcome: "Welcome,", balance: "Total Balance", topup: "Top Up", pay: "Pay", history: "History", all_services: "All Services", tab_home: "Home", tab_promo: "Promos", tab_orders: "Orders", tab_chat: "Chat", settings: "App Settings", notif_promo: "Promo Notifications", language: "Language", profile: "My Profile", acc_settings: "Account Settings", edit_profile: "Edit Personal Profile", saved_address: "Saved Addresses", security_pin: "Security & NabPay PIN", help_info: "Help Center & Info", faq: "Help Center (FAQ)", tnc: "Terms & Conditions", logout: "Log Out", promo_title: "Exciting Promos", orders_title: "Order History", chat_title: "Inbox", wallet_title: "NabPay Wallet", in_progress: "Order in Progress", to_location: "Heading to Location", member: "NabClub Member", towards_sultan: "Towards Sultan Level", search_dest: "Where do you want to go?", search_placeholder: "Search destination...", choose_dest: "Choose Destination", order_confirm: "Order Confirmation", order_now: "Order Now", searching: "Finding Driver...", driver_found: "Driver Found!", driver_desc: "Driver is heading to your location.", back_home: "Back to Home"
  }
};

const LanguageContext = createContext();

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) return { t: (k) => k, lang: 'id', setLang: () => {} };
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('id');
  const t = (key) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};