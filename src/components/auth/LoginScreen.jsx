import React from 'react';
import { Bike, User, ShieldCheck, Activity, ChevronRight, Sparkles } from 'lucide-react';

// CATATAN UNTUK DI VS CODE: 
// Hapus fungsi useTranslation tiruan di bawah ini dan hapus tanda komentar (//) pada baris import berikut:
// import { useTranslation } from '../../context/LanguageContext';

const useTranslation = () => {
  const dictionary = {
    one_app: "Satu aplikasi untuk semua kebutuhanmu.",
    login_title: "Masuk ke Akun",
    login_user: "Masuk Pengguna",
    login_admin: "Masuk Admin"
  };
  return { t: (key) => dictionary[key] || key };
};

export default function LoginScreen({ onLogin, isAuthLoading }) {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col relative bg-green-600 overflow-hidden absolute inset-0 z-50">
      
      {/* Dekorasi Latar Belakang (Efek Cahaya Melayang) */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse"></div>
      <div className="absolute top-[20%] right-[-10%] w-56 h-56 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Bagian Atas: Logo & Branding */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-white relative z-10 animate-in fade-in slide-in-from-top-10 duration-700">
        <div className="w-24 h-24 bg-white rounded-[2rem] rotate-12 flex items-center justify-center mb-6 shadow-2xl shadow-green-900/30">
          <div className="-rotate-12">
            <Bike className="h-12 w-12 text-green-600" strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="text-4xl font-black mb-2 tracking-tight flex items-center gap-2">
          GoNab <Sparkles className="w-6 h-6 text-yellow-300" />
        </h1>
        <p className="text-green-100 font-medium text-center px-4 text-sm">
          {t('one_app')}
        </p>
      </div>

      {/* Bagian Bawah: Panel Aksi Login */}
      <div className="bg-white w-full rounded-t-[2.5rem] p-8 pb-12 shadow-[0_-15px_40px_rgba(0,0,0,0.15)] relative z-10 animate-in slide-in-from-bottom-full duration-500 fill-mode-forwards">
        
        {/* Garis kecil di atas (Drag handle UI) */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8"></div>
        
        <h2 className="text-2xl font-extrabold text-gray-800 mb-6">{t('login_title')}</h2>

        {isAuthLoading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="p-4 bg-green-50 rounded-full">
               <Activity className="w-10 h-10 text-green-600 animate-spin" />
            </div>
            <p className="text-sm font-semibold text-green-600 animate-pulse">Menghubungkan ke server...</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Tombol Masuk Pengguna */}
            <button 
              onClick={() => onLogin('user')} 
              className="w-full bg-green-600 text-white font-bold p-4 rounded-2xl text-lg hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-between shadow-lg shadow-green-600/30 group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-2.5 rounded-xl">
                  <User className="w-5 h-5" />
                </div>
                <span>{t('login_user')}</span>
              </div>
              <ChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
            </button>

            {/* Tombol Masuk Admin */}
            <button 
              onClick={() => onLogin('admin')} 
              className="w-full bg-gray-50 border-2 border-gray-100 text-gray-700 font-bold p-4 rounded-2xl text-lg hover:bg-gray-100 hover:border-gray-200 active:scale-[0.98] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-gray-200 p-2.5 rounded-xl text-gray-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span>{t('login_admin')}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </button>

          </div>
        )}
        
        <p className="text-center text-xs text-gray-400 mt-8 font-medium">
          Dengan masuk, Anda menyetujui<br/>Syarat & Ketentuan GoNab
        </p>
      </div>
      
    </div>
  );
}