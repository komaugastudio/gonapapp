import React, { useState } from 'react';
import { ChevronLeft, Camera, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const EditProfileScreen = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Implementasi update profile ke Firebase
      console.log('Profil disimpan:', { displayName, email });
      setShowSuccess(true);
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
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
        <h2 className="flex-1 text-center font-bold text-lg">Edit Profil</h2>
      </div>

      {showSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in">
          <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
            <CheckCircle className="w-5 h-5" />
            Profil berhasil diperbarui!
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Foto Profil */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profil" className="w-24 h-24 rounded-full border-4 border-gray-200" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-gray-200 flex items-center justify-center text-gray-500">
                <Camera size={32} />
              </div>
            )}
            <button className="absolute bottom-0 right-0 bg-green-600 p-2 rounded-full text-white hover:bg-green-700">
              <Camera size={16} />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Masukkan email"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full mt-6 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileScreen;
