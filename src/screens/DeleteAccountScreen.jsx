import React, { useState } from 'react';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

const DeleteAccountScreen = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteAccount = async () => {
    if (!password) {
      setError('Masukkan kata sandi untuk konfirmasi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      // Delete user account
      await deleteUser(user);
      alert('Akun Anda telah dihapus secara permanen');
      navigate('/login');
    } catch (err) {
      setError('Gagal menghapus akun. Pastikan kata sandi benar.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white p-4 shadow-sm flex items-center">
        <button onClick={() => navigate(-1)} className="text-gray-700">
          <ChevronLeft size={24} />
        </button>
        <h2 className="flex-1 text-center font-bold text-lg">Hapus Akun</h2>
      </div>

      <div className="p-6">
        {step === 1 ? (
          <>
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-800 mb-2">Perhatian!</p>
                  <p className="text-sm text-red-700">
                    Menghapus akun Anda akan menghapus semua data secara permanen. Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-800">Data yang akan dihapus:</h3>
              <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                <li>Profile akun</li>
                <li>Riwayat pesanan</li>
                <li>Wallet & saldo</li>
                <li>Voucher & promo</li>
              </ul>
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={() => setStep(2)}
                className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700"
              >
                Saya Ingin Menghapus Akun
              </button>
              <button
                onClick={() => navigate(-1)}
                className="w-full bg-gray-200 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-300"
              >
                Batal
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-6">
              Untuk menghapus akun Anda, masukkan kata sandi untuk konfirmasi:
            </p>

            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Kata Sandi</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Masukkan kata sandi Anda"
                disabled={loading}
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Menghapus...' : 'Hapus Akun Permanen'}
              </button>
              <button
                onClick={() => setStep(1)}
                className="w-full bg-gray-200 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-300"
              >
                Kembali
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeleteAccountScreen;
