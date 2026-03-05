import React, { useState, useContext } from 'react';
import { X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { WalletContext } from '../../context/WalletContext';
import { formatRp } from '../../utils/format';
import { auth } from '../../firebase';
import apiClient from '../../services/apiClient';

const PayScannerModal = ({ onClose }) => {
  const { balance, addTransaction } = useContext(WalletContext);
  const [step, setStep] = useState('input');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('Waroeng Nabire Hebat');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async (e) => {
    e.preventDefault();
    const val = parseInt(amount.replace(/\D/g, ''));
    
    if (val <= 0) {
      setError('Nominal harus lebih dari Rp 0');
      return;
    }

    if (val > balance) {
      setError('Saldo Anda tidak mencukupi');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError('User tidak terautentikasi');
        setIsLoading(false);
        return;
      }

      // Call backend to process payment
      const response = await apiClient.post('/payments', {
        amount: val,
        merchantName: merchant,
        paymentType: 'scan',
        description: `Pembayaran di ${merchant}`,
      });

      if (response.data && response.data.paymentId) {
        // Record transaction
        await addTransaction(
          'debit',
          val,
          'payment',
          `Pembayaran di ${merchant}`,
          response.data.paymentId
        );

        setStep('success');
        setTimeout(onClose, 2000);
      } else {
        setError(response.data?.message || 'Pembayaran gagal, silakan coba lagi');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Terjadi kesalahan: ' + err.message);
    } finally {
      setIsLoading(false);
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
            <p className="text-gray-500 mt-2">Pembayaran ke {merchant} telah selesai.</p>
            <p className="font-bold text-red-600 text-xl mt-4">-{formatRp(parseInt(amount.replace(/\D/g, '')))}</p>
            <p className="text-sm text-gray-500 mt-4">Saldo Anda: {formatRp(balance)}</p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-4 text-gray-800 pt-2">Bayar Pembelanjaan</h3>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm font-medium flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Merchant</p>
                <p className="font-bold text-gray-800">{merchant}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Saldo Anda</p>
                <p className={`font-bold ${balance >= parseInt(amount.replace(/\D/g, '') || 0) ? 'text-green-600' : 'text-red-600'}`}>
                  {formatRp(balance)}
                </p>
              </div>
            </div>

            <form onSubmit={handlePay}>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nominal Pembayaran</label>
              <div className="flex items-center shadow-sm rounded-xl overflow-hidden mb-4 border border-gray-300 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500">
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
                  className="flex-1 py-3 outline-none text-gray-800 text-2xl font-bold"
                  autoFocus
                  disabled={isLoading}
                />
              </div>

              {amount && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600">Sisa Saldo</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatRp(Math.max(0, balance - parseInt(amount.replace(/\D/g, '') || 0)))}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={!amount || parseInt(amount) <= 0 || isLoading}
                className="w-full py-4 bg-green-600 text-white rounded-full font-bold shadow-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3"
              >
                {isLoading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Konfirmasi & Bayar'
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 border border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default PayScannerModal;