import React, { useState, useContext } from 'react';
import { ChevronLeft, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WalletContext } from '../context/WalletContext';
import { formatRp } from '../utils/format';
import { buyPulsa } from '../services/pulsaService';
import Toast from '../components/ui/Toast';

const PulsaScreen = () => {
  const navigate = useNavigate();
  const { balance, pay } = useContext(WalletContext);
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpInput, setOtpInput] = useState('');

  const validatePhone = (num) => {
    // simple pattern: starts with 08, 10-13 digits total
    return /^08\d{8,11}$/.test(num.replace(/\s+/g, ''));
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
      Toast(`OTP dikirim: ${code}`);
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
      // call backend purchase
      const res = await buyPulsa({ phone, amount: val });
      if (res.success) {
        const paid = await pay(val);
        if (paid) {
          setMessage('Pulsa berhasil dibeli!');
          setPhone('');
          setAmount('');
          setOtpInput('');
          setOtpSent(false);
        } else {
          setMessage('Saldo tidak cukup.');
        }
      } else {
        setMessage(res.message || 'Transaksi gagal');
      }
    } catch (error) {
      console.error(error);
      setMessage('Terjadi kesalahan jaringan');
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
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="08XXXXXXXXXX"
            disabled={otpSent}
          />
        </div>
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Memproses...' : otpSent ? 'Konfirmasi OTP' : 'Beli'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PulsaScreen;
