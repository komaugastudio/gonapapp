import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Wallet, ScanLine, PlusCircle, QrCode, MoreHorizontal, Bike, Car, Utensils, Box, ShoppingBag, Smartphone, Ticket, User, Sparkles, Bot, X, Bell } from 'lucide-react';
import { WalletContext } from '../context/WalletContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../utils/translations';
import { formatRp } from '../utils/format';
import MenuIcon from '../components/ui/MenuIcon';
import TopUpModal from '../components/modals/TopUpModal';
import PayScannerModal from '../components/modals/PayScannerModal';
import MyQrModal from '../components/modals/MyQrModal';
import GonabAIModal from '../components/modals/GonabAIModal';

const HomeScreen = () => {
  const navigate = useNavigate();
  const { balance, loading } = useContext(WalletContext);
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const [modalType, setModalType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const searchDatabase = [
    { id: 1, type: 'Layanan', name: 'GonabRide (Ojek Motor)', icon: <Bike size={16}/>, color: 'text-green-500 bg-green-100', link: '/ride' },
    { id: 2, type: 'Layanan', name: 'GonabCar (Taksi Online)', icon: <Car size={16}/>, color: 'text-green-500 bg-green-100', link: '/ride' },
    { id: 3, type: 'Layanan', name: 'GonabFood (Pesan Makanan)', icon: <Utensils size={16}/>, color: 'text-red-500 bg-red-100', link: '/food' },
    { id: 6, type: 'Lokasi', name: 'Bandara Douw Aturure, Nabire', icon: <MapPin size={16}/>, color: 'text-blue-500 bg-blue-100', link: '/ride' },
    { id: 8, type: 'Promo', name: 'Diskon 50% Makan Siang', icon: <Ticket size={16}/>, color: 'text-yellow-600 bg-yellow-100', link: '/promo' },
  ];

  const filteredSearch = searchDatabase.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loadingData')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-6 relative">
      <div className="bg-white px-4 pt-6 pb-4 rounded-b-3xl shadow-sm relative z-20">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`flex-grow flex items-center bg-gray-100 rounded-full px-4 py-2 border transition-colors ${isSearching ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200'}`}>
            <Search size={20} className={isSearching ? 'text-green-600 mr-2' : 'text-gray-400 mr-2'} />
            <input type="text" placeholder={t('search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => setIsSearching(true)} className="bg-transparent border-none focus:outline-none w-full text-sm" />
            {isSearching && <button onClick={() => {setIsSearching(false); setSearchQuery('');}} className="text-gray-400 ml-2 hover:text-gray-600"><X size={18} /></button>}
          </div>
          <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-red-200 transition-colors relative" onClick={() => navigate('/notifications')}>
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          </div>
          <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-green-200 transition-colors" onClick={() => navigate('/profile')}>
            <User size={20} />
          </div>
        </div>

        {isSearching && (
          <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-b-2xl mt-1 py-2 px-4 border border-gray-100 max-h-80 overflow-y-auto z-50">
            {searchQuery === '' ? <div className="py-4 text-center text-gray-400 text-sm">{t('typeHere')}</div> : filteredSearch.length > 0 ? filteredSearch.map(item => (
                <div key={item.id} onClick={() => navigate(item.link)} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer border-b border-gray-50 last:border-0">
                  <div className={`p-2 rounded-lg ${item.color}`}>{item.icon}</div>
                  <div><p className="font-semibold text-gray-800 text-sm">{item.name}</p><p className="text-xs text-gray-500">{item.type}</p></div>
                </div>
              )) : <div className="py-6 text-center text-gray-500 text-sm">{t('notFound')}</div>}
          </div>
        )}

        <div className="flex items-center text-sm text-gray-700">
          <MapPin size={16} className="text-green-600 mr-1" />
          <span className="font-medium">{t('location')}</span>
          <span className="ml-1 truncate font-bold">{t('kabupatenNabire')}</span>
        </div>
      </div>

      {isSearching && <div className="fixed inset-0 bg-black/20 z-10" onClick={() => setIsSearching(false)}></div>}

      <div className="px-4 mt-4 relative z-0">
        <div className="bg-blue-600 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply opacity-50 translate-x-10 -translate-y-10"></div>
          <div className="flex justify-between items-center relative z-10">
            <div onClick={() => navigate('/wallet')} className="bg-white/20 p-2 rounded-xl cursor-pointer hover:bg-white/30">
              <div className="flex items-center space-x-2 font-bold text-lg mb-1"><Wallet size={20} /><span>GonabPay</span></div>
              <p className="text-sm text-blue-100">Klik & cek riwayat</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{formatRp(balance)}</p>
              <p onClick={() => setModalType('topup')} className="text-sm text-blue-100 hover:text-white hover:underline cursor-pointer">Top Up Saldo</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-5 relative z-10 bg-blue-700/50 rounded-xl p-2">
            <button onClick={() => setModalType('bayar')} className="flex flex-col items-center justify-center p-2 hover:bg-white/20 rounded-lg"><ScanLine size={24} className="mb-1" /><span className="text-xs font-medium">Bayar</span></button>
            <button onClick={() => setModalType('topup')} className="flex flex-col items-center justify-center p-2 hover:bg-white/20 rounded-lg"><PlusCircle size={24} className="mb-1" /><span className="text-xs font-medium">Top Up</span></button>
            <button onClick={() => setModalType('qr')} className="flex flex-col items-center justify-center p-2 hover:bg-white/20 rounded-lg"><QrCode size={24} className="mb-1" /><span className="text-xs font-medium">Kode QR</span></button>
            <button className="flex flex-col items-center justify-center p-2 hover:bg-white/20 rounded-lg"><MoreHorizontal size={24} className="mb-1" /><span className="text-xs font-medium">Lainnya</span></button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-y-6 mt-8">
          <MenuIcon icon={<Bike size={28} className="text-white" />} label="GonabRide" color="bg-green-500" onClick={() => navigate('/ride')} />
          <MenuIcon icon={<Car size={28} className="text-white" />} label="GonabCar" color="bg-green-500" onClick={() => navigate('/ride')} />
          <MenuIcon icon={<Utensils size={28} className="text-white" />} label="GonabFood" color="bg-red-500" onClick={() => navigate('/food')} />
          <MenuIcon icon={<Box size={28} className="text-white" />} label="GonabSend" color="bg-green-500" />
          <MenuIcon icon={<ShoppingBag size={28} className="text-white" />} label="GonabMart" color="bg-red-500" onClick={() => navigate('/gomart')} />
          <MenuIcon icon={<Smartphone size={28} className="text-white" />} label="Pulsa" color="bg-blue-400" onClick={() => navigate('/pulsa')} />
          <MenuIcon icon={<Ticket size={28} className="text-white" />} label="Voucher" color="bg-yellow-500" />
          <MenuIcon icon={<MoreHorizontal size={28} className="text-gray-600" />} label="Lainnya" color="bg-gray-200" />
        </div>
      </div>

      <button onClick={() => setModalType('ai')} className="fixed bottom-24 right-4 bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-full shadow-xl text-white flex items-center justify-center hover:scale-105 z-30 animate-bounce">
        <Sparkles size={24} className="absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
        <Bot size={28} />
      </button>

      {modalType === 'topup' && <TopUpModal onClose={() => setModalType(null)} />}
      {modalType === 'bayar' && <PayScannerModal onClose={() => setModalType(null)} />}
      {modalType === 'qr' && <MyQrModal onClose={() => setModalType(null)} />}
      {modalType === 'ai' && <GonabAIModal onClose={() => setModalType(null)} />}
    </div>
  );
};

export default HomeScreen;