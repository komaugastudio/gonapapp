import React, { useState, useContext } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { WalletContext } from '../../context/WalletContext';
import { formatRp } from '../../utils/format';

const PayScannerModal = ({ onClose }) => {
  const { balance, pay } = useContext(WalletContext);
  const [step, setStep] = useState('input'); 
  const [amount, setAmount] = useState('');

  const handlePay = async (e) => {
    e.preventDefault();
    const val = parseInt(amount.replace(/\D/g, ''));
    if (val > 0) {
      const isSuccess = await pay(val);
      if (isSuccess) {
        setStep('success');
        setTimeout(onClose, 1500); 
      } else {
        setStep('fail');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex flex-col justify-end">
      <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl p-6 relative animate-in slide-in-from-bottom duration-300 min-h-[50vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 rounded-full p-1"><X size={24} /></button>
        {step === 'success' ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <CheckCircle size={64} className="text-green-500 mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-gray-800">Pembayaran Berhasil!</h3>
            <p className="text-gray-500 mt-2">Pembayaran ke merchant telah selesai.</p>
            <p className="font-bold text-blue-600 text-xl mt-2">-{formatRp(amount)}</p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-6 text-gray-800 pt-2">Bayar Pembelanjaan</h3>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div>
                <p className="text-sm text-gray-500">Merchant Terdeteksi</p>
                <p className="font-bold text-lg">Waroeng Nabire Hebat</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Saldo Anda</p>
                <p className="font-bold text-blue-600">{formatRp(balance)}</p>
              </div>
            </div>
            {step === 'fail' && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">Saldo Anda tidak mencukupi untuk pembayaran ini.</div>}
            <form onSubmit={handlePay}>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nominal Pembayaran</label>
              <div className="flex items-center shadow-sm rounded-xl overflow-hidden mb-6 border border-gray-300 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500">
                <span className="px-4 text-gray-500 font-bold">Rp</span>
                <input type="text" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} placeholder="0" className="flex-1 py-3 outline-none text-gray-800 text-2xl font-bold" autoFocus />
              </div>
              <button type="submit" disabled={!amount || parseInt(amount) <= 0} className="w-full py-4 bg-green-600 text-white rounded-full font-bold shadow-md hover:bg-green-700 disabled:opacity-50">
                Konfirmasi & Bayar
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default PayScannerModal;