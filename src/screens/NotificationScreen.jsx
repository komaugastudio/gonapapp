import React, { useState, useEffect } from 'react';
import { ChevronLeft, Trash2, CheckCircle, Ticket, ShoppingBag, CreditCard, Shield, AlertCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationScreen = () => {
  const navigate = useNavigate();
  const [notificationList, setNotificationList] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    // Load notifications from localStorage or use default
    const savedNotifications = localStorage.getItem('notificationList');
    if (savedNotifications) {
      setNotificationList(JSON.parse(savedNotifications));
    } else {
      // Default notifications
      setNotificationList([
        {
          id: 1,
          type: 'promo',
          title: 'Diskon 50% GonabFood',
          description: 'Dapatkan diskon hingga 50% untuk semua menu makanan hari ini!',
          timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
          read: false,
        },
        {
          id: 2,
          type: 'order',
          title: 'Pesanan diterima',
          description: 'Pesanan Anda dari GonabMart sedang diproses.',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          read: false,
        },
        {
          id: 3,
          type: 'payment',
          title: 'Pembayaran Berhasil',
          description: 'Transaksi Rp 50.000 berhasil diproses ke GonabPay.',
          timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
          read: true,
        },
        {
          id: 4,
          type: 'promo',
          title: 'Bonus GonabPay',
          description: 'Isi saldo GonabPay dan dapatkan bonus hingga 20%!',
          timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
          read: true,
        },
      ]);
    }
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'promo':
        return <Ticket size={24} className="text-yellow-500" />;
      case 'order':
        return <ShoppingBag size={24} className="text-blue-500" />;
      case 'payment':
        return <CreditCard size={24} className="text-green-500" />;
      case 'security':
        return <Shield size={24} className="text-red-500" />;
      default:
        return <AlertCircle size={24} className="text-gray-500" />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins}m lalu`;
    if (diffHours < 24) return `${diffHours}h lalu`;
    if (diffDays < 7) return `${diffDays}d lalu`;
    return date.toLocaleDateString('id-ID');
  };

  const markAsRead = (id) => {
    const updated = notificationList.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotificationList(updated);
    localStorage.setItem('notificationList', JSON.stringify(updated));
  };

  const deleteNotification = (id) => {
    const updated = notificationList.filter(notif => notif.id !== id);
    setNotificationList(updated);
    localStorage.setItem('notificationList', JSON.stringify(updated));
    setDeleteSuccess(true);
    setTimeout(() => setDeleteSuccess(false), 2000);
  };

  const deleteAllNotifications = () => {
    setNotificationList([]);
    localStorage.setItem('notificationList', JSON.stringify([]));
    setDeleteSuccess(true);
    setTimeout(() => setDeleteSuccess(false), 2000);
  };

  const unreadCount = notificationList.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 shadow-sm flex items-center sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="text-gray-700 hover:bg-gray-100 p-1 rounded">
          <ChevronLeft size={24} />
        </button>
        <h2 className="flex-1 text-center font-bold text-lg">Notifikasi</h2>
        <div className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
          {unreadCount} baru
        </div>
      </div>

      {deleteSuccess && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in">
          <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
            <CheckCircle className="w-5 h-5" />
            Notifikasi dihapus
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {notificationList.length > 0 ? (
          <>
            {notificationList.map((notification) => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md ${
                  notification.read
                    ? 'bg-white border-gray-200'
                    : 'bg-blue-50 border-blue-500 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <p className={`font-bold text-sm ${notification.read ? 'text-gray-800' : 'text-gray-900'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {notification.description}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                      <Clock size={12} />
                      {formatTime(notification.timestamp)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="flex-shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {notificationList.length > 2 && (
              <button
                onClick={deleteAllNotifications}
                className="w-full mt-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                Hapus Semua Notifikasi
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-600 font-semibold">Tidak ada notifikasi</p>
            <p className="text-xs text-gray-500 mt-1">Semua notifikasi akan muncul di sini</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationScreen;
