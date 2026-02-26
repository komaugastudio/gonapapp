import React from 'react';
import { Wallet, PlusCircle, ArrowUpRight, History, Bell } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export default function HomeScreen({ 
  userData, 
  services, 
  setActiveService, 
  setWalletView, 
  setProfileView, 
  setShowNotifications, 
  handleLogout 
}) {
  const { t } = useTranslation();

  return (
    <div className="flex-1 overflow-y-auto pb-24 bg-gray-50 animate-in fade-in relative">
      <div className="bg-green-600 p-4 pt-8 rounded-b-[2rem] shadow-md relative">
        <div className="flex items-center justify-between gap-3 mb-4 relative z-10">
          <div className="text-white">
            <p className="text-xs text-green-200">{t('welcome')}</p>
            <p className="font-bold truncate max-w-[200px]">{userData.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setProfileView('main')} className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-green-600 font-bold shadow-sm hover:scale-105 transition-transform border-2 border-green-200">
              {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3 relative z-10">
          <div className="flex justify-between items-center cursor-pointer group" onClick={() => setWalletView(true)}>
            <div className="flex items-center gap-2 text-green-700 font-bold"><Wallet className="h-5 w-5" /><span>NabPay</span></div>
            <span className="font-bold text-lg text-gray-800">Rp {new Intl.NumberFormat('id-ID').format(userData.balance)}</span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-gray-800 mb-3 ml-1 text-sm">{t('all_services')}</h3>
        <div className="grid grid-cols-4 gap-y-6 gap-x-2">
          {services.map((svc) => (
            <button key={svc.id} onClick={() => setActiveService(svc.id)} className="flex flex-col items-center gap-2 group">
              <div className={`${svc.color} text-white p-3.5 rounded-2xl shadow-sm hover:scale-105 transition-transform`}><svc.icon className="h-6 w-6" /></div>
              <span className="text-[10px] text-center text-gray-700 font-bold leading-tight">{svc.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}