import React from 'react';
import { ChevronLeft, ChevronRight, User, Lock, Globe, Bell, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SettingsScreen = () => {
  const navigate = useNavigate();
  const options = [
    { icon: User, label: 'Edit Profil', action: () => navigate('/edit-profile') },
    { icon: Lock, label: 'Ubah Kata Sandi', action: () => navigate('/change-password') },
    { icon: Globe, label: 'Bahasa', action: () => navigate('/language') },
    { icon: Bell, label: 'Notifikasi', action: () => navigate('/notifications') },
    { icon: Trash2, label: 'Hapus Akun', action: () => navigate('/delete-account') },
  ];
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white p-4 shadow-sm flex items-center">
        <button onClick={() => navigate(-1)} className="text-gray-700">
          <ChevronLeft size={24} />
        </button>
        <h2 className="flex-1 text-center font-bold text-lg">Pengaturan Akun</h2>
      </div>
      <div className="p-4">
        {options.map((opt, idx) => (
          <div
            key={idx}
            onClick={opt.action}
            className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <opt.icon size={20} className="text-gray-600" />
              <span className="text-gray-800">{opt.label}</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsScreen;
