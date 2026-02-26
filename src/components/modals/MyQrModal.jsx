import React from 'react';
import { X, QrCode, User } from 'lucide-react';
import { auth } from '../../firebase';

const MyQrModal = ({ onClose }) => {
  const user = auth.currentUser;
  
  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex flex-col justify-center items-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative animate-in zoom-in-95 flex flex-col items-center text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 rounded-full p-1"><X size={24} /></button>
        <h3 className="text-lg font-bold text-gray-800 mb-1">Kode QR Saya</h3>
        <p className="text-sm text-gray-500 mb-6">Tunjukkan kode ini ke kasir untuk menerima dana atau membayar.</p>
        <div className="bg-white p-4 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.1)] mb-6 border border-gray-100">
          <QrCode size={200} className="text-gray-800" strokeWidth={1} />
        </div>
        <div className="bg-blue-50 w-full p-3 rounded-xl border border-blue-100 flex items-center justify-center space-x-2">
          <User size={18} className="text-blue-600" />
          <span className="font-bold text-blue-800">{user?.displayName || "Pengguna Nabire"}</span>
        </div>
      </div>
    </div>
  );
};

export default MyQrModal;