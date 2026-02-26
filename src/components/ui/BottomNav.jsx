import React from 'react';
import { Home, Tag, ClipboardList, MessageCircle } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

export default function BottomNav({ activeTab, setActiveTab }) {
  const { t } = useTranslation();
  
  const navItems = [
    { id: 'home', icon: Home, label: t('tab_home') }, 
    { id: 'promo', icon: Tag, label: t('tab_promo') }, 
    { id: 'orders', icon: ClipboardList, label: t('tab_orders') }, 
    { id: 'chat', icon: MessageCircle, label: t('tab_chat') }
  ];

  return (
    <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-40 pb-6 rounded-b-[2rem]">
      {navItems.map((item) => (
        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-1 transition-colors w-1/4 ${activeTab === item.id ? 'text-green-600' : 'text-gray-400'}`}>
          <item.icon className={`h-6 w-6 ${activeTab === item.id ? 'fill-green-600/10' : ''}`} />
          <span className="text-[10px] font-bold">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
