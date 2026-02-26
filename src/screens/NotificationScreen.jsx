import React, { useState } from 'react';
import { ChevronLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const notificationOptions = [
  { id: 'promo', label: 'Notifikasi Promo', description: 'Terima notifikasi tentang penawaran spesial' },
  { id: 'order', label: 'Status Pesanan', description: 'Update status pesanan Anda' },
  { id: 'payment', label: 'Konfirmasi Pembayaran', description: 'Notifikasi saat transaksi berhasil' },
  { id: 'security', label: 'Keamanan Akun', description: 'Alert tentang aktivitas akun mencurigakan' },
];

const NotificationScreen = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    promo: true,
    order: true,
    payment: true,
    security: true,
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleNotification = (id) => {
    setNotifications((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSave = () => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    setShowSuccess(true);
    setTimeout(() => {
      navigate(-1);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white p-4 shadow-sm flex items-center">
        <button onClick={() => navigate(-1)} className="text-gray-700">
          <ChevronLeft size={24} />
        </button>
        <h2 className="flex-1 text-center font-bold text-lg">Notifikasi</h2>
      </div>

      {showSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in">
          <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
            <CheckCircle className="w-5 h-5" />
            Pengaturan berhasil disimpan!
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        {notificationOptions.map((opt) => (
          <div key={opt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-bold text-gray-800">{opt.label}</p>
              <p className="text-xs text-gray-500">{opt.description}</p>
            </div>
            <button
              onClick={() => toggleNotification(opt.id)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifications[opt.id] ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  notifications[opt.id] ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ))}

        <button
          onClick={handleSave}
          className="w-full mt-8 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700"
        >
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
};

export default NotificationScreen;
