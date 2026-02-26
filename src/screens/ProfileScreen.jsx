import React, { useState } from 'react';
import { 
  ArrowLeft, Camera, Award, User, ChevronRight, MapPin, 
  Shield, HelpCircle, Settings, ClipboardList, LogOut, 
  Save, BellRing, Globe 
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

// 1. LAYAR PROFIL UTAMA
export const ProfileMainScreen = ({ onBack, onNavigate, onLogout, user }) => {
  const { t } = useTranslation();
  return (
    <div className="flex-1 bg-gray-50 absolute inset-0 z-[60] flex flex-col animate-in slide-in-from-right-full duration-300">
      <div className="bg-gradient-to-b from-green-600 to-green-700 pt-6 pb-20 px-4 relative shadow-sm">
        <div className="flex items-center gap-4 text-white relative z-10">
          <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full transition"><ArrowLeft className="h-6 w-6" /></button>
          <h1 className="font-bold text-lg">{t('profile')}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6 px-4 -mt-14 relative z-10">
        <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-100 flex flex-col items-center mb-6 relative">
          <div className="w-24 h-24 bg-green-100 border-4 border-white rounded-full flex items-center justify-center text-green-600 font-bold text-4xl shadow-sm relative -mt-16 mb-3">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            <button onClick={() => onNavigate('edit')} className="absolute bottom-0 right-0 bg-white p-2.5 rounded-full shadow-md border border-gray-100 text-gray-600 hover:text-green-600 transition hover:scale-105 active:scale-95"><Camera className="w-4 h-4" /></button>
          </div>
          <h2 className="text-xl font-extrabold text-gray-800">{user.name}</h2>
          <p className="text-gray-500 text-sm mt-1 mb-5">{user.phone} • {user.email}</p>
          
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 w-full rounded-2xl p-3.5 flex justify-between items-center text-white shadow-sm">
             <div className="flex items-center gap-3">
               <div className="bg-white/20 p-2 rounded-full"><Award className="w-5 h-5" /></div>
               <div><p className="text-[10px] uppercase tracking-widest font-bold opacity-90">{t('member')}</p><p className="font-extrabold text-sm">Juragan</p></div>
             </div>
             <div className="text-right"><p className="text-xs font-bold">1.250 XP</p><p className="text-[10px] opacity-90 font-medium">{t('towards_sultan')}</p></div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">{t('acc_settings')}</h3>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
               <button onClick={() => onNavigate('edit')} className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50 transition group">
                 <div className="flex items-center gap-4"><div className="p-2.5 rounded-xl bg-blue-50 text-blue-600"><User className="h-5 w-5"/></div><span className="font-bold text-gray-700 text-sm">{t('edit_profile')}</span></div><ChevronRight className="h-5 w-5 text-gray-300" />
               </button>
               <button onClick={() => onNavigate('address')} className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50 transition group">
                 <div className="flex items-center gap-4"><div className="p-2.5 rounded-xl bg-red-50 text-red-600"><MapPin className="h-5 w-5"/></div><span className="font-bold text-gray-700 text-sm">{t('saved_address')}</span></div><ChevronRight className="h-5 w-5 text-gray-300" />
               </button>
               <button onClick={() => onNavigate('security')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition group">
                 <div className="flex items-center gap-4"><div className="p-2.5 rounded-xl bg-purple-50 text-purple-600"><Shield className="h-5 w-5"/></div><span className="font-bold text-gray-700 text-sm">{t('security_pin')}</span></div><ChevronRight className="h-5 w-5 text-gray-300" />
               </button>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">{t('help_info')}</h3>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
               <button onClick={() => onNavigate('help')} className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50 transition group">
                 <div className="flex items-center gap-4"><div className="p-2.5 rounded-xl bg-orange-50 text-orange-600"><HelpCircle className="h-5 w-5"/></div><span className="font-bold text-gray-700 text-sm">{t('faq')}</span></div><ChevronRight className="h-5 w-5 text-gray-300" />
               </button>
               <button onClick={() => onNavigate('settings')} className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50 transition group">
                 <div className="flex items-center gap-4"><div className="p-2.5 rounded-xl bg-gray-100 text-gray-600"><Settings className="h-5 w-5"/></div><span className="font-bold text-gray-700 text-sm">{t('settings')}</span></div><ChevronRight className="h-5 w-5 text-gray-300" />
               </button>
               <button onClick={() => onNavigate('terms')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition group">
                 <div className="flex items-center gap-4"><div className="p-2.5 rounded-xl bg-teal-50 text-teal-600"><ClipboardList className="h-5 w-5"/></div><span className="font-bold text-gray-700 text-sm">{t('tnc')}</span></div><ChevronRight className="h-5 w-5 text-gray-300" />
               </button>
            </div>
          </div>

          <button onClick={onLogout} className="w-full mt-2 bg-white border-2 border-red-100 rounded-3xl p-4 flex items-center justify-center gap-2 text-red-600 font-extrabold hover:bg-red-50 hover:border-red-200 transition shadow-sm">
            <LogOut className="h-5 w-5" /> {t('logout')}
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. LAYAR EDIT PROFIL
export const EditProfileScreen = ({ onBack, user, onSave }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: user.name || '', phone: user.phone || '', email: user.email || '' });
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div className="flex-1 bg-white absolute inset-0 z-[70] flex flex-col animate-in slide-in-from-right-full duration-300">
      <div className="bg-white p-4 flex items-center gap-4 shadow-sm border-b border-gray-100"><button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition"><ArrowLeft className="h-6 w-6 text-gray-800" /></button><h1 className="font-bold text-lg text-gray-800">{t('edit_profile')}</h1></div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div><label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Nama Lengkap</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-200 rounded-xl p-3.5 text-gray-800 font-semibold focus:outline-none focus:border-green-500" /></div>
        <div><label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Nomor Telepon</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-gray-200 rounded-xl p-3.5 text-gray-800 font-semibold focus:outline-none focus:border-green-500" /></div>
        <div><label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-200 rounded-xl p-3.5 text-gray-800 font-semibold focus:outline-none focus:border-green-500" /></div>
      </div>
      <div className="p-4 bg-white border-t border-gray-100"><button onClick={() => onSave(formData)} className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2"><Save className="h-5 w-5" /> Simpan</button></div>
    </div>
  );
};

// 3. LAYAR PENGATURAN & BAHASA
export const SettingsScreen = ({ onBack }) => {
  const { t, lang, setLang } = useTranslation();
  const [notif, setNotif] = useState(true);
  const toggleLanguage = () => setLang(lang === 'id' ? 'en' : 'id');

  return (
    <div className="flex-1 bg-gray-50 absolute inset-0 z-[70] flex flex-col animate-in slide-in-from-right-full duration-300">
      <div className="bg-white p-4 flex items-center gap-4 shadow-sm border-b border-gray-100"><button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition"><ArrowLeft className="h-6 w-6 text-gray-800" /></button><h1 className="font-bold text-lg text-gray-800">{t('settings')}</h1></div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div onClick={() => setNotif(!notif)} className="flex items-center justify-between p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50">
             <div className="flex items-center gap-3"><BellRing className="w-5 h-5 text-blue-500" /><span className="text-sm font-semibold text-gray-700">{t('notif_promo')}</span></div>
             <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${notif ? 'bg-blue-500' : 'bg-gray-300'}`}><div className={`w-4 h-4 bg-white rounded-full transition-transform ${notif ? 'translate-x-6' : ''}`} /></div>
          </div>
          <div onClick={toggleLanguage} className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
             <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-orange-500" /><span className="text-sm font-semibold text-gray-700">{t('language')}</span></div>
             <span className="text-sm text-green-600 font-bold">{lang === 'id' ? 'Indonesia' : 'English'} <ChevronRight className="w-4 h-4 inline" /></span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. LAYAR PLACEHOLDER (Untuk menu yang belum ada)
export const PlaceholderScreen = ({ title, onBack }) => (
  <div className="flex-1 bg-gray-50 absolute inset-0 z-[70] flex flex-col animate-in slide-in-from-right-full duration-300">
    <div className="bg-white p-4 flex items-center gap-4 shadow-sm border-b border-gray-100"><button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition"><ArrowLeft className="h-6 w-6" /></button><h1 className="font-bold text-lg text-gray-800">{title}</h1></div>
    <div className="flex-1 flex justify-center items-center text-gray-500 text-sm">Halaman dalam pengembangan</div>
  </div>
);