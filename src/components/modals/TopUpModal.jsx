import React, { useState, useContext } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { WalletContext } from '../../context/WalletContext';
import { formatRp } from '../../utils/format';

const TopUpModal = ({ onClose }) => {
  const { topUp } = useContext(WalletContext);
  const [amount, setAmount] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleTopUp = async (e) => {
    e.preventDefault();
    const val = parseInt(amount.replace(/\D/g, ''));
    if (val > 0) {
      await topUp(val);
      setIsSuccess(true);
      setTimeout(onClose, 1500); 
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
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-6 text-gray-800 pt-2">Isi Saldo GonabPay</h3>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[20000, 50000, 100000].map(val => (
                <button key={val} onClick={() => setAmount(val.toString())} className="py-2 border border-blue-200 text-blue-600 rounded-xl font-semibold hover:bg-blue-50">
                  {formatRp(val).replace(',00', '')}
                </button>
              ))}
            </div>
            <form onSubmit={handleTopUp}>
              <label className="block text-sm font-bold text-gray-700 mb-2">Atau masukkan nominal</label>
              <div className="flex items-center shadow-sm rounded-xl overflow-hidden mb-6 border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <span className="px-4 text-gray-500 font-bold">Rp</span>
                <input type="text" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} placeholder="0" className="flex-1 py-3 outline-none text-gray-800 text-xl font-bold" />
              </div>
              <button type="submit" disabled={!amount || parseInt(amount) <= 0} className="w-full py-4 bg-blue-600 text-white rounded-full font-bold shadow-md hover:bg-blue-700 disabled:opacity-50">
                Top Up Sekarang
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default TopUpModal;