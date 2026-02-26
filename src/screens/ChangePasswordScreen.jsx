import React, { useState } from 'react';
import { ChevronLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

const ChangePasswordScreen = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChangePassword = async () => {
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Semua field harus diisi');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Kata sandi baru tidak cocok');
      return;
    }

    if (newPassword.length < 6) {
      setError('Kata sandi minimal 6 karakter');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      // Update password
      await updatePassword(user, newPassword);
      setShowSuccess(true);
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (err) {
      setError('Gagal mengubah kata sandi. Pastikan kata sandi saat ini benar.');
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
        <h2 className="flex-1 text-center font-bold text-lg">Ubah Kata Sandi</h2>
      </div>

      {showSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in">
          <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
            <CheckCircle className="w-5 h-5" />
            Kata sandi berhasil diubah!
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Kata Sandi Saat Ini</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Masukkan kata sandi saat ini"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Kata Sandi Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Masukkan kata sandi baru"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Konfirmasi Kata Sandi Baru</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Konfirmasi kata sandi baru"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="w-full mt-6 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Mengubah...' : 'Ubah Kata Sandi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordScreen;
