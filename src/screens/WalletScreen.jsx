import React, { useState } from 'react';
import { ArrowLeft, Wallet, PlusCircle, ArrowUpRight, CheckCircle, CreditCard, QrCode } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export default function WalletScreen({ onBack, balance, onTopUp, transactions, onToast }) {
  const { t } = useTranslation();
  const [view, setView] = useState('home'); 
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bca'); 
  
  const presetNominals = [50000, 100000, 200000, 500000];

  const paymentOptions = [
    { id: 'bca', name: 'BCA Virtual Account', desc: 'Biaya admin Rp 1.000', icon: CreditCard },
    { id: 'qris', name: 'QRIS (Semua Pembayaran)', desc: 'Bebas biaya admin', icon: QrCode },
  ];

  const handleConfirmTopUp = () => {
    if (!amount || isNaN(amount) || parseInt(amount) < 10000) return;
    if (paymentMethod === 'qris') { setView('qris_show'); return; }
    if (paymentMethod === 'bca') { setView('va_show'); return; }
  };

  const handlePaymentSuccess = async (methodName) => {
    setIsProcessing(true);
    await onTopUp(parseInt(amount)); // Memanggil fungsi Database dari App.jsx
    setIsProcessing(false);
    setAmount('');
    setView('home');
  };

  // TAMPILAN 1: QRIS
  if (view === 'qris_show') {
    return (
      <div className="flex-1 bg-gray-50 absolute inset-0 z-[60] flex flex-col animate-in slide-in-from-right-full duration-300">
        <div className="bg-white p-4 flex items-center gap-4 shadow-sm border-b border-gray-100"><button onClick={() => setView('topup')} className="p-2 hover:bg-gray-100 rounded-full transition"><ArrowLeft className="h-6 w-6 text-gray-800" /></button><h1 className="font-bold text-lg text-gray-800">Pembayaran QRIS</h1></div>
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center w-full max-w-sm">
            <QrCode className="w-48 h-48 text-gray-900 mb-6" strokeWidth={1} />
            <p className="text-sm text-gray-500 mb-1">Total Pembayaran</p>
            <p className="font-black text-2xl text-green-600 mb-8">Rp {new Intl.NumberFormat('id-ID').format(amount)}</p>
            <button disabled={isProcessing} onClick={() => handlePaymentSuccess('QRIS')} className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition shadow-sm active:scale-95 flex items-center justify-center gap-2">
               {isProcessing ? 'Memproses...' : <><CheckCircle className="w-5 h-5" /> Simulasikan Berhasil</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // TAMPILAN 2: VIRTUAL ACCOUNT
  if (view === 'va_show') {
    return (
      <div className="flex-1 bg-gray-50 absolute inset-0 z-[60] flex flex-col animate-in slide-in-from-right-full duration-300">
        <div className="bg-white p-4 flex items-center gap-4 shadow-sm border-b border-gray-100"><button onClick={() => setView('topup')} className="p-2 hover:bg-gray-100 rounded-full transition"><ArrowLeft className="h-6 w-6 text-gray-800" /></button><h1 className="font-bold text-lg text-gray-800">Virtual Account</h1></div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <CreditCard className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h2 className="font-bold text-gray-800 text-lg mb-1">BCA Virtual Account</h2>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center mb-6 mt-4">
              <span className="font-mono font-bold text-xl text-gray-800 tracking-widest">3901 0812 3456</span>
            </div>
            <button disabled={isProcessing} onClick={() => handlePaymentSuccess('BCA Virtual Account')} className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition shadow-sm active:scale-95 flex items-center justify-center gap-2">
               {isProcessing ? 'Memproses...' : <><CheckCircle className="w-5 h-5" /> Simulasikan Berhasil</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // TAMPILAN 3: PILIH NOMINAL TOP UP
  if (view === 'topup') {
    return (
      <div className="flex-1 bg-gray-50 absolute inset-0 z-[60] flex flex-col animate-in slide-in-from-bottom-full duration-300">
        <div className="bg-white p-4 flex items-center gap-4 shadow-sm border-b border-gray-100"><button onClick={() => setView('home')} className="p-2 hover:bg-gray-100 rounded-full transition"><ArrowLeft className="h-6 w-6 text-gray-800" /></button><h1 className="font-bold text-lg text-gray-800">{t('topup')}</h1></div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Pilih Nominal Cepat</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {presetNominals.map(nom => (
                  <button key={nom} onClick={() => setAmount(nom.toString())} className={`py-3 rounded-lg border font-bold text-sm transition-colors ${amount === nom.toString() ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>Rp {new Intl.NumberFormat('id-ID').format(nom)}</button>
                ))}
              </div>
              <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Atau Masukkan Nominal</p>
              <div className="relative">
                <span className="absolute left-4 top-3.5 font-bold text-gray-500">Rp</span>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="10000" className="w-full border border-gray-200 rounded-xl p-3.5 pl-11 text-gray-800 font-bold text-lg focus:outline-none focus:border-green-500 transition" />
              </div>
           </div>
           
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
             <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Metode Pembayaran</p>
             <div className="space-y-3">
               {paymentOptions.map(option => (
                 <div key={option.id} onClick={() => setPaymentMethod(option.id)} className={`flex justify-between items-center p-3 rounded-xl cursor-pointer transition-colors border ${paymentMethod === option.id ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-green-300'}`}>
                   <div className="flex items-center gap-3"><div className={`p-2 rounded-lg shadow-sm ${paymentMethod === option.id ? 'bg-white' : 'bg-gray-50'}`}><option.icon className={`w-5 h-5 ${paymentMethod === option.id ? 'text-green-600' : 'text-gray-500'}`} /></div><div><p className={`text-sm font-bold ${paymentMethod === option.id ? 'text-gray-800' : 'text-gray-600'}`}>{option.name}</p><p className="text-xs text-gray-500">{option.desc}</p></div></div>
                   {paymentMethod === option.id && <CheckCircle className="w-5 h-5 text-green-600" />}
                 </div>
               ))}
             </div>
           </div>
        </div>
        <div className="p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button disabled={!amount || parseInt(amount) < 10000 || isProcessing} onClick={handleConfirmTopUp} className={`w-full text-white font-bold py-3.5 rounded-xl transition flex justify-center items-center gap-2 ${(amount && parseInt(amount) >= 10000 && !isProcessing) ? 'bg-green-600 hover:bg-green-700 active:scale-95' : 'bg-gray-300 cursor-not-allowed'}`}>Lanjutkan Pembayaran</button>
        </div>
      </div>
    );
  }

  // TAMPILAN 4: HOME DOMPET (Default)
  return (
    <div className="flex-1 bg-gray-50 absolute inset-0 z-50 flex flex-col animate-in slide-in-from-bottom-full duration-300">
      <div className="bg-green-600 p-4 text-white flex items-center gap-4 shadow-sm"><button onClick={onBack} className="hover:bg-green-700 p-1.5 rounded-full transition"><ArrowLeft className="h-6 w-6" /></button><h1 className="font-bold text-lg">{t('wallet_title')}</h1></div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="bg-gradient-to-br from-green-500 to-green-700 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
           <Wallet className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
           <p className="text-sm text-green-100 mb-1 relative z-10">{t('balance')}</p>
           <h2 className="text-3xl font-bold mb-6 relative z-10">Rp {new Intl.NumberFormat('id-ID').format(balance)}</h2>
           <button onClick={() => setView('topup')} className="relative z-10 w-full bg-white text-green-700 py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-green-50 active:scale-95 transition flex items-center justify-center gap-2">
             <PlusCircle className="w-5 h-5" /> {t('topup')}
           </button>
        </div>
        <div>
           <h3 className="font-bold text-gray-800 mb-3 text-sm">{t('history')}</h3>
           <div className="space-y-3">
             {transactions.length === 0 ? <p className="text-gray-400 text-sm text-center py-4">Belum ada transaksi</p> : null}
             {transactions.map((trx) => (
               <div key={trx.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-full ${trx.type === 'in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                     {trx.type === 'in' ? <ArrowUpRight className="w-5 h-5 rotate-45" /> : <ArrowUpRight className="w-5 h-5 -rotate-45" />}
                   </div>
                   <div><p className="font-bold text-sm text-gray-800">{trx.title}</p><p className="text-xs text-gray-500">{trx.date}</p></div>
                 </div>
                 <span className={`font-bold text-sm ${trx.type === 'in' ? 'text-green-600' : 'text-gray-800'}`}>
                   {trx.type === 'in' ? '+' : '-'} Rp {new Intl.NumberFormat('id-ID').format(trx.amount)}
                 </span>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
