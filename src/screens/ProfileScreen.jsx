import React, { useState } from 'react';
import { 
  ArrowLeft, Camera, Award, User, ChevronRight, MapPin, 
  Shield, HelpCircle, Settings, ClipboardList, LogOut, 
  Save, BellRing, Globe 
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const ProfileScreen = () => {
  const user = auth.currentUser;
  const [isVerified, setIsVerified] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  
  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) setIsVerified(snap.data().isVerified || false);
    });
    return () => unsub();
  }, [user]);

  const handleLogout = () => signOut(auth);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="bg-white p-6 pb-8 rounded-b-3xl shadow-sm border-b border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 pt-2">Profil Saya</h2>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500"><User size={32} /></div>
          <div>
            <h3 className="font-bold text-lg">{user?.displayName || "Pengguna Nabire"}</h3>
            <p className="text-sm text-gray-500">{user?.phoneNumber || user?.email}</p>
            {isVerified ? (
              <div className="mt-2 inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md"><Shield size={12} /><span>Terverifikasi</span></div>
            ) : (
              <button className="mt-2 text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-md">Belum Verifikasi</button>
            )}
          </div>
        </div>
      </div>
      <div className="px-4 mt-6 space-y-4 pb-24">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div onClick={handleLogout} className="p-4 flex items-center justify-center cursor-pointer text-red-600"><LogOut size={20} className="mr-2"/><span>Keluar dari Akun</span></div>
        </div>
      </div>
    </div>
  );
};