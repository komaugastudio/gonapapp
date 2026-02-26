import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, AlertCircle, History, ChevronRight, Tag, CreditCard, Settings, HelpCircle, LogOut, Mail } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, appId } from '../firebase';

const ProfileScreen = () => {
  const user = auth.currentUser;
  const [isVerified, setIsVerified] = useState(false);
  
  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) setIsVerified(snap.data().isVerified || false);
    });
    return () => unsub();
  }, [user]);

  const navigate = useNavigate();
  const handleLogout = () => signOut(auth);

  const menuItems = [
    { icon: History, label: 'Riwayat Pesanan', action: () => navigate('/history') },
    { icon: CreditCard, label: 'Metode Pembayaran', action: () => navigate('/wallet') },
    { icon: Tag, label: 'Voucher & Promo', action: () => navigate('/vouchers') },
    { icon: Settings, label: 'Pengaturan Akun', action: () => navigate('/settings') },
    { icon: HelpCircle, label: 'Bantuan & Dukungan', action: () => navigate('/help') },
    { icon: Mail, label: 'Hubungi Kami', action: () => window.location.href = 'mailto:support@gonab-app.com' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="bg-white p-6 pb-8 rounded-b-3xl shadow-sm border-b border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 pt-2">Profil Saya</h2>
        <div className="flex items-center space-x-4">
          {user?.photoURL ? <img src={user.photoURL} alt="Profil" className="w-16 h-16 rounded-full border border-gray-200 shadow-sm" /> : <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500"><User size={32} /></div>}
          <div>
            <h3 className="font-bold text-lg text-gray-800">{user?.displayName || "Pengguna Nabire"}</h3>
            <p className="text-sm text-gray-500 font-medium">{user?.phoneNumber || user?.email}</p>
            {isVerified ? <div className="mt-2 inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md"><Shield size={12} /><span>Terverifikasi</span></div> : <button className="mt-2 inline-flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-md border border-yellow-200 hover:bg-yellow-200 transition-colors"><AlertCircle size={12} /><span>Belum Verifikasi</span></button>}
          </div>
        </div>
      </div>
      <div className="px-4 mt-6 space-y-4 pb-24">
        {/* menu utama */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              onClick={item.action}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
            >
              <div className="flex items-center space-x-3">
                <item.icon size={20} className="text-gray-600" />
                <span className="font-medium text-gray-800">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </div>
          ))}
        </div>

        {/* tombol logout */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div onClick={handleLogout} className="p-4 flex items-center justify-center cursor-pointer text-red-600">
            <span className="font-bold flex items-center space-x-2"><LogOut size={20}/> <span>Keluar dari Akun</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;