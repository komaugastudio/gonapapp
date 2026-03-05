import React, { useState, useContext, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { WalletContext } from '../../context/WalletContext';
import { formatRp } from '../../utils/format';
import { auth } from '../../firebase';

const TopUpModal = ({ onClose }) => {
  const { balance, topUp } = useContext(WalletContext);
  const [amount, setAmount] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [method, setMethod] = useState('card');
  const [step, setStep] = useState('amount');

  const topUpMethods = [
    { id: 'card', name: 'Kartu Kredit', icon: '💳' },
    { id: 'bank_transfer', name: 'Transfer Bank', icon: '🏦' },
    { id: 'ewallet', name: 'E-Wallet', icon: '📱' },
  ];

  const handleTopUp = async (e) => {
    e.preventDefault();
    const val = parseInt(amount.replace(/\D/g, ''));
    if (val <= 0) {
      setError('Nominal harus lebih dari Rp 0');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError('User tidak terautentikasi');
      setIsLoading(false);
      return;
    }

    try {
      // Call backend to initiate payment
      const result = await topUp(val, method);
      
      if (result && result.redirectUrl) {
        // Redirect to Midtrans Snap
        if (window.snap) {
          window.snap.pay(result.token, {
            onSuccess: async (result) => {
              // Payment successful - update balance
              setIsSuccess(true);
              setTimeout(() => {
                onClose();
                // Refresh wallet balance
                window.location.reload();
              }, 2000);
            },
            onPending: (result) => {
              setError('Pembayaran sedang diproses');
              setIsLoading(false);
            },
            onError: (result) => {
              setError('Pembayaran gagal: ' + result?.status_message || 'Unknown error');
              setIsLoading(false);
            },
            onClose: () => {
              setError('Pembayaran dibatalkan');
              setIsLoading(false);
            }
          });
        } else {
          // Fallback: redirect directly to URL
          window.location.href = result.redirectUrl;
        }
      } else {
        setError('Gagal menginisiasi pembayaran. Pastikan backend berjalan.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Terjadi kesalahan: ' + err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex flex-col justify-end">
      <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl p-6 relative animate-in slide-in-from-bottom duration-300 min-h-[50vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 rounded-full p-1"><X size={24} /></button>
        
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <CheckCircle size={64} className="text-green-500 mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-gray-800">Top Up Berhasil!</h3>
            <p className="text-gray-500 mt-2">Saldo GonabPay Anda telah bertambah.</p>
            <p className="font-bold text-green-600 text-xl mt-4">+{formatRp(parseInt(amount.replace(/\D/g, '')))}</p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-6 text-gray-800 pt-2">Isi Saldo GonabPay</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm font-medium flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {step === 'amount' ? (
              <>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[20000, 50000, 100000].map(val => (
                    <button 
                      key={val} 
                      onClick={() => setAmount(val.toString())} 
                      className={`py-3 border rounded-xl font-semibold transition-all ${
                        amount === val.toString() 
                          ? 'bg-blue-100 border-blue-600 text-blue-600' 
                          : 'border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {formatRp(val).replace('Rp ', '')}
                    </button>
                  ))}
                </div>

                <form onSubmit={(e) => { e.preventDefault(); setStep('method'); }}>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Atau masukkan nominal</label>
                  <div className="flex items-center shadow-sm rounded-xl overflow-hidden mb-6 border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                    <span className="px-4 text-gray-500 font-bold">Rp</span>
                    <input 
                      type="text" 
                      value={amount} 
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setAmount(val);
                        setError('');
                      }} 
                      placeholder="0" 
                      className="flex-1 py-3 outline-none text-gray-800 text-xl font-bold" 
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={!amount || parseInt(amount) <= 0} 
                    className="w-full py-4 bg-blue-600 text-white rounded-full font-bold shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Lanjutkan
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Top Up</p>
                  <p className="text-3xl font-bold text-blue-600">{formatRp(parseInt(amount.replace(/\D/g, '')))}</p>
                </div>

                <h4 className="text-sm font-bold text-gray-800 mb-3">Pilih Metode Pembayaran</h4>
                <div className="space-y-2 mb-6">
                  {topUpMethods.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={`w-full p-3 border-2 rounded-lg text-left transition-all flex items-center gap-3 ${
                        method === m.id
                          ? 'bg-blue-50 border-blue-500'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <span className="text-2xl">{m.icon}</span>
                      <span className={method === m.id ? 'font-bold text-blue-600' : 'text-gray-700'}>{m.name}</span>
                    </button>
                  ))}
                </div>

                <form onSubmit={handleTopUp} className="space-y-3">
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-4 bg-blue-600 text-white rounded-full font-bold shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      `Lanjutkan ke Pembayaran`
                    )}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setStep('amount')}
                    className="w-full py-2 border border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Kembali
                  </button>
                </form>
              </>
            )}}
          </>
        )}
      </div>
    </div>
  );
};

export default TopUpModal;