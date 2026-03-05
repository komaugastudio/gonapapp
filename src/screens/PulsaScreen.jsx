import React, { useState, useContext } from 'react';
import { ChevronLeft, Smartphone, RefreshCw, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WalletContext } from '../context/WalletContext';
import { formatRp } from '../utils/format';
import { auth } from '../firebase';
import apiClient from '../services/apiClient';

const PulsaScreen = () => {
  const navigate = useNavigate();
  const { balance, addTransaction } = useContext(WalletContext);
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingBalance, setCheckingBalance] = useState(false);
  const [telkomselBalance, setTelkomselBalance] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpInput, setOtpInput] = useState('');

  const validatePhone = (num) => {
    // simple pattern: starts with 08, 10-13 digits total
    return /^08\d{8,11}$/.test(num.replace(/\s+/g, ''));
  };

  const handleCheckBalance = async () => {
    if (!phone) {
      setMessage('Masukkan nomor HP terlebih dahulu');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    if (!validatePhone(phone)) {
      setMessage('Format nomor HP tidak valid');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    setCheckingBalance(true);
    try {
      const response = await apiClient.get('/pulsa/check-balance', {
        params: { phoneNumber: phone }
      });
      if (response.data && response.data.balance !== null) {
        setTelkomselBalance(response.data.balance);
        setMessage(`Saldo Telkomsel: ${formatRp(response.data.balance)}`);
      } else {
        setMessage(response.data?.message || 'Gagal mengecek saldo');
        setTelkomselBalance(null);
      }
    } catch (error) {
      console.error('Error checking balance:', error);
      setMessage(error.response?.data?.message || 'Terjadi kesalahan saat mengecek saldo');
      setTelkomselBalance(null);
    }
    setCheckingBalance(false);
  };

  const handleBuy = async () => {
    const val = parseInt(amount, 10);
    if (!phone || !val || val <= 0) {
      setMessage('Nomor atau jumlah tidak valid');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    if (!validatePhone(phone)) {
      setMessage('Format nomor HP tidak valid');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    if (val % 1000 !== 0) {
      setMessage('Masukkan jumlah kelipatan 1000');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    if (val > 200000) {
      setMessage('Jumlah maksimum 200.000');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    if (balance < val) {
      setMessage('Saldo tidak cukup.');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    if (!otpSent) {
      // generate OTP and ask user to input
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpCode(code);
      setOtpSent(true);
      // in real app you would send code via SMS
      setMessage(`OTP dikirim: ${code}`);
      setTimeout(() => setMessage(''), 4000);
      return;
    }

    // OTP step
    if (otpInput !== otpCode) {
      setMessage('OTP salah');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setMessage('User tidak terautentikasi');
        setLoading(false);
        return;
      }

      // Call backend to purchase pulsa
      const response = await apiClient.post('/pulsa/buy', {
        phoneNumber: phone,
        amount: val,
      });

      if (response.data && response.data.pulsaId) {
        // Record transaction
        await addTransaction(
          'debit',
          val,
          'pulsa',
          `Beli pulsa ke ${phone}`,
          response.data.pulsaId
        );

        setMessage('Pulsa berhasil dibeli!');
        setPhone('');
        setAmount('');
        setOtpInput('');
        setOtpSent(false);
      } else {
        setMessage(response.data?.message || 'Transaksi gagal');
      }
    } catch (error) {
      console.error('Error buying pulsa:', error);
      setMessage(error.response?.data?.message || 'Terjadi kesalahan jaringan');
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white p-4 shadow-sm flex items-center">
        <button onClick={() => navigate(-1)} className="text-gray-700">
          <ChevronLeft size={24} />
        </button>
        <h2 className="flex-1 text-center font-bold text-lg">Pulsa & Paket Data</h2>
      </div>
      {message && (
        <div className="p-3 text-center bg-green-50 text-green-700">{message}</div>
      )}
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Nomor HP</label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="08XXXXXXXXXX"
              disabled={otpSent}
            />
            <button
              onClick={handleCheckBalance}
              disabled={checkingBalance || otpSent}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {telkomselBalance !== null && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
            <p className="text-sm text-gray-600">Saldo Telkomsel:</p>
            <p className="text-lg font-bold text-blue-600">{formatRp(telkomselBalance)}</p>
          </div>
        )}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Jumlah (Rp)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="10000"
            disabled={otpSent}
          />
        </div>
        {otpSent && (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Masukkan OTP</label>
            <input
              type="text"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="6 digit OTP"
            />
          </div>
        )}
        <div className="flex justify-between items-center">
          <span>Saldo: {formatRp(balance)}</span>
          <button
            onClick={handleBuy}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Memproses...
              </>
            ) : otpSent ? 'Konfirmasi OTP' : 'Beli'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PulsaScreen;
