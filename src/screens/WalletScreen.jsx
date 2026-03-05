import React, { useState, useContext } from 'react';
import { PlusCircle, ScanLine, QrCode, ChevronRight, Send } from 'lucide-react';
import { WalletContext } from '../context/WalletContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../utils/translations';
import { formatRp } from '../utils/format';
import TopUpModal from '../components/modals/TopUpModal';
import PayScannerModal from '../components/modals/PayScannerModal';
import MyQrModal from '../components/modals/MyQrModal';
import TransferModal from '../components/modals/TransferModal';

const WalletScreen = () => {
  const { balance } = useContext(WalletContext);
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const [modalType, setModalType] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 pt-4">{t('walletTitle')}</h2>
      <div className="bg-blue-600 p-6 rounded-3xl shadow-md text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-50 translate-x-10 -translate-y-10"></div>
        <div className="relative z-10">
          <p className="text-blue-100 text-sm mb-1">{t('yourBalance')}</p>
          <div className="flex items-center space-x-2">
            <span className="text-4xl font-bold">{formatRp(balance)}</span>
          </div>
          <div className="mt-6 flex space-x-3">
            <button onClick={() => setModalType('topup')} className="flex-1 bg-white text-blue-600 py-3 rounded-full font-bold shadow-sm flex items-center justify-center space-x-2 hover:bg-blue-50 transition">
              <PlusCircle size={18} /> <span>{t('topUp')}</span>
            </button>
            <button onClick={() => setModalType('transfer')} className="flex-1 bg-blue-700 text-white py-3 rounded-full font-bold shadow-sm flex items-center justify-center space-x-2 hover:bg-blue-800 transition">
              <Send size={18} /> <span>Transfer</span>
            </button>
            <button onClick={() => setModalType('bayar')} className="flex-1 bg-blue-700 text-white py-3 rounded-full font-bold shadow-sm flex items-center justify-center space-x-2 hover:bg-blue-800 transition">
              <ScanLine size={18} /> <span>{t('pay')}</span>
            </button>
          </div>
        </div>
      </div>
      
      <div onClick={() => setModalType('qr')} className="mt-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50">
        <div className="flex items-center space-x-3"><div className="bg-blue-100 p-2 rounded-lg text-blue-600"><QrCode size={24} /></div><div><p className="font-bold text-gray-800">{t('showQRCode')}</p></div></div>
        <ChevronRight size={20} className="text-gray-400" />
      </div>

      {modalType === 'topup' && <TopUpModal onClose={() => setModalType(null)} />}
      {modalType === 'transfer' && <TransferModal onClose={() => setModalType(null)} />}
      {modalType === 'bayar' && <PayScannerModal onClose={() => setModalType(null)} />}
      {modalType === 'qr' && <MyQrModal onClose={() => setModalType(null)} />}
    </div>
  );
};

export default WalletScreen;